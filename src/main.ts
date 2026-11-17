import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { difficultyAt, DIFFICULTY_LABELS, GAME_RULES, type Difficulty } from './game/config';
import { DesktopInput } from './input/desktop';
import { readXRFrame } from './input/xr';
import { sphereContact } from './game/collisions';
import { advanceActiveTime, createGameState, resolveChallenge, type GameState } from './game/state';
import { readRecord, saveRecord } from './storage';
import { GameAudio } from './view/audio';
import './view/style.css';

type Phase = 'intro' | 'playing' | 'paused' | 'over';
type Kind = 'red' | 'blue' | 'gold';
type Challenge = { kind: Kind; mesh: THREE.Mesh; age: number; resolved: boolean; id: number; speed: number; direction: THREE.Vector3 };

const host = document.querySelector<HTMLDivElement>('#canvas-host')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const hud = document.querySelector<HTMLDivElement>('#hud')!;
const overlay = document.querySelector<HTMLDivElement>('#overlay')!;
const nextWarning = document.querySelector<HTMLDivElement>('#next-warning')!;
const startButton = document.querySelector<HTMLButtonElement>('#start-button')!;
const panel = document.querySelector<HTMLElement>('.panel')!;
const difficultySelect = document.querySelector<HTMLSelectElement>('#difficulty-select')!;
const vignette = document.querySelector<HTMLDivElement>('#low-life-vignette')!;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#080b1a');
scene.fog = new THREE.FogExp2('#080b1a', 0.035);
const camera = new THREE.PerspectiveCamera(85, innerWidth / innerHeight, 0.1, 80);
camera.position.set(0, 1.62, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.append(renderer.domElement);

scene.add(new THREE.HemisphereLight('#9baeff', '#15102b', 2.1));
const keyLight = new THREE.PointLight('#8468ff', 28, 12);
keyLight.position.set(0, 2.8, -3.6);
scene.add(keyLight);

const arena = new THREE.Group();
scene.add(arena);
const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 64), new THREE.MeshStandardMaterial({ color: '#11152b', metalness: 0.45, roughness: 0.55, side: THREE.DoubleSide }));
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, -1.5);
arena.add(floor);
const grid = new THREE.GridHelper(8, 24, '#6251c8', '#25315a');
grid.position.set(0, 0.012, -1.5);
arena.add(grid);
const windowFrame = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.045, 12, 96), new THREE.MeshStandardMaterial({ color: '#6766ff', emissive: '#3935be', emissiveIntensity: 1.4, metalness: 0.5 }));
windowFrame.position.set(0, 2.3, -5.3);
arena.add(windowFrame);
const stars = new THREE.BufferGeometry();
const starPoints = Array.from({ length: 320 }, () => new THREE.Vector3((Math.random() - 0.5) * 15, Math.random() * 8, -8 - Math.random() * 22));
stars.setFromPoints(starPoints);
const starField = new THREE.Points(stars, new THREE.PointsMaterial({ color: '#c2c9ff', size: 0.035 }));
scene.add(starField);

const hands: THREE.Group[] = [];
for (const side of [-1, 1]) {
  const group = new THREE.Group();
  const shield = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16), new THREE.MeshPhysicalMaterial({ color: '#72e5ff', emissive: '#1c8dff', emissiveIntensity: 0.55, transparent: true, opacity: 0.34, roughness: 0.15, metalness: 0.15, side: THREE.DoubleSide }));
  shield.scale.set(1, 1, 0.1);
  group.add(shield);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.008, 8, 32), new THREE.MeshBasicMaterial({ color: '#9df5ff' }));
  group.add(rim);
  group.position.set(side * 0.34, 1.24, -0.55);
  scene.add(group);
  hands.push(group);
}

const lowLifeMaterial = new THREE.ShaderMaterial({
  transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
  uniforms: { intensity: { value: 0 } },
  vertexShader: 'varying vec2 uvPoint; void main(){ uvPoint=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: 'uniform float intensity; varying vec2 uvPoint; void main(){ vec2 p=(uvPoint-0.5)*2.0; float edge=smoothstep(0.68,1.08,length(p)); gl_FragColor=vec4(0.85,0.035,0.07,edge*intensity); }',
});
const lowLifePlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lowLifeMaterial);
lowLifePlane.renderOrder = 10000;
lowLifePlane.position.set(0, 0, -0.22);
camera.add(lowLifePlane);
const audio = new GameAudio();

