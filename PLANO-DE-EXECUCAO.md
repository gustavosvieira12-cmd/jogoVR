# Plano de execução — jogo de reflexos em VR para Meta Quest

**Entregável final do projeto:** um jogo em português que o aluno abre por um link HTTPS no navegador do Quest da escola. Ele usa dois controles para bloquear e tocar, e inclina o corpo para desviar. A mesma lógica deve poder ser exercitada no computador de casa durante o desenvolvimento.

**Plano aprovado em 7 de novembro de 2026.** O aluno aprovou D1 a D9 integralmente. Execute T01–T10 usando as decisões registradas ao final deste documento. Os valores iniciais de alcance, ritmo e desempenho servem à calibração. Registre os valores medidos no Quest e justifique eventuais ajustes.

## 1. Contexto e visão geral

Uma pessoa desenvolverá o trabalho, com internet em casa e na escola, experiência prévia em programação e acesso ocasional ao Quest. A escola exige um jogo VR e liberou o tema. Não há prazo fixo nem relatório escolar obrigatório. A prioridade é chegar cedo a uma partida divertida e testável. O jogador pode ficar na mesma posição central durante a rodada. Um pequeno passo lateral é aceitável. Nenhum desafio exige caminhar pelo cenário, ultrapassar três passos, saltar, ajoelhar, virar de costas ou alcançar algo fora do comprimento dos braços.

### 1.1 Regras definidas para a primeira versão

| ID | Requisito | Consequência observável |
|---|---|---|
| R01 | TypeScript + Three.js + WebXR, com Vite. Execução no navegador. | O link abre uma página com entrada em VR. A demonstração no Quest dispensa instalar um aplicativo do jogo. |
| R02 | Uma arena de treinamento futurista, escura, em azul e roxo, com janela para o espaço. | Perigos e alvos se distinguem do fundo por silhueta e cor. Escudos transparentes, impacto breve e sons distintos. Robô com falas fica para depois. |
| R03 | Duas mãos representadas pelos controles físicos, um escudo por mão. | Qualquer mão pode bloquear ou tocar. As três ações de jogo dispensam apertar botões. |
| R04 | Vermelho com pontas exige desvio. | Se atingir a cabeça, −1 vida. Se o jogador deixar passar, +3. Atravessa ambos os escudos. A direção fica fixa após mirar a cabeça no lançamento. |
| R05 | Projétil de energia azul pode ser bloqueado ou evitado. | Interceptar com um escudo dá +2. Desviar dá 0. Atingir a cabeça tira 1 vida. |
| R06 | Anel dourado é opcional e fica ao alcance. | Contato com qualquer mão dá +1. Expirar ou passar dá 0 pontos e 0 dano. |
| R07 | Partida individual, três vidas, placar inicial zero, nível inicial 1. | O terceiro dano encerra a rodada. Não há limite de duração nem multiplicador de pontos. Cada objeto resolve uma vez. |
| R08 | Dificuldade aumenta a cada 30 s de jogo ativo. | Crescem a velocidade e a frequência dos lançamentos, até limites. A janela para tocar o anel permite alcance mesmo nos níveis altos. |
| R09 | Todos os desafios surgem à frente, com tempo para reagir e voltar ao centro. | Ficar em um canto não gera desvios automáticos repetidos. A arena evita sequências de ações incompatíveis. |
| R10 | Confirmação do centro, instruções curtas, pontos, vidas, nível, pausa e reinício. | Sair do VR interrompe a evolução da partida. A tela final apresenta pontuação, recorde local e ação para jogar de novo. |
| R11 | Desenvolvimento e testes em casa, verificação física na escola. | Teclado e mouse permitem exercitar o jogo. Emulação WebXR exercita as entradas XR. A confirmação de conforto, alcance e desempenho depende de teste real no Quest. |

### 1.2 Curva inicial acordada para testes

Use segundos para o tempo ativo e metros para as distâncias. Para `t` segundos de partida ativa, calcule:

```text
nivel = 1 + floor(t / 30)
velocidadeDosProjeteis = min(3.5, 1.5 + 0.2 * (nivel - 1))  [m/s]
intervaloEntreDesafios = max(0.7, 1.6 - 0.1 * (nivel - 1))   [s]
```

| Tempo ativo | Nível | Velocidade | Intervalo |
|---|---:|---:|---:|
| 0 a menos de 30 s | 1 | 1,5 m/s | 1,6 s |
| 30 a menos de 60 s | 2 | 1,7 m/s | 1,5 s |
| 270 a menos de 300 s | 10 | 3,3 m/s | 0,7 s |
| 300 a menos de 330 s | 11 | 3,5 m/s | 0,7 s |

