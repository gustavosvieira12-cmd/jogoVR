# Teste de Reflexos

Jogo de reflexos em português para navegador de computador e Meta Quest, desenvolvido com TypeScript, Three.js, WebXR e Vite.

## Executar no computador

Não abra `index.html` diretamente. Ele precisa do servidor Vite para carregar os módulos do jogo.

```sh
npm ci
npm run dev
```

Mantenha o terminal aberto e acesse no navegador a URL `localhost` que o Vite imprimir. No menu, escolha Fácil, Médio, Difícil ou Impossível e pressione **Começar no computador**.

Controles do computador:

- **A/D:** inclinar para os lados. Solte para voltar ao centro.
- **Mouse:** mover a mão selecionada.
- **1/2:** escolher a mão esquerda ou direita.
- **Esc:** pausar e, depois da contagem, retomar.

## Regras atuais

A rodada começa com três vidas, zero pontos e nível 1. Os desafios válidos dão +3 ao esquivar do vermelho, +2 ao bloquear o azul e +1 ao tocar no dourado. O primeiro avanço exige 6 pontos. Depois as metas por nível são 9, 12, 15 e assim por diante. Pontos excedentes seguem para o nível seguinte. Cada modo tem sua própria curva de velocidade e intervalo. Os recordes ficam separados por dificuldade e por tipo de controle.

Perder uma vida toca um sinal grave. Subir de nível toca três notas ascendentes. Com uma vida, aparece uma borda vermelha suave no computador e um efeito renderizado no headset. O aviso preserva o painel central.

## Verificar e gerar o pacote

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

## Andamento da execução

- Implementados os quatro modos e curvas indicativas P01, metas sem limite por pontos, preservação de excedente, sequência inicial, pausa, feedback de evento, indicação de última vida e persistência local das oito categorias.
- Verificados em 09/11/2026: `npm run typecheck`, `npm test` (34 casos) e `npm run build`. O navegador do computador carregou a partida, aceitou a seleção de modo e mostrou o HUD numa execução anterior desta versão integrada. A reconexão após as últimas alterações XR expirou, então a inspeção final pelo navegador ficou pendente. Os eventos que disparam os sons e os estados do jogo são testados deterministicamente. A audição real e o visor XR ainda não foram testados.
- **Publicação:** código-fonte e documentação versionados no GitHub. O build local fica em `dist/`; a publicação de uma versão jogável por HTTPS ainda depende de escolher um host (P08).
- **Pendente no Quest:** entrada XR, poses, conforto e áudio/visão binocular no aparelho real (P09). As recomendações de dificuldade e borda são valores iniciais de calibração, não medidas aprovadas no hardware.