const colors: Record<Kind, number> = { red: 0xff315b, blue: 0x42caff, gold: 0xffd45a };
let challenges: Challenge[] = [];
let phase: Phase = 'intro';
let game: GameState | null = null;
let spawnClock = 0;
let actionRecovery = 0;
let nextId = 0;
const desktop = new DesktopInput();
const head = new THREE.Vector3(0, 1.62, 0);
const headRotation = new THREE.Quaternion();
let introIndex = 0;
let challengeBag: Kind[] = [];
let lastChallenge: Kind | null = null;
let resumeAt = 0;
let pausedHead: THREE.Vector3 | null = null;
let pausedHeadRotation: THREE.Quaternion | null = null;
let pausedHands: [THREE.Vector3, THREE.Vector3] | null = null;
let pausedHandRotations: [THREE.Quaternion, THREE.Quaternion] | null = null;
let lastFrame = performance.now();
let xrWasActive = false;

function updateHud() {
  if (!game) return;
  hud.textContent = `${DIFFICULTY_LABELS[game.difficulty]} · ✦ ${game.score} pontos · ♥ ${game.lives} · NÍVEL ${game.level} · ${game.progress}/${game.target}`;
  vignette.hidden = !(game.phase === 'playing' && game.lives === 1 && !renderer.xr.isPresenting);
  lowLifeMaterial.uniforms.intensity.value = game.phase === 'playing' && game.lives === 1 && renderer.xr.isPresenting ? 0.1 : 0;
}
function showOverlay(title: string, detail: string, action: string) {
  overlay.hidden = false;
  overlay.innerHTML = `<div class="overlay-card"><h2>${title}</h2><p>${detail}</p><button id="overlay-action" class="primary">${action}</button></div>`;
  overlay.querySelector('button')?.addEventListener('click', () => {
    if (phase === 'paused') resumeGame();
    else startGame();
  }, { once: true });
}
function showEndOverlay(detail: string) {
  overlay.hidden = false;
  overlay.innerHTML = `<div class="overlay-card"><h2>Fim de treino</h2><p>${detail}</p><div class="actions"><button id="restart-action" class="primary">Jogar novamente</button><button id="mode-action" class="secondary">Escolher modo</button></div></div>`;
  overlay.querySelector('#restart-action')?.addEventListener('click', startGame, { once: true });
  overlay.querySelector('#mode-action')?.addEventListener('click', () => {
    phase = 'intro'; game = null; overlay.hidden = true; panel.hidden = false; hud.hidden = true;
    vignette.hidden = true; lowLifeMaterial.uniforms.intensity.value = 0; updateMenuRecord();
  }, { once: true });
}
function clearChallenges() {
  for (const challenge of challenges) removeMesh(challenge.mesh);
  challenges = [];
}
function removeMesh(mesh: THREE.Mesh) {
  scene.remove(mesh);
  mesh.geometry.dispose();
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  materials.forEach(material => material.dispose());
}
function startGame() {
  clearChallenges();
  lastFrame = performance.now();
  phase = 'playing';
  game = createGameState(difficultySelect.value as Difficulty, renderer.xr.isPresenting ? 'vr' : 'desktop');
  spawnClock = -0.8;
  actionRecovery = 0;
  introIndex = 0; challengeBag = []; lastChallenge = null; desktop.reset();
  void audio.unlock();
  panel.hidden = true;
  overlay.hidden = true;
  hud.hidden = false;
  status.textContent = 'Desvie, bloqueie e toque nos alvos. Volte ao centro entre ações.';
  updateHud();
}
function resumeGame() {
  if (performance.now() < resumeAt) return;
  if (renderer.xr.isPresenting && pausedHead && pausedHeadRotation && pausedHands && pausedHandRotations) {
    const movedHead = pausedHead.distanceTo(head) > GAME_RULES.resumePositionTolerance || pausedHeadRotation.angleTo(headRotation) > GAME_RULES.resumeRotationToleranceRadians;
    const movedHands = hands.some((hand, index) => pausedHands![index]!.distanceTo(hand.position) > GAME_RULES.resumePositionTolerance || pausedHandRotations![index]!.angleTo(hand.quaternion) > GAME_RULES.resumeRotationToleranceRadians);
    if (movedHead || movedHands) {
      clearChallenges();
      pausedHead = head.clone(); pausedHeadRotation = headRotation.clone();
      pausedHands = [hands[0]!.position.clone(), hands[1]!.position.clone()];
      pausedHandRotations = [hands[0]!.quaternion.clone(), hands[1]!.quaternion.clone()];
      resumeAt = performance.now() + 3000;
      status.textContent = 'Posição alterada. Reposicione-se no centro e confirme novamente.';
      const button = overlay.querySelector('button');
      if (button) {
        button.disabled = true; button.textContent = 'Recentralize · 3 s';
        window.setTimeout(() => { button.disabled = false; button.textContent = 'Retomar'; }, 3000);
      }
      return;
    }
  }
  lastFrame = performance.now();
  desktop.reset();
  if (game) game.phase = 'playing';
  phase = 'playing'; spawnClock = -0.4; overlay.hidden = true; status.textContent = 'Pronto? Os desafios vão recomeçar.';
  updateHud();
}
function pauseGame(message = 'Jogo pausado', discardChallenges = false) {
  if (phase !== 'playing') return;
  phase = 'paused';
  if (game) game.phase = 'paused';
  if (renderer.xr.isPresenting) {
    pausedHead = head.clone(); pausedHeadRotation = headRotation.clone();
    pausedHands = [hands[0]!.position.clone(), hands[1]!.position.clone()];
    pausedHandRotations = [hands[0]!.quaternion.clone(), hands[1]!.quaternion.clone()];
  } else {
    pausedHead = null; pausedHeadRotation = null; pausedHands = null; pausedHandRotations = null;
  }
  desktop.reset(); resumeAt = performance.now() + 3000;
  if (discardChallenges) clearChallenges();
  nextWarning.hidden = true;
  updateHud();
  showOverlay(message, 'Reposicione-se no centro. A rodada continua após a contagem.', 'Retomar em 3 s');
  let n = 3;
  const button = overlay.querySelector('button');
  if (button) {
    button.disabled = true;
    const tick = () => {
      n -= 1;
      if (n <= 0) { button.disabled = false; button.textContent = 'Retomar'; }
      else { button.textContent = `Retomar em ${n} s`; window.setTimeout(tick, 1000); }
    };
    window.setTimeout(tick, 1000);
  }
}
function endGame() {
  phase = 'over';
  nextWarning.hidden = true;
  if (game) {
    game.phase = 'over';
    const { best, persisted } = saveRecord(game.control, game.difficulty, game.score);
    const suffix = persisted ? '' : ' · recorde desta sessão';
    clearChallenges(); hud.hidden = true;
    showEndOverlay(`${DIFFICULTY_LABELS[game.difficulty]} · ${game.score} pontos · nível ${game.level} · recorde ${best}${suffix}`);
  }
  vignette.hidden = true;
  lowLifeMaterial.uniforms.intensity.value = 0;
  status.textContent = 'Boa sessão. Respire e recentralize antes de jogar outra vez.';
}
function createChallenge(kind: Kind) {
  const material = new THREE.MeshStandardMaterial({ color: colors[kind], emissive: colors[kind], emissiveIntensity: kind === 'gold' ? 0.65 : 0.95, metalness: 0.2, roughness: 0.3 });
  const geometry = kind === 'red' ? new THREE.OctahedronGeometry(0.11, 0) : kind === 'blue' ? new THREE.IcosahedronGeometry(0.07, 1) : new THREE.TorusGeometry(0.065, 0.015, 12, 36);
  const mesh = new THREE.Mesh(geometry, material);
  const x = kind === 'gold' ? (Math.random() - 0.5) * 0.4 : head.x;
  mesh.position.set(x, kind === 'gold' ? head.y - 0.25 : head.y, kind === 'gold' ? -0.35 : head.z - 2.4);
  const direction = head.clone().sub(mesh.position).normalize();
  scene.add(mesh);
  const { projectileSpeed } = difficultyAt(game?.difficulty ?? 'medium', game?.level ?? 1);
  challenges.push({ kind, mesh, age: 0, resolved: false, id: nextId++, speed: projectileSpeed, direction });
}
function resolve(challenge: Challenge, result: 'hit' | 'miss' | 'block' | 'touch') {
  if (challenge.resolved || phase !== 'playing' || !game) return;
  challenge.resolved = true;
  if (challenge.kind !== 'gold') actionRecovery = GAME_RULES.recoverySeconds;
  const previousScore = game.score;
  const events = resolveChallenge(game, challenge.id, challenge.kind, result);
  removeMesh(challenge.mesh);
  challenges = challenges.filter(item => item !== challenge);
  events.forEach(event => {
    if (event.type === 'life-lost') audio.play('life-lost');
    if (event.type === 'level-up') audio.play('level-up');
  });
  if (game.score > previousScore && !events.some(event => event.type === 'level-up')) audio.play('hit');
  updateHud();
  if (game.phase === 'over') endGame();
}
function nextChallengeKind(): Kind {
  if (introIndex < GAME_RULES.initialChallengeSequence.length) return GAME_RULES.initialChallengeSequence[introIndex]!;
  if (challengeBag.length === 0) {
    challengeBag = (['red', 'blue', 'gold'] as Kind[]).sort(() => Math.random() - 0.5);
    if (challengeBag[0] === lastChallenge) challengeBag.push(challengeBag.shift()!);
  }
  return challengeBag[0]!;
}
function spawn() {
  const kind = nextChallengeKind();
  if (introIndex < GAME_RULES.initialChallengeSequence.length) introIndex += 1;
  else challengeBag.shift();
  lastChallenge = kind;
  createChallenge(kind);
}