O nível continua subindo depois dos tetos. O intervalo define a cadência desejada de lançamento. Se ela conflitar com a regra de espaço ou recuperação, prevalece uma sequência fisicamente executável. Os pontos e as três vidas são regras, não parâmetros de balanceamento.

## 2. Arquitetura e dependências

### 2.1 Ambiente e reprodução

- A pasta do projeto estava vazia na elaboração deste plano. Na execução, listar novamente seu conteúdo e ler instruções locais antes de criar arquivos. Preservar qualquer trabalho feito pelo aluno entre as duas etapas.
- Stack definida: TypeScript para código, Three.js para cena e renderização, WebXR para sessão imersiva, Vite para desenvolvimento e compilação. Usar navegador de computador com WebGL e emulador WebXR compatível para a parte XR.
- **D1 (decisão aprovada):** Node.js LTS compatível com a versão escolhida do Vite, npm, módulos ES, TypeScript em modo estrito e Vitest para testes de regras. Antes da instalação, consultar a exigência de Node da versão do Vite, conferir Node/npm da máquina e registrar versões efetivamente usadas. Incluir declarações de tipos de Three.js e WebXR compatíveis quando necessárias. Um único arquivo de lock, dependências locais e instalação reproduzível. [Documentação de instalação do Vite](https://vite.dev/guide/)
- **D1:** expor `npm run dev` (desenvolvimento), `npm run typecheck` (verificação sem emitir arquivos), `npm test` (uma passagem, sem modo de observação), `npm run build` (tipos + pacote estático) e `npm run preview` (conferência local de produção). Em instalação limpa com lock, usar `npm ci`. Registrar no README apenas os comandos que realmente funcionam.
- HTTPS é requisito do endereço escolar. No computador, usar localhost durante a criação. Um endereço HTTP da rede local não equivale a localhost no Quest. Preferir abertura direta do link no navegador. `vite preview` serve à conferência local do pacote. [Guia WebXR da Meta](https://developers.meta.com/vr/documentation/web/webxr-overview/) · [Publicação estática com Vite](https://vite.dev/guide/static-deploy.html)

### 2.2 Mapa de arquivos (D1)

Os nomes abaixo são a estrutura de trabalho aprovada para uma pasta nova. Se já houver estrutura equivalente, registrar a correspondência antes de editar. Não criar módulos vazios para preencher a árvore.

```text
index.html                 Entrada do navegador, idioma pt-BR e ponto de montagem
package.json               Dependências e comandos
package-lock.json          Versões reproduzíveis com npm
tsconfig.json              Verificação estrita do código
README.md                  Partida no PC, acesso no Quest e instruções de teste
src/
  main.ts                  Inicialização, transições, relógio e ciclo de quadros
  game/
    config.ts              Regras fixas e seção separada de ajustes para teste
    state.ts               Partida, nível, pontuação, vidas, pausa e término
    challenges.ts          Geração, mira inicial, movimento e expiração
    collisions.ts          Contatos, ordem temporal e resultado único
  input/
    xr.ts                  Sessão, referência espacial, cabeça e dois controles
    desktop.ts             Entrada por teclado e mouse para os mesmos gestos
  view/
    arena.ts               Arena, iluminação, janela e posição central
    objects.ts             Malhas de objetos e escudos, efeitos de impacto
    ui.ts                  Entrada 2D, tutorial, painel VR, pausa e resultado
    audio.ts               Sons de acerto, dano e nível
    style.css              Interface externa ao modo imersivo
  storage.ts               Carregamento, validação e persistência do recorde
tests/
  state.test.ts            Relógio, níveis, pontuação, pausa, fim e reinício
  encounters.test.ts       Trajetórias, resoluções, colisões e sequências
  storage.test.ts          Recorde válido, corrompido ou indisponível
dist/                      Saída gerada pelo build, usada para publicação
```

### 2.3 Contratos entre componentes (arquitetura aprovada em D1)

1. **Entrada por quadro:** produzir, no mesmo referencial em metros, pose da cabeça, posição e orientação de cada controle, validade de cada pose e instante da amostra. Separar comandos de menu dos gestos físicos. Uma pose ausente não vale como posição zero. O simulador e o Quest alimentam a mesma interface.
2. **Estado:** manter fase, tempo ativo, pontos, vidas, nível e desafios ativos. O relógio recebe o delta de tempo do ciclo principal. Um único ciclo avança a simulação. A interface exibe o resultado e não concede pontos.
3. **Desafio:** ter identidade por lançamento, tipo, posição anterior/atual, direção de lançamento, velocidade ou tempo útil, e indicador de resolução. Capturar a mira ao lançar. Remoção técnica, pausa, reinício e fim de sessão não são desvios bem-sucedidos.
4. **Resolução:** determinar o primeiro evento físico válido, marcar o objeto como resolvido e então aplicar o resultado uma vez. A cena, o som e a interface refletem o mesmo evento. Um acerto pelos dois controles continua valendo apenas uma ação.
5. **Renderização e poses:** usar `renderer.xr.enabled` e um único `renderer.setAnimationLoop`. Obter a pose central do observador a partir da pose do viewer no referencial ativo. Associar os escudos à pose física dos controles (grip) e os raios de menu à pose de apontar. Identificar a mão pelo input source, sem presumir que o índice zero seja a esquerda. [Three.js WebXRManager](https://threejs.org/docs/pages/WebXRManager.html)
6. **Reprodutibilidade:** injetar tempo e sequência de escolhas nos testes. A lógica de placar e contatos deve executar sem abrir navegador, sessão XR ou dispositivo de áudio. Manter no arquivo de configuração os parâmetros de teste de D3–D5, com unidade e aplicação.

## 3. Fases de desenvolvimento — tarefas modulares

**Procedimento de aceite:** executar na ordem abaixo, respeitando as dependências indicadas. Ao concluir cada tarefa, registrar em uma linha o ID, o ambiente, o teste executado e o resultado observado. Usar “pendente no Quest” para uma verificação que exige o aparelho. Uma falha de aceite gera uma correção e repetição do teste afetado antes de considerar a tarefa concluída. O trabalho que independe de hardware pode prosseguir em casa.

### T01 — Preparar uma base executável

- **Objetivo:** abrir o projeto no PC e gerar o primeiro pacote estático reproduzível.
- **Entradas:** seções 1 e 2, D1, versões disponíveis e conteúdo real da pasta.
- **Saídas:** `package.json`, lock, `tsconfig.json`, `index.html`, `src/main.ts` e comandos iniciais no `README.md`.
- **Regras e execução:** conferir versões e permissões de instalação. Criar apenas a base da stack combinada, iniciar a página em português e mostrar uma cena mínima ou mensagem de capacidade gráfica. Verificar erros de carregamento no navegador.
- **Aceite:** instalar a partir do lock em uma cópia limpa, conferir tipos, gerar `dist/` e carregar a prévia. Recarregar a página e conferir que o módulo principal abre sem erro. Registrar os comandos e a versão de Node que passaram.

### T02 — Entrar em VR e reconhecer o jogador

- **Objetivo:** validar o caminho do link até a visão imersiva e a identificação dos dois controles antes de construir a arena completa.
- **Entradas:** T01, R01, R03, R10, D2, D3. Ler `main.ts` e `index.html`.
- **Saídas:** `input/xr.ts`, primeira cena em `view/arena.ts`, controles de entrada em `view/ui.ts`, integração em `main.ts`. Caminhos de módulos nesta seção são relativos a `src/`, exceto arquivos de raiz e `tests/`.
- **Regras e execução:** verificar contexto seguro, presença de `navigator.xr` e suporte a `immersive-vr`. Solicitar a sessão no gesto “Entrar em VR”. Configurar o referencial conforme D3 e mostrar um marcador frontal. Capturar centro e frente no gesto de confirmação, desconsiderando a inclinação vertical da cabeça ao definir a frente. Antes do início exigir tracking válido da cabeça e dos controles. [Consulta de suporte a sessões](https://developer.mozilla.org/en-US/docs/Web/API/XRSystem/isSessionSupported)
- **Aceite:** no emulador, entrar, identificar cada mão movendo uma por vez, virar antes de confirmar e verificar que o marcador continua à frente da direção confirmada. Sair e reentrar sem duplicar cena, eventos ou ciclo. No PC sem XR, a página oferece o modo de teste. Assim que houver acesso à escola, repetir entrada e reconhecimento no aparelho.

### T03 — Espelhar as entradas em teclado e mouse

- **Objetivo:** testar em casa desvio, bloqueio e toque pelas mesmas poses usadas em VR.
- **Entradas:** T02, contrato de poses, mapeamento de D2 e medidas de D3.
- **Saídas:** `input/desktop.ts`, seleção do modo em `main.ts`, legenda contextual em `view/ui.ts`.
- **Regras e execução:** teclado desloca lateralmente a cabeça simulada. Mouse move a mão selecionada diante do jogador. Ao trocar de mão, preservar a pose da outra. Posicionar mãos inicialmente fora da linha de ataque. Separar a simulação de desktop das poses reais enquanto o Quest apresenta a sessão.
- **Aceite:** mover a cabeça para ambos os lados e retornar ao centro. Encostar alternadamente cada mão em um marcador visível e manter a outra imóvel. Trocar entre modos sem herdar tecla pressionada nem escudo congelado na frente da cabeça. As entradas produzem poses, sem atalho para somar pontos.

### T04 — Implementar ciclo de partida e dificuldade

- **Objetivo:** obter uma partida completa em memória antes de depender dos gráficos finais.
- **Entradas:** R04–R08, R10, tabela de 1.2, decisões de continuidade em D6.
- **Saídas:** `game/config.ts`, `game/state.ts`, `tests/state.test.ts`.
- **Regras e execução:** modelar entrada → instruções/centralização → jogando → fim. Permitir jogando → pausado → jogando pela interação aprovada. Inicializar com 0 pontos, 3 vidas, nível 1. Contar tempo somente em “jogando”. Recalcular nível pelo tempo acumulado. Encerrar imediatamente ao consumir a última vida. Aceitar pontuação somente por resolução válida enquanto a rodada estiver ativa.
- **Aceite:** verificar 29,999 s, 30 s, 60 s, 270 s, 300 s e um nível acima dos tetos. Pausar durante 60 s de relógio externo em 29 s ativos, retomar e completar o primeiro nível apenas ao jogar mais 1 s. Aplicar três danos, verificar vidas 2→1→0 e ignorar eventos posteriores. Reiniciar e conferir valores iniciais e lista vazia de objetos.

### T05 — Construir trajetórias e resolver as três interações

- **Objetivo:** jogar um encontro de cada tipo e obter exatamente os resultados de R04–R06.
- **Entradas:** T03 e T04, poses, geometria D3, contatos D4 e regras de surgimento D5.
- **Saídas:** `game/challenges.ts`, `game/collisions.ts`, formas provisórias em `view/objects.ts`, integração em `main.ts`, `tests/encounters.test.ts`.
- **Regras e execução:** iniciar em coordenadas frontais. Calcular trajetória vermelha uma vez usando a cabeça rastreada naquele instante. Amostrar poses anteriores e atuais, testar o percurso entre quadros para evitar que um objeto rápido atravesse a cabeça ou o escudo. Separar área de toque da mão e área de defesa do escudo. Verificar contato antes de dar crédito por passagem. Após resolver, retirar o objeto do conjunto ativo e liberar sua representação visual.
- **Aceite:** executar toda a matriz a seguir em casos reproduzíveis. `Δ` é a variação de pontos ou vidas por objeto. Comparar a leitura do HUD com o estado interno quando o HUD estiver disponível.

| Situação de teste | Δ pontos | Δ vidas |
|---|---:|---:|
| Vermelho passa depois de inclinação lateral | +3 | 0 |
| Vermelho atravessa escudo e atinge cabeça | 0 | −1 |
| Vermelho encontra um escudo, mas a cabeça já saiu da trajetória | +3 ao passar | 0 |
| Azul interceptado antes da cabeça, por qualquer escudo | +2 | 0 |
| Azul passa sem contato | 0 | 0 |
| Azul atinge cabeça antes do escudo | 0 | −1 |
| Dourado tocado pela mão esquerda, direita ou pelas duas no mesmo quadro | +1 | 0 |
| Dourado expira sem toque | 0 | 0 |
| Limpeza de objeto durante reinício/transição | 0 | 0 |

Repetir um caso de bloqueio em que o deslocamento em um quadro exceda a espessura do escudo. Reprocessar o mesmo ID após resolução e confirmar que o total permanece igual. Sequência de um acerto de cada cor: placar final 6 e três vidas. Uma cabeça estacionada fora do centro passa a ser a mira do vermelho seguinte.

### T06 — Gerar sequências justas sem tempo limite

- **Objetivo:** aplicar a curva de dificuldade e misturar os gestos sem exigir movimentos grandes.
- **Entradas:** T04–T05, R08–R09, limites de D3 e D5.
- **Saídas:** ampliar `game/challenges.ts`, `game/config.ts` e `tests/encounters.test.ts`.
- **Regras e execução:** escolher tipo e calcular instante de chegada, duração da janela de interação e alcance antes de aceitar um lançamento. Reservar a janela de ação e o tempo de recuperação. Se houver conflito, usar outra janela ou adiar o desafio, descartando dívida de lançamentos. Distinguir objetos visíveis ao longe de objetos que exigem reação simultânea. Aplicar a nova velocidade nos próximos lançamentos conforme D5. Garantir espaço lateral livre após esquiva. Anéis ficam em posição alcançável durante uma janela independente da velocidade dos projéteis.
- **Aceite:** usar sequência conhecida e simular pelo menos até o nível 12, com respostas de jogador fornecidas pelo teste. Conferir tetos, cadência crescente quando houver espaço, variedade das três ações, janela mínima aprovada entre gestos e limite de objetos ativos. Forçar uma sequência inválida e verificar o adiamento. Conferir que a transição de nível ou uma pausa longa não solta uma rajada represada. No emulador, realizar uma rodada mista sem sair do centro.

### T07 — Fechar tutorial, interface, pausa e recorde

- **Objetivo:** permitir que um colega da escola comece, entenda os gestos e reinicie usando o próprio Quest.
- **Entradas:** T02–T06, R10, D2, D6 e D7.
- **Saídas:** `view/ui.ts`, `view/style.css`, `storage.ts`, integração em `main.ts` e `tests/storage.test.ts`.
- **Regras e execução:** apresentar três ícones com ação e pontos, confirmação de centro e início. Dentro do VR, renderizar controles e placar visíveis no espaço 3D. Mostrar pontos, vidas e nível sem cobrir a trajetória. Abrir pausa, congelar simulação e exigir retomada explícita conforme D6. No fim, exibir pontuação atual, melhor resultado do navegador e reinício simples. Atualizar o recorde com o maior valor válido seguindo D7. Reutilizar o ciclo existente ao reiniciar.
- **Aceite:** entrar no link, iniciar e jogar usando somente o fluxo exibido. Pausar com projétil em voo, esperar a duração de um nível e verificar cena/placar estáveis. Retomar sem dano instantâneo conforme D6. Terminar rodadas de 6 e 3 pontos, recarregar e conferir recorde 6. Simular indisponibilidade de armazenamento e concluir a partida. Repetir três reinícios consecutivos, verificando uma resposta por ação.

### T08 — Aplicar a direção de arte e os sons

- **Objetivo:** transformar a sala mínima em arena futurista e tornar legível cada ação em movimento.
- **Entradas:** T05–T07, R02–R06 e direção de apresentação de D8.
- **Saídas:** `view/arena.ts`, `view/objects.ts`, `view/audio.ts`, ajustes de integração em `view/ui.ts` e `main.ts`.
- **Regras e execução:** distinguir pontas vermelhas, energia azul e anel dourado pela forma. Fazer escudos transparentes com bordas visíveis. Aplicar sinal de lançamento e efeitos breves a partir dos eventos reais de jogo. Reservar a área útil frontal aos desafios. Usar a janela espacial e iluminação como fundo. Desbloquear áudio a partir de interação do usuário e permitir jogar se o áudio falhar. Compartilhar geometria e materiais repetidos e liberar efeitos concluídos.
- **Aceite:** conseguir identificar os três tipos com som desligado e pela silhueta. Conferir que áudio e efeito de impacto ocorrem uma vez por resolução; dano, acerto e passagem de nível soam diferentes. Nas sequências mais rápidas, escudos e partículas permitem ver o perigo seguinte. Conferir em ambos os olhos na escola.

### T09 — Auditar o pacote e disponibilizar o link escolar

- **Objetivo:** carregar a versão de apresentação a partir do endereço que será usado na escola.
- **Entradas:** T01–T08, host/origem e forma de publicação escolhidos em D9.
- **Saídas:** `dist/` gerado pelo build; instruções reais de execução e link HTTPS no `README.md` após publicação. Ajustar caminho-base do Vite apenas se exigido pela hospedagem.
- **Regras e execução:** rodar verificação de tipos, testes e build, conferir a prévia de produção e os caminhos de recursos. Publicar somente o conteúdo do build no destino aprovado. Usar recursos por HTTPS e verificar certificado e acesso com navegador comum. Registrar qual versão está no link. Se faltar acesso ao host, entregar o pacote pronto e identificar a etapa de publicação pendente.
- **Aceite:** abrir o endereço HTTPS em nova aba, recarregar e entrar pelo fluxo normal. Checar ausência de 404, conteúdo misto e erros de inicialização. Testar o pacote com teclado/mouse e emulação de cabeça e dois controles. Abrir o mesmo link na rede da escola e iniciar a sessão no Quest como parte de T10.

### T10 — Validar no Quest e ajustar a apresentação

- **Objetivo:** confirmar, com o aparelho disponível, que o jogo é confortável, legível e jogável no espaço real.
- **Entradas:** link de T09, dois controles, Quest da escola, ajustes D3/D5 e referência de desempenho D9.
- **Saídas:** parâmetros ajustados em `game/config.ts` se necessário, correções no módulo responsável, anotação curta de modelo, navegador, versão testada e resultado. Se houver mudança, gerar e publicar novo pacote e repetir os casos afetados.
- **Regras e execução:** conferir acesso ao link, centralização, tracking de ambas as mãos e tutorial. Jogar inclinado para cada lado. Bloquear e tocar alternando as mãos. Verificar alcance do dourado e se os vermelhos permitem reação sem passos sucessivos. Testar pausa, saída do VR, retorno, terceira perda de vida e reinício. Observar os limites de dificuldade em um cenário de teste reproduzível que use a cadência e efeitos do jogo final.
- **Aceite:** registrar uma passagem bem-sucedida por cada gesto no headset, teste de leitura do placar, suavidade nos níveis altos e retomada do ponto central. Guardar resultado real para a meta de desempenho D9. Se houver pouco tempo com o aparelho, priorizar entrada XR, conforto, alcance, tracking e fluidez. Registrar casos não executados como pendentes. Encerrar a validação física apenas quando os itens correspondentes da seção 5 tiverem evidência no Quest.

## 4. Tratamento de erros e exceções

Usar mensagens curtas em português para ações que o jogador possa corrigir. Informações para diagnóstico ficam no console ou na anotação de teste. Nos casos que dependem de uma escolha, aplicar o comportamento aprovado em D1–D9.

| Condição ou estímulo de teste | Resposta esperada e verificação |
|---|---|
| Versão de Node incompatível, instalação interrompida ou lock divergente | Informar a incompatibilidade concreta. Preservar o trabalho atual, alinhar versões, repetir instalação e conferir o build limpo. |
| `isSecureContext` falso, XR indisponível ou modo imersivo sem suporte | Explicar como abrir o endereço HTTPS no Quest. Disponibilizar o teste por computador quando houver gráficos compatíveis. Nunca indicar que a sessão VR começou. |
| Permissão negada, navegador ocupado ou pedido de sessão rejeitado | Restaurar a tela de entrada, exibir o motivo em termos simples e permitir nova tentativa por gesto do usuário. Dois cliques rápidos só podem deixar uma solicitação em curso. Pontos e vidas não mudam. |
| WebGL indisponível ou contexto gráfico perdido | Informar a falha, interromper a simulação e oferecer recuperação ou recarga. Após restauração, invalidar referências gráficas antigas. O comportamento do recorde segue D7. |
| Apenas um controle, controle desligado, troca de mão ou pose inválida | Identificar qual controle falta. Suspender conforme D6; remover a pose anterior da colisão. Recuperar tracking e exigir confirmação antes de voltar a contar tempo. Testar desconexão durante um projétil em voo. |
| Jogador recentraliza pelo sistema, retira o visor, abre menu do Quest, oculta a aba ou sai do VR | Ouvir alterações da sessão, visibilidade e referência espacial. Pausar também em `visible-blurred` conforme D6. Invalidar amostras espaciais antigas, restaurar centro se necessário e zerar a base do delta ao retornar. [Evento de visibilidade da sessão XR](https://developer.mozilla.org/en-US/docs/Web/API/XRSession/visibilitychange_event) |
| Quadro atrasado, poses fora de ordem ou delta inválido | Descartar amostras inválidas. Para intervalo grande, aplicar a política D6. Para movimento normal, testar contato contínuo entre amostras. Pausas não geram bônus, dano, tempo ativo ou lançamentos retroativos. |
| Escudo e cabeça cruzados no mesmo quadro, duas mãos tocam o mesmo anel ou objeto passa pelo limite ao atingir a cabeça | Calcular o primeiro evento válido no percurso. Aplicar desempate D4 apenas para instantes equivalentes. Marcar resolução antes da animação ou remoção. Testar invertendo a ordem de iteração das mãos. |
| Terceiro dano e outro acerto no mesmo quadro | Ordenar eventos conforme D4. Ao chegar a zero vidas, finalizar uma vez e ignorar eventos posteriores. Verificar recorde e som de término sem duplicação. |
| Geometria de lançamento sem posição frontal válida, braço fora de alcance ou combinação impossível | Rejeitar a configuração daquele encontro, adiar ou escolher o próximo encaixe válido conforme D5. Limitar o número de tentativas por quadro. Descartar o candidato não vale pontos. |
| Chave de recorde ausente, texto inválido, número negativo ou armazenamento bloqueado | Aceitar apenas pontuação inteira, finita e não negativa. Usar zero para leitura inválida. Se a escrita falhar, manter o melhor valor válido em memória e indicar que ele vale para a sessão. Testar leitura e escrita separadamente. |
| Áudio bloqueado ou efeito visual indisponível | Continuar jogando com as demais pistas. A lógica resolve o objeto mesmo se um efeito não tocar. Falha de carregamento de um recurso visual essencial deve ser indicada antes de iniciar a partida. |
| Reinício repetido ou sessão encerrada durante inicialização | Cancelar o trabalho do ciclo antigo e descartar callbacks tardios. Limpar objetos, estados de entrada, sons pendentes e inscrições da sessão encerrada. Repetir entrada, saída e reinício sem acumular controles ou eventos. |
| Link abre no PC mas não no Quest | Conferir a mesma URL no navegador do Quest, HTTPS, rede escolar, certificado, suporte a sessão imersiva e console quando acessível. Registrar modelo e versão reais. Corrigir a causa observada e repetir no aparelho. |

## 5. Checklist final de validação

Marcar os itens somente após obter o resultado observável. Evidência mínima por grupo: versão testada, ambiente (PC, emulador, Quest), caso executado e resultado. Um teste no PC não preenche um item indicado como **Quest**.

**Escopo e entrega**

- [x] D1–D9 aprovadas pelo aluno em 07/11/2026.
- [ ] Todos os comandos documentados funcionam a partir de uma instalação limpa.
- [ ] A verificação de tipos, os testes determinísticos e o build de produção passaram.
- [ ] O link HTTPS abre o pacote correto, inclusive após recarga e na rede escolar.
- [ ] **Quest:** o aluno entra em VR, confirma o centro, entende o tutorial e inicia com os dois controles.

**Regras e dificuldade**

- [ ] Partida inicia com 3 vidas, 0 pontos, nível 1 e sem limite de duração.
- [ ] Toda a matriz de T05 passou, inclusive toque duplo, remoção técnica e pontuação de uma sequência completa.
- [ ] Vermelho ignora os escudos, mira uma vez e dá +3 apenas após passagem válida.
- [ ] Azul dá +2 ao bloquear, 0 ao esquivar e −1 vida ao atingir a cabeça.
- [ ] Dourado dá +1 por toque de qualquer mão; perdê-lo não tira vida.
- [ ] Terceira perda de vida encerra imediatamente o jogo, com resultado e reinício.
- [ ] O nível sobe nos limites de 30 s ativos. Intervalo, velocidade, tetos e continuidade do nível conferem com 1.2.
- [ ] Sequências intermediárias e máximas respeitam as janelas de reação, toque e recuperação aprovadas.
- [ ] Permanecer parado fora do centro não produz pontos repetidos de desvio sem novo movimento.

**Interface, estado e falhas**

- [ ] Pausa manual, perda de tracking, interrupção pelo sistema e saída de VR congelam o relógio e a simulação.
- [ ] Retomada e reinício seguem D6, sem dano instantâneo ou objetos de outra rodada.
- [ ] Pontuação, vidas, nível e tela de resultado refletem o estado real, inclusive no modo imersivo.
- [ ] Recorde preserva o maior resultado, sobrevive à recarga no mesmo navegador e tolera armazenamento indisponível.
- [ ] Mensagens de falha de XR, controles e áudio foram verificadas nos ambientes aplicáveis.
- [ ] Reinícios consecutivos e jogo prolongado não multiplicam objetos, eventos, sons ou ciclos de renderização.

**Jogabilidade e apresentação**

- [ ] Teclado e mouse exercitam as três ações em casa pelas mesmas regras da sessão XR.
- [ ] Emulador cobre entrada/saída XR, tracking simulado da cabeça e manipulação independente das duas mãos.
- [ ] **Quest:** na posição central, o jogador consegue desviar para os dois lados e voltar, sem andar pela sala.
- [ ] **Quest:** qualquer mão alcança alvos da sua área e consegue bloquear. Nenhuma ação exige giro para trás, salto ou agachamento.
- [ ] **Quest:** vermelho, azul e dourado têm silhuetas distinguíveis e o placar permanece legível em ambos os olhos.
- [ ] **Quest:** escudos transparentes, impactos e luzes permitem ver a próxima ameaça. É possível jogar com o áudio desligado.
- [ ] **Quest:** há evidência de fluidez no caso de maior carga aprovado e de funcionamento de pausa, retorno e reinício.
- [ ] **Quest:** modelo, navegador, endereço e versão final testada foram anotados. Pendências reais estão identificadas.

---

## Registro das decisões aprovadas

O aluno confirmou as escolhas abaixo com a mensagem “Aprovo D1 a D9”. Use os parâmetros indicados no primeiro teste e registre os resultados da calibração física em T10.

| Decisão | Escolha aprovada | Onde afeta |
|---|---|---|
| **D1. Posso adotar a organização e as ferramentas de apoio da seção 2?** | Usar a árvore e os contratos da seção 2, npm com lock, TypeScript estrito e Vitest. Fixar versões compatíveis no início, conforme o Node disponível. Separar regras de entrada e renderização para testar em casa. | T01 e estrutura das demais tarefas |
| **D2. Como comandar menus no Quest e simular gestos no PC?** | No Quest, apontar e usar o gatilho para confirmar os menus, incluindo um botão de pausa fora da trajetória. Durante o jogo o contato físico basta. No PC, A/D deslocam a cabeça, soltar retorna ao centro, 1/2 selecionam mão, mouse move essa mão no plano frontal e Esc pausa. Mostrar instruções no próprio modo. | T02, T03, T07 |
| **D3. Como centralizar e dimensionar a área de jogo?** | Preferir referência `local-floor`, com alternativa `local` calibrada pela pose da cabeça. Centralizar de frente na postura confortável do aluno. Começar testando inclinação lateral de 25–30 cm; lançar perigos cerca de 2,4 m à frente da posição de mira. Anéis inicialmente a 30–40 cm à frente, até 25 cm para um lado e 20–35 cm abaixo dos olhos. Exibir esses alvos primeiro no teste de alcance e aproximar se necessário. Configurar a altura em relação ao jogador. | T02, T03, T05, T06, T10 |
| **D4. Quais áreas contam como contato e como desempatar eventos?** | Testar cabeça como esfera de raio 11 cm, perigo como esfera de 7 cm, escudo como disco de raio 15 cm e espessura total 3 cm, toque da mão como esfera de 5 cm, anel como alvo preenchido de raio 8 cm. O centro vazado também aceita toque. Para o vermelho/azul, usar a passagem além do plano de destino e da margem de colisão como fim do encontro, após varrer o percurso. Priorizar o primeiro contato no tempo. Em empate no mesmo azul, favorecer bloqueio; em empate entre objetos diferentes, resolver pela ordem de lançamento, parando no fim da partida. Validar dimensões no Quest e ajustar a representação visual junto com o contato. | T05, T06 |
| **D5. Qual será o ritmo dos encontros e a duração do anel?** | Começar com vermelho, azul e dourado nessa ordem para o jogador experimentar cada gesto. Sinalizar o próximo desafio durante 0,4 s. Nos três primeiros encontros, aguardar resolução antes do seguinte. Depois embaralhar blocos com um de cada tipo, impedir repetição na virada de bloco e usar no máximo três objetos ativos como valor inicial. Anel fica parado e disponível por 1,2 s. Reservar inicialmente 0,35 s de recuperação entre janelas de ação obrigatória. Permitir objetos à distância durante essa recuperação. Intervalo e velocidade do nível novo valem para lançamentos novos. Testar e ajustar para misturar os gestos cedo e preservar o conforto. | T05, T06, T08, T10 |
| **D6. O que conservar se o jogo for interrompido?** | Na pausa manual, congelar os objetos, reposicionar o jogador e mostrar contagem de 3 s antes de retomar. Se o jogador voltar em posição diferente, se o tracking cair ou se houver salto de tempo maior que 0,25 s, suspender e limpar perigos sem pontuar. Retomar do centro com novo aviso de lançamento. Ao sair de VR e voltar na mesma página, conservar vidas, pontos, nível e tempo em memória; ao recarregar, voltar à entrada. Reinício explícito zera a rodada. | T02, T04, T06, T07 |
| **D7. Quais pontuações contam para o recorde?** | Gravar o melhor resultado ao fim de uma rodada, com recordes separados para VR e simulador de teclado/mouse no mesmo navegador. Usar armazenamento local da origem do site. No desenvolvimento, abrir o emulador em perfil ou endereço de teste para separar seus dados dos da demonstração. | T07, T09 |
| **D8. Qual nome e quais recursos visuais/sonoros usar?** | Usar “Teste de Reflexos” como título, interface em português, formas e ambiente criados em Three.js e sons curtos gerados no navegador. Tutorial de uma tela, com três gestos ilustrados, seguido da confirmação do centro. | T02, T07, T08 |
| **D9. Onde hospedar e como validar a fluidez com modelo desconhecido?** | Usar hospedagem estática HTTPS; preferência por GitHub Pages se houver repositório autorizado. O aluno indica conta/repositório ou outro host antes de publicar. Na primeira visita, identificar modelo/versão do navegador. Para medir a fluidez, observar 60 s de carga máxima com a taxa efetiva da sessão e medir intervalos de quadros; usar como alvo inicial pelo menos 95% dos intervalos dentro de 1,2× o período nominal do visor. Ex.: a 72 Hz, período ≈13,9 ms e faixa até ≈16,7 ms. Se a taxa nominal não estiver exposta, registrar a medição disponível e o resultado perceptível, marcando a métrica numérica como pendente. Priorizar alvos legíveis e gestos confortáveis no ajuste gráfico. | T09, T10 |

**Dados a obter durante a execução.** Para T09, identificar a conta e o repositório de publicação ou outro destino HTTPS disponível. Para T10, registrar o modelo do Quest, a versão do navegador e as medidas observadas na escola.
