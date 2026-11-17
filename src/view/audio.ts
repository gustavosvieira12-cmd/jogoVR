export type SoundEvent = 'hit' | 'life-lost' | 'level-up';

export class GameAudio {
  private context: AudioContext | undefined;

  async unlock() {
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') await this.context.resume();
    } catch {
      this.context = undefined;
    }
  }

  play(event: SoundEvent) {
    const context = this.context;
    if (!context || context.state !== 'running') return;
    const now = context.currentTime;
    const notes = event === 'life-lost' ? [220, 147] : event === 'level-up' ? [523, 659, 784] : [740];
    notes.forEach((frequency, index) => {
      const start = now + index * 0.105;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = event === 'life-lost' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(event === 'hit' ? 0.045 : 0.075, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (event === 'hit' ? 0.11 : 0.17));
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.18);
    });
  }
}