function updateMenuRecord() {
  const mode = difficultySelect.value as Difficulty;
  const type = renderer.xr.isPresenting ? 'vr' : 'desktop';
  status.textContent = `Recorde ${DIFFICULTY_LABELS[mode]} · ${type === 'vr' ? 'VR' : 'computador'}: ${readRecord(type, mode)} pontos. Escolha a dificuldade e comece.`;
}

difficultySelect.addEventListener('change', updateMenuRecord);
startButton.addEventListener('click', startGame);
const xrEntry = VRButton.createButton(renderer, {
  requiredFeatures: ['local-floor'],
  optionalFeatures: ['bounded-floor', 'dom-overlay'],
  domOverlay: { root: document.body },
});
xrEntry.classList.add('xr-entry');
document.querySelector('#vr-button')?.replaceWith(xrEntry);
function localizeXRButton() {
  if (renderer.xr.isPresenting) xrEntry.textContent = 'Sair do VR';
  else if (xrEntry.textContent.toUpperCase().includes('NOT SUPPORTED')) xrEntry.textContent = 'VR indisponível neste navegador';
  else xrEntry.textContent = 'Entrar em VR';
}
new MutationObserver(localizeXRButton).observe(xrEntry, { childList: true, characterData: true, subtree: true });
localizeXRButton();
renderer.xr.addEventListener('sessionstart', () => {
  void audio.unlock();
  const session = renderer.xr.getSession();
  session?.addEventListener('select', () => {
    if (phase === 'playing') pauseGame();
    else if (phase === 'paused') resumeGame();
  });
  if (phase === 'intro' || phase === 'over') startGame();
  else updateHud();
  status.textContent = 'VR ativo. Identifique as duas mãos e confirme o centro.';
});
renderer.xr.addEventListener('sessionend', () => { if (phase === 'playing') pauseGame('Sessão VR encerrada', true); });

window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  desktop.key(event.key, true);
  if (event.key === 'Escape') phase === 'playing' ? pauseGame() : phase === 'paused' && resumeGame();
});
window.addEventListener('keyup', (event) => desktop.key(event.key, false));
renderer.domElement.addEventListener('pointermove', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  if (!renderer.xr.isPresenting) desktop.pointAt(((event.clientX - rect.left) / rect.width) * 2 - 1, 1 - ((event.clientY - rect.top) / rect.height) * 2, camera);
});
window.addEventListener('blur', () => pauseGame('Treino suspenso', true));
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame('Treino suspenso', true); });

renderer.setAnimationLoop((_timestamp, xrFrame) => {
  const now = performance.now();
  const rawDelta = Math.max(0, (now - lastFrame) / 1000);
  lastFrame = now;
  const dt = Math.min(rawDelta, 0.05);
  const inXR = renderer.xr.isPresenting;
  const previousHead = head.clone();
  const previousHands = hands.map(hand => hand.position.clone());
  if (xrWasActive && !inXR && phase === 'playing') pauseGame('Sessão VR interrompida', true);
  xrWasActive = inXR;

  if (!inXR) {
    camera.position.x += (desktop.headOffset - camera.position.x) * Math.min(1, dt * 8);
    head.copy(camera.position);
    hands.forEach((hand, index) => hand.position.copy(desktop.hands[index]!));
  } else if (xrFrame) {
    const sample = readXRFrame(xrFrame, renderer.xr);
    if (sample) {
      head.copy(sample.head);
      headRotation.copy(sample.headRotation);
      hands.forEach((hand, index) => {
        hand.position.copy(sample.hands[index]!);
        hand.quaternion.copy(sample.rotations[index]!);
        hand.visible = sample.trackingValid;
      });
      if (!sample.trackingValid && phase === 'playing') {
        pauseGame(`Controle ${sample.missingHands.join(' e ')} sem rastreamento`, true);
      }
    } else if (phase === 'playing') pauseGame('Rastreamento VR interrompido', true);
  }

  if (phase === 'playing' && game) {
    if (rawDelta > 0.25 || !advanceActiveTime(game, dt)) {
      pauseGame('Treino suspenso', true);
      renderer.render(scene, camera);
      return;
    }
    spawnClock += dt;
    actionRecovery = Math.max(0, actionRecovery - dt);
    const { challengeInterval: interval } = difficultyAt(game.difficulty, game.level);
    const encounterReady = challenges.length === 0 && actionRecovery === 0;
    if (spawnClock >= interval && encounterReady && challenges.length < GAME_RULES.maximumActiveChallenges) { spawn(); spawnClock = 0; nextWarning.hidden = true; }
    else if (spawnClock >= interval && !encounterReady) { spawnClock = 0; nextWarning.hidden = true; }
    else if (spawnClock >= interval - GAME_RULES.challengeWarningSeconds && encounterReady && challenges.length < GAME_RULES.maximumActiveChallenges) {
      const kind = nextChallengeKind();
      const names: Record<Kind, string> = { red: 'Vermelho — desvie', blue: 'Azul — bloqueie ou desvie', gold: 'Dourado — toque se quiser' };
      nextWarning.textContent = names[kind]; nextWarning.hidden = false;
    }
    for (const challenge of [...challenges]) {
      challenge.age += dt;
      challenge.mesh.rotation.x += dt * 0.8;
      challenge.mesh.rotation.y += dt * 1.1;
      const previous = challenge.mesh.position.clone();
      if (challenge.kind === 'gold') {
        if (hands.some((hand, index) => sphereContact(previous, challenge.mesh.position, previousHands[index]!, hand.position, 0.13) !== null)) resolve(challenge, 'touch');
        else if (challenge.age > 1.2) resolve(challenge, 'miss');
      } else {
        challenge.mesh.position.addScaledVector(challenge.direction, challenge.speed * dt);
        const hit = sphereContact(previous, challenge.mesh.position, previousHead, head, 0.18);
        const blockTimes = hands.map((hand, index) => sphereContact(previous, challenge.mesh.position, previousHands[index]!, hand.position, 0.22)).filter((time): time is number => time !== null);
        const block = challenge.kind === 'blue' && blockTimes.length ? Math.min(...blockTimes) : null;
        if (block !== null && (hit === null || block <= hit)) resolve(challenge, 'block');
        else if (hit !== null) resolve(challenge, 'hit');
        else if (challenge.mesh.position.z > head.z + 0.3) resolve(challenge, 'miss');
      }
    }
    updateHud();
  }
  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  const height = 0.44;
  lowLifePlane.scale.set(height * camera.aspect, height, 1);
});

const initialPlaneHeight = 2 * 0.22 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
lowLifePlane.scale.set(initialPlaneHeight * camera.aspect, initialPlaneHeight, 1);
updateMenuRecord();


if (!navigator.xr) status.textContent = 'WebXR será habilitado em HTTPS ou localhost. O modo de computador funciona neste navegador.';
