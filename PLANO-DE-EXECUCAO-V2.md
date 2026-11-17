# Teste de Reflexos — plano de execução da versão 2

**Documento de execução · 7 de novembro de 2026 · Projeto escolar para Meta Quest e computador**

**Status:** execução autorizada pelo aluno. A frase “execute o plano” foi tratada como autorização para aplicar as recomendações P01–P07 documentadas aqui, com seus valores ainda sujeitos à calibração no Quest. Os dados de destino P08 e aparelho P09 não estão disponíveis e só são necessários às tarefas de publicação e validação física. Não interpretar a execução local como confirmação de hospedagem ou evidência de headset. Manter no registro o que foi feito, os comandos e os resultados reais.

**Última execução automatizada:** 9 de novembro de 2026. Tipagem aprovada, 34 testes aprovados e build aprovado.

## 1. Contexto e visão geral

### 1.1 Entrega e ordem de autoridade

O aluno deve conseguir abrir um link HTTPS no navegador do Quest da escola, escolher entre quatro dificuldades, confirmar sua posição e jogar com dois controles. No computador, deve poder treinar as mesmas ações usando teclado e mouse. A rodada termina ao perder a terceira vida. O nível pode continuar subindo enquanto o jogador pontuar. A entrega inclui o jogo em português, o pacote estático reproduzível e um registro curto do que foi validado em cada ambiente.

Consultar [o plano original](PLANO-DE-EXECUCAO.md) para o registro D1–D9 e [o README do protótipo](README.md) para a execução local. O código e o registro de progresso podem ser atualizados enquanto as tarefas da seção 3 forem executadas. Usar a seguinte precedência para resolver divergências:

1. Aplicar as decisões mais recentes do aluno, consolidadas abaixo. A curva por tempo de R08, a fórmula da seção 1.2 antiga e os testes temporais de nível de T04/T06 foram substituídos. Remover essa dependência do código, tutorial e testes durante a implementação.
2. Conservar as decisões originais compatíveis, incluindo geometria, pontuação, gestos, relógio ativo, conforto, recuperação, ciclo da sessão, arte e entrega. Os parâmetros físicos de D3–D5 são pontos iniciais de calibração.
3. Usar o código existente como ponto de partida. Um atalho do protótipo, como usar a pontuação da rodada como “melhor da sessão”, não define uma regra de produto.
4. Para esta execução, P01–P07 usam as recomendações abaixo, conforme autorização do aluno para executar o plano. P08 e P09 continuam dependentes de informação ou aparelho. Se o aluno ajustar uma das recomendações, atualizar exemplos e testes que dependem dela.

### 1.2 Regras confirmadas para a execução

| ID | Decisão | Resultado observável |
|---|---|---|
| R1 | Jogo individual. A rodada começa com 0 pontos, 3 vidas e nível 1. Cada objeto tem um único desfecho. | O terceiro dano encerra a rodada. Não há multiplicador, vitória por atingir um nível nem duração máxima. |
| R2 | Modos **Fácil**, **Médio**, **Difícil** e **Impossível**. Todos têm progressão ilimitada por pontos. | O modo afeta velocidade e intervalo entre lançamentos desde o nível 1. O Impossível já exige reflexos rápidos no primeiro desafio. |
| R3 | A meta para avançar começa em 6, cresce de 3 em 3 e é igual nos quatro modos. Pontos excedentes contam no nível seguinte. | Metas individuais 6, 9, 12, 15… e totais 6, 15, 27, 42… O tempo sem pontuar nunca sobe o nível. |
| R4 | Vermelho com pontas mira a cabeça no lançamento e segue essa trajetória. Atravessa os escudos. | Cabeça atingida perde 1 vida. Passagem válida sem atingir a cabeça vale +3. |
| R5 | Energia azul pode ser bloqueada com qualquer escudo ou evitada. | Bloqueio vale +2. Passagem vale 0. Atingir a cabeça primeiro custa 1 vida. |
| R6 | Anel dourado opcional, parado e ao alcance de qualquer mão. | Toque, inclusive pelo centro vazado, vale +1. Expirar vale 0 e preserva as vidas. |
| R7 | Encontros frontais, alcançáveis e compatíveis com ficar no centro. | A pessoa consegue desviar e retornar com inclinação lateral. Admite-se pequeno passo. O jogo não exige andar pela sala, saltar, ajoelhar ou virar de costas. |
| R8 | Um som a cada vida perdida e outro som ao mudar de nível. Preservar o feedback de acerto previsto em D8. | O jogador distingue dano de avanço com os olhos nos alvos. O painel informa os números exatos de vidas e nível também com áudio desligado. |
| R9 | Com exatamente uma vida, as bordas da visão ficam levemente vermelhas. | O sinal permanece durante o jogo nessa condição, acompanha a visão e deixa o centro, as cores dos objetos e o painel legíveis, inclusive em VR. |
| R10 | Recordes por dificuldade **e** tipo de controle, no navegador da origem usada. | Há 8 combinações independentes: quatro modos × computador/VR. Uma rodada menor nunca reduz o melhor resultado. |
| R11 | Arena escura azul e roxa, janela espacial, escudos transparentes, formas distinguíveis e impactos breves. Menus, instruções e mensagens em português. | Dá para reconhecer a ação pela silhueta. No Quest, gatilho e apontador operam menus. Bloquear, tocar e desviar dispensam botões. |
| R12 | PC com servidor local durante o desenvolvimento. Escola com link HTTPS, emulação em casa e validação física no Quest. | Abrir o HTML por duplo clique apresenta orientação. O relatório distingue evidência de PC, emulador e aparelho. |

### 1.3 Ponto de partida inspecionado

- O projeto já contém uma aplicação e dependências com lock. O README registra, na versão anterior, 14 casos automatizados aprovados, compilação e uma rodada no PC com 6 pontos, pausa, retomada, fim e reinício. Esses resultados são **históricos**. Reproduzi-los em E01. O protótipo atribui nível 1 ao reinício e hoje ainda calcula o nível pelo tempo.
- Em `src/main.ts`, `updateHud`, `createChallenge` e o agendador consultam `difficultyAt(activeTime)`. `resolve` altera vidas e pontos. `endGame` exibe o próprio placar como melhor valor. Não há seletor dos quatro modos, persistência implementada, emissor de sons ou indicador de última vida nos arquivos inspecionados.
- O PC já projeta o mouse no plano das mãos, conserva a mão inativa e reconhece A/D, 1/2 e Esc. Há testes para o alcance dourado e contato contínuo de esferas. O escudo ainda usa aproximação esférica, o sorteio após a abertura é livre e a pausa atual limpa os desafios até na interrupção manual.
- A entrada XR atual inicia uma rodada em `sessionstart`, solicita `local-floor`, lê controles por índice e mantém HUD/menus no HTML. A pose central, fallback espacial, retomada, contingência para tracking e interface visível nos dois olhos precisam de implementação e verificação. A chamada a `setAnimationLoop` já existe.
- Acesso ao repositório de hospedagem, rede escolar, modelo do Quest, navegador e medições físicas não foram confirmados. Uma pessoa desenvolverá em casa e terá acesso ocasional ao aparelho. Priorizar uma partida testável a cada etapa.

### 1.4 Registro da execução autorizada

Aplicadas as recomendações P01–P07 desta versão por autorização do aluno para executar o plano. Valores P01 e P05 seguem como parâmetros de ensaio até calibração no aparelho. Registrar ao final os resultados reais e as tarefas externas pendentes.

| Tarefa | Progresso e evidência desta execução |
|---|---|
| E01 | `typecheck`, `test` e `build` executados na instalação existente. Instalação em cópia limpa e auditoria completa da prévia de produção ainda pendentes. A execução pelo servidor Vite no PC já havia sido demonstrada na tarefa de diagnóstico anterior. |
| E02 | Estado puro, metas e transições adicionados em `src/game/state.ts` e `src/game/config.ts`. Testes determinísticos cobrem os totais de exemplo, nível 100, danos e modo pausado. |
| E03 | Quatro perfis/curvas, seletor, progresso no HUD e valores persistentes integrados. Teste de perfil e inspeção do seletor/partida no navegador do PC. |
| E04 | Leitor XR usa pose do viewer e grip spaces identificados por handedness. Integração tipada. Entrada real, permissão de overlay, centralização, pose ausente e conforto continuam pendentes no emulador/Quest. |
| E05 | Abertura sequencial, blocos sem repetição na fronteira, aviso de 0,4 s, recuperação e atraso sem dívida implementados. `sphereContact`, transição única e regras de placar testadas. Varredura de disco orientado do escudo e teste de sequências no emulador ainda pendentes. |
| E06 | Pausa manual conserva os desafios. Interrupção longa ou sessão encerrada limpa perigos. Tentativa de pausa/retomada por gatilho XR via evento `select`, DOM overlay configurado e seleção de modo antes de entrar. Estes caminhos XR aguardam aparelho. Confirmação espacial e tutorial imersivo completo pendentes. |
| E07 | Sons locais gerados pelo Web Audio ligados aos eventos de perda, avanço e acerto válido. A lógica não depende do dispositivo. Audição real, volume e desbloqueio no Quest pendentes. |
| E08 | Borda CSS no desktop e efeito shader fixo à câmera para XR foram implementados, em 0,10 de opacidade periférica. Transições têm ligação ao estado. Discrição binocular e conforto aguardam inspeção no Quest. |
| E09 | Máximo local separado em oito categorias, chave versionada, validação, falhas toleradas e memória da sessão implementados. Casos determinísticos de isolamento, máximo e valores corrompidos/invalidos testados. |
| E10 | `typecheck`, 34 testes e build passaram. Navegador confirmou menu, seleção Impossível, HUD e quadro do jogo sem erros de console antes das últimas alterações ao leitor de pose/política de retomada. A reconexão final do navegador expirou, portanto esse último caminho não foi inspecionado visualmente. Percurso completo dos quatro modos e teste em emulador ainda pendentes. |
| E11 | P08 sem destino. Sem publicação externa. Pacote local em `dist/`. |
| E12 | P09 sem aparelho/hora de escola. Quest, rede escolar e medição D9 pendentes. |

## 2. Arquitetura e dependências

### 2.1 Ambiente reproduzível

| Item | Base encontrada | Instrução ao executor |
|---|---|---|
| Ferramentas | Node 24.13.0 e npm 11.18.0. Projeto 0.1.0 com módulos ES. | Registrar versões efetivamente usadas. Em outra máquina, conferir os requisitos de Node da versão travada de Vite antes de instalar. |
| Dependências locais no lock | Three.js 0.180.0, Vite 8.3.6, TypeScript 5.9.3, Vitest 4.1.12, @types/three 0.180.0, @types/webxr 0.5.24. Lock npm versão 3. | Instalar com `npm ci` em cópia limpa. Usar o lock atual. Se houver divergência, diagnosticar antes de alterar versões. |
| Tipagem | `tsconfig.json` estrito, ES2022, resolução Bundler, sem emissão de JS, inclui `src` e `tests`. | Manter os comandos existentes e as verificações de tipos. Isolar WebXR, Web Audio, DOM e armazenamento das regras determinísticas. |
| PC | Navegador com suporte gráfico compatível com o renderizador Three.js instalado. | Executar `npm run dev` na pasta do projeto e manter o terminal aberto. Usar a URL que ele imprimir. 5173 é a porta usual. 5174 foi usada no teste anterior e pode mudar. |
| Produção | `npm run build` verifica tipos e gera `dist/`. `npm run preview` serve o pacote localmente. | Abrir e recarregar a URL da prévia. Para o Quest, abrir a URL HTTPS publicada diretamente no navegador do aparelho. HTTP na rede local do PC não substitui essa entrega. |
| Áudio e visão | D8 prevê sons curtos gerados no navegador e formas em Three.js. | Usar áudio do navegador desbloqueado por gesto do usuário e uma representação efetivamente renderizada na sessão imersiva. Alternativa de saída visual quando o áudio falhar. |

### 2.2 Mapa de arquivos e responsabilidades

Caminhos relativos à raiz de `jogoVR`. Os módulos indicados para criação seguem a organização de D1. Se uma responsabilidade já tiver sido movida no momento da execução, identificar a equivalência e aproveitar o código. Criar um arquivo quando houver uma responsabilidade concreta a mover.

| Arquivo | Situação | Trabalho esperado |
|---|---|---|
| `index.html`, `src/view/style.css` | Existem | Preservar `lang="pt-BR"` e orientação para abertura direta. Acrescentar seleção de modo, HUD acessível, menus externos e indicador periférico para PC. |
| `src/main.ts` | Existe | Orquestrar entrada, sessão, simulação, eventos e apresentação. Um único ciclo e uma única inscrição por interação. Extrair regras que hoje estão misturadas aqui. |
| `src/game/config.ts` | Existe | Regras de pontuação, metas comuns, perfis de dificuldade e parâmetros de conforto em unidades explícitas. Substituir a curva temporal. |
| `src/game/state.ts` | Previsto | Estado da rodada, transições válidas, progressão, aplicação única de resultados e emissão de eventos de jogo. |
| `src/game/challenges.ts` | Previsto | Identidade, aviso, sorteio, posição, trajetória imutável, janela de ação, recuperação e expiração. |
| `src/game/collisions.ts` | Existe | Reutilizar `sphereContact` onde a geometria for esférica. Acrescentar varredura adequada para escudo orientado, anel e ordenação física dos contatos. |
| `src/input/desktop.ts`, `src/input/xr.ts` | Primeiro existente, segundo previsto | Produzir amostras compatíveis de cabeça e duas mãos. Tratar validade, orientação, tempo e comandos de menu. |
| `src/view/arena.ts`, `objects.ts`, `ui.ts` em `src/view/` | Previstos | Reaproveitar arena e malhas de `main.ts`. Separar apresentação de objetos, HUD, menus e sinal de última vida para desktop e XR. |
| `src/view/audio.ts` | Previsto | Um contexto de áudio por aplicação, desbloqueio, sinais distintos por evento e limpeza dos sons da rodada. |
| `src/storage.ts` | Previsto | Ler e gravar o máximo válido por dificuldade/controle. Fallback em memória. |
| `tests/state.test.ts`, `tests/interactions.test.ts` | Existem | Substituir expectativas de nível por tempo. Preservar testes das mãos, da projeção do mouse, do alcance e das colisões rápidas. |
| `tests/encounters.test.ts`, `tests/storage.test.ts` | Previstos em D1 | Testar sequências, oito categorias, dados inválidos e armazenamento indisponível. Testar a emissão de avisos por meio de um coletor substituível nos testes de estado. |
| `package.json`, `package-lock.json`, `tsconfig.json`, `README.md` | Existem | Conferir scripts/lock/configuração e atualizar o guia de jogo com a versão realmente testada. Gerar `dist/` pelo build. |

### 2.3 Contratos de dados e de tempo

| Conceito | Dados mínimos e invariantes |
|---|---|
| Rodada | Identidade da rodada, fase, dificuldade, tipo de controle, pontos totais inteiros não negativos, vidas entre 0 e 3, tempo ativo, lista de desafios, estado do próximo lançamento. Especificar separadamente dificuldade (ex.: Fácil) e controle (ex.: VR). |
| Progresso | Derivar nível, meta atual e progresso dentro da meta a partir da mesma fonte de pontos. Se forem mantidos em cache, atualizá-los na mesma transição. Tempo ativo serve para movimento, avisos, cadência e telemetria. |
| Entrada | Mesmo referencial em metros para cabeça e mãos, com validade, posição, orientação e instante por amostra. Invalidar pares anterior/atual após interrupção espacial. Preservar identidade esquerda/direita pelo input source. |
| Desafio | ID único na rodada, tipo, origem, posição anterior/atual, direção, mira e plano de passagem fixados no lançamento, velocidade capturada ou tempo útil, janela reservada, estado de resolução. Limpeza técnica não é passagem. |
| Resultado | ID de rodada + objeto + instante relativo do evento + desfecho. Só o estado ativo aplica pontos/vidas. Marcar resolvido antes de emitir efeitos. A UI, o áudio, a borda e o armazenamento consomem o estado confirmado. |
| Apresentação | HUD lê uma fotografia coerente de modo, pontos, nível, progresso e vidas. Áudio reage às transições (“perdeu vida”, “subiu nível”), não a leituras repetidas do mesmo valor. A borda é uma condição persistente, não um efeito de impacto por quadro. |
| Agendador | Distinguir **tempo de voo**, **intervalo entre lançamentos** e **intervalo entre gestos exigidos**. Um objeto pode estar visível ao longe enquanto o jogador termina um gesto. A janela de recuperação prevalece sobre a cadência desejada. |

### 2.4 Cálculo de referência para testes

Para nível inteiro `n >= 1`, a meta individual é `M(n) = 6 + 3 × (n − 1)`. O primeiro placar do nível é `B(n) = 3 × (n − 1) × (n + 2) / 2`. Dado um total `S`, o nível correto é o único para o qual `B(n) <= S < B(n + 1)`. O progresso exibido é `S − B(n)` de `M(n)`. Essa fórmula descreve o comportamento. O executor pode usar subtração sucessiva das metas ao receber pontos, desde que preserve as fronteiras e o excedente.

| Total S | Nível | Progresso no nível | Próximo total de subida |
|---:|---:|---:|---:|
| 0 | 1 | 0/6 | 6 |
| 5 | 1 | 5/6 | 6 |
| 6 | 2 | 0/9 | 15 |
| 8 | 2 | 2/9 | 15 |
| 14 | 2 | 8/9 | 15 |
| 15 | 3 | 0/12 | 27 |
| 26 | 3 | 11/12 | 27 |
| 27 | 4 | 0/15 | 42 |
| 42 | 5 | 0/18 | 60 |
| 231 | 12 | 0/39 | 270 |
| 15.147 | 100 | 0/303 | 15.450 |

## 3. Fases de desenvolvimento — tarefas modulares

Executar em ordem de dependência. E01 estabelece a referência de comparação. Uma tarefa com defeito reproduzível volta para correção e repetição do caso. Se faltar um valor de produto, usar dados sintéticos identificados como tais nos testes independentes e deixar a integração dependente pendente. Evidência física pode aguardar E12. Ao terminar cada tarefa, acrescentar ao registro do projeto uma linha com **ID, versão do pacote, ambiente, caso executado, esperado, observado e pendência**. Não marcar uma verificação de headset como aprovada com base em teste unitário.

### E01 — Reproduzir o protótipo e delimitar a migração

**Objetivo.** Estabelecer como o jogo abre e quais comportamentos já funcionam antes de modificar regras.

**Entradas.** Este plano, plano original, README, árvore real, instruções locais, manifestos, `src/` e `tests/`. **Saídas.** Registro inicial no README com versões, comandos, URL utilizada e falhas observadas. Manter os arquivos de trabalho do aluno.

**Regras e execução.**
1. Conferir instruções locais, arquivos alterados pelo aluno e scripts. Ler os pontos que leem o relógio, pontuam, removem objetos, atualizam o HUD, encerram a sessão ou reiniciam uma rodada.
2. Em uma cópia limpa sem `node_modules/` nem `dist/`, executar `npm ci`, `npm run typecheck`, `npm test` e `npm run build`. Preservar o único lock. Se o estado tiver evoluído, explicar a diferença em relação aos 14 casos históricos.
3. Iniciar `npm run dev`, abrir a URL indicada e jogar uma rodada. Em separado, abrir o URL de `npm run preview` após build. Verificar também a orientação ao abrir o HTML por arquivo.

**Aceite.** Documentar menu inicial, início com três vidas, movimento da cabeça/mãos, pontuação, pausa, retomada, terceira perda, reinício e recarga. Em produção, confirmar carregamento do JS/CSS, canvas e ausência de erro de inicialização no console. Somente uma página HTTP 200 não atesta que o jogo rodou. Diferenciar defeito anterior, falha de ambiente e regressão posterior.

### E02 — Migrar o estado da rodada para pontos

**Objetivo.** Fazer os quatro modos compartilharem uma única regra de nível, pontuação, vidas e eventos.

**Entradas.** E01, R1–R6, seção 2.4, `src/main.ts`, `src/game/config.ts`, testes atuais. **Saídas.** Estado em `src/game/state.ts`, configuração ajustada, `tests/state.test.ts` revisado e chamadas de estado integradas em `main.ts`.

**Regras e execução.**
1. Separar fase da aplicação (entrada, instruções/centro, jogando, pausado, retomada, fim) do número do nível. A expressão “passar de fase” usada para o som significa subir um nível dentro da mesma rodada.
2. Inicializar o modo da rodada, controle, 0 pontos, 3 vidas e nível 1. Ao resolver um objeto, validar rodada, fase, ID e resultado permitido para sua cor. Em caso de dano, reduzir uma vida. Em caso de pontuação válida, somar ao total e aplicar a seção 2.4. Perder uma vida preserva pontos, nível e progresso.
3. Comparar valores anterior/posterior dentro da transição. Produzir um evento de perda de vida com vidas restantes em toda transição 3→2, 2→1 ou 1→0. Produzir um evento de avanço quando mudar o nível. O primeiro quadro do nível 1, reconstrução do HUD e retomada não são avanços.
4. Aos 0 de vida, emitir dano final e término uma única vez, bloquear novos resultados e limpar sem pontuar. Em reinício explícito, trocar identidade da rodada e descartar callbacks e IDs antigos. O relógio só avança quando jogando.
5. Retirar a antiga relação `difficultyAt(activeTime)` do cálculo de nível, HUD, testes e disparo de eventos. Em E03/E05, a cadência continua usando segundos.

**Aceite.** Nos quatro modos, executar a tabela 2.4. Com 5 pontos conceder +3 e conferir total 8, nível 2, progresso 2/9 e um sinal de avanço. Em 14, aplicar +1 e conferir 15, nível 3, progresso 0/12. Simular mais de 300 s sem pontuar e manter nível 1. Com 5 pontos e jogo pausado, tentar aplicar dano, +3 e tempo externo, retomar e conferir os mesmos valores. Reaplicar um mesmo ID e obter zero efeitos adicionais. Três danos sucessivos geram vidas 2, 1, 0 e apenas um fim. Um acerto posterior ao fim não altera o recorde nem emite som.

### E03 — Configurar os quatro perfis e escolher modo

**Objetivo.** Permitir que o jogador escolha o ritmo e que o simulador use o mesmo perfil do Quest.

**Entradas.** E02, R2, P01 (curvas), P02 (escolha e reinício), P03 (painel), `index.html`, configuração e UI atuais. **Saídas.** Configuração por modo em `src/game/config.ts`, seleção em `index.html`/`src/view/ui.ts`, ligação em `main.ts` e testes de perfis em `tests/state.test.ts`.

**Regras e execução.**
1. Mapear nomes exibidos com os acentos corretos para identificadores estáveis. Manter quatro perfis com unidades explícitas. Um único cálculo recebe modo e nível atual e devolve velocidade de novos projéteis (m/s) e intervalo nominal entre lançamentos (s).
2. Tornar a escolha acessível no fluxo anterior à partida, com nome legível, foco visível e indicação do modo selecionado. A rodada recebe sua própria escolha no início. A política para repetir/trocar de modo segue P02.
3. Conservar as metas e os valores +3/+2/+1 em todos os perfis. O Impossível começa mais rápido e com menos intervalo no nível 1. O número do nível segue ilimitado mesmo se o ajuste de conforto estabelecer um ritmo prático máximo.
4. Se um aviso já tiver anunciado uma chegada, preservar o compromisso ou reanunciar com aviso completo. Fixar a velocidade no lançamento. Não acelerar projéteis em voo, recriar a arena ou zerar o agendador por subir de nível.

**Aceite.** Iniciar uma rodada em cada modo. Confirmar seleção, 0/6, nível 1, três vidas e categoria de recorde correta. Comparar velocidades e intervalos nos níveis 1, 2, 12 e 100, verificar ordem dos modos e valores positivos finitos. Medir voo e intervalo separadamente em sequência sem conflito. Um objeto lançado antes da subida conserva sua velocidade até o desfecho. Permanecer no mesmo nível sem pontos não acelera a partida.

### E04 — Unificar poses, centralização e entradas

**Objetivo.** Garantir que os gestos usados para pontuar sejam físicos, frontais e reproduzíveis nos dois ambientes.

**Entradas.** E02–E03, D2–D4, `src/main.ts`, `src/input/desktop.ts`, `tests/interactions.test.ts`. **Saídas.** Adaptador `src/input/xr.ts`, ajustes nos adaptadores e ciclo central, marcador em `src/view/arena.ts`, centralização em `ui.ts`, testes de interação.

**Regras e execução.**
1. Conferir contexto seguro, `navigator.xr` e suporte a `immersive-vr`. Solicitar sessão na ação “Entrar em VR”, uma solicitação por vez. Preferir `local-floor`, com `local` calibrado pela pose do viewer quando necessário. Conservar uma cena e um ciclo.
2. No gesto de confirmação, capturar centro, altura dos olhos e frente horizontal. Obter a pose central do viewer a cada quadro no referencial da rodada. Usar `gripSpace`/pose de grip para escudo e mão, pose de apontar para menus e handedness para esquerda/direita. Exigir cabeça e dois controles com amostras válidas para começar.
3. No PC, A/D inclinam lateralmente, soltar retorna ao centro. 1/2 selecionam mão e mouse move apenas a selecionada. Preservar a outra pose. Limpar teclas presas e pares de amostras ao trocar de contexto. Testar o plano inicial de mão a 0,35 m à frente que já é usado pelo simulador.
4. Referenciar o espaço de ataque à postura confirmada. Testar inclinação de 25–30 cm e lançamentos a cerca de 2,4 m da mira. Anel entre 30 e 40 cm à frente, até 25 cm para um lado e entre 20 e 35 cm abaixo dos olhos. Mostrar o alcance antes da partida. A direção vermelha mira a cabeça real no instante do disparo.

**Aceite.** No emulador, virar horizontalmente antes de confirmar e verificar a arena à frente. Mover um controle por vez e conferir lado, orientação e posição. Retirar um controle, observar a indicação do lado ausente e suspensão sem contato fantasma. No PC, alternar mãos, projetar o cursor até o centro do anel, soltar A enquanto D segue pressionado e perder foco durante o movimento. Reentrar em VR sem duplicar entradas. Repetição física integra E12.

### E05 — Validar contatos e agendar sequências justas

**Objetivo.** Garantir um resultado único por objeto e tornar perceptível a mudança de ritmo sem exigir movimentos incompatíveis.

**Entradas.** E02–E04, perfis de P01, D3–D5, rotinas de `main.ts` e `src/game/collisions.ts`. **Saídas.** `src/game/challenges.ts`, colisões atualizadas, representação em `src/view/objects.ts`, `tests/encounters.test.ts` e integração no ciclo existente.

**Regras e execução.**
1. Preservar a abertura vermelho → azul → dourado. Nos três primeiros encontros, esperar o desfecho antes do próximo. Depois embaralhar blocos com um de cada cor, evitar repetição na fronteira entre blocos e manter no máximo três objetos ativos. A estreia do Impossível usa a velocidade desse modo já no vermelho.
2. Avisar o próximo desafio durante 0,4 s. Manter o dourado disponível por 1,2 s independentemente da velocidade dos projéteis. Antes de aceitar novo lançamento, calcular chegada e janela de ação, reservar ao menos 0,35 s para recuperação entre gestos obrigatórios e confirmar possibilidade de retorno ao centro. Adiar conflito, limitar tentativas no quadro e descartar dívida de lançamentos.
3. Varrer o movimento relativo entre amostras válidas. Cabeça e projétil usam raios 0,11 m e 0,07 m. Escudo usa disco orientado, raio 0,15 m, espessura total 0,03 m. Toque da mão usa raio 0,05 m e alvo preenchido do dourado raio 0,08 m. Alinhar forma visual e contato. Uma esfera de raio 0,22 m ao redor do controle pode servir como filtro amplo, mas validar o contato com o disco antes de premiar bloqueio.
4. Calcular o primeiro evento físico válido, inclusive contato antes da expiração/passagem. A passagem verifica o plano de destino fixado no lançamento e a margem de colisão. Para o mesmo azul, bloqueio vence empate efetivo com a cabeça. Entre objetos, ordenar por instante e usar ordem de lançamento no empate. Após o terceiro dano, suprimir eventos posteriores daquele quadro.
5. Liberar objetos resolvidos e reciclar recursos compartilhados somente quando apropriado. Identidade da rodada também participa da deduplicação para suportar reinícios.

**Aceite da matriz de encontros.**

| Caso reproduzível | Δ pontos | Δ vidas | Verificação específica |
|---|---:|---:|---|
| Vermelho passa após esquiva | +3 | 0 | Conceder somente após passagem válida. |
| Vermelho cruza escudo e encontra cabeça | 0 | −1 | Nenhum bloqueio. |
| Vermelho cruza escudo e cabeça saiu | +3 | 0 | Atravessar escudo ainda não pontua. |
| Azul interceptado antes da cabeça | +2 | 0 | Testar cada mão, duas mãos e quadro com percurso maior que a espessura. |
| Azul desviado ou que passa fora | 0 | 0 | Nenhum avanço/aviso de dano. |
| Azul toca cabeça antes do escudo | 0 | −1 | Inverter a ordem das mãos não muda o resultado. |
| Dourado tocado por uma ou pelas duas mãos | +1 | 0 | Centro vazado aceita toque e duas mãos valem um acerto. |
| Dourado expira | 0 | 0 | Mesmo comportamento em todos os modos. |
| Reinício, suspensão ou descarte de candidato | 0 | 0 | Nenhum som de resultado ou passagem. |

**Aceite de ritmo.** Usar relógio e sequência injetáveis. Simular até pelo menos nível 12 **ganhando os pontos necessários** e testar também nível alto em cenário controlado. Medir horários de aviso, lançamento, chegada e fim de janela. Forçar um conflito e verificar adiamento, recuperação e teto de simultaneidade. Fazer uma esquiva, um bloqueio e um toque na mesma rodada, obter 6 pontos, nível 2, três vidas e um único som de avanço na etapa de áudio. Permanecer inclinado após uma esquiva, verificando que o vermelho seguinte mira a nova posição. Testar contato rasante, disco de perfil e caso em que a aproximação esférica daria bloqueio indevido.

### E06 — Fechar menus, painel e interrupções

**Objetivo.** Permitir iniciar, consultar nível/vidas, pausar, voltar e jogar novamente pelos controles disponíveis no PC e dentro do Quest.

**Entradas.** E02–E05, P02–P03, D2, D6, D8, `index.html`, CSS, `src/main.ts`. **Saídas.** `src/view/ui.ts`, HTML/CSS, ligação ao estado e tratamento dos eventos XR/visibilidade.

**Regras e execução.**
1. Tutorial de uma tela com três formas, ações e pontos, seleção do modo, confirmação do centro e início. Na sessão imersiva, renderizar painel e ações em 3D visíveis pelos dois olhos. Gatilho confirma menus. Posicionar HUD e comando de pausa fora da trajetória.
2. Mostrar pontos totais, vidas, nível e progresso conforme P03. No fim, indicar resultado e recorde da categoria de E09. No desktop, atualizar o texto acessível quando os dados mudarem, evitando anunciar o mesmo valor a cada quadro.
3. Na pausa manual, congelar estado, posições, janelas e relógio. Na retomada explícita, reposicionar e contar 3 s antes de ativar contatos. Se a postura divergir da referência ou houver perda espacial, limpar os perigos sem efeito e voltar do centro com novo aviso. Validar a tolerância proposta em P07.
4. Suspender em aba oculta, sessão encerrada, sistema recentralizado, perda de tracking ou visibilidade XR `hidden`/`visible-blurred`. Um intervalo maior que 0,25 s exige suspensão e limpeza, sem compensar o tempo perdido. Zerar a base temporal ao voltar e invalidar as poses antigas.
5. Ao sair e reentrar no VR na mesma página, conservar o estado da rodada e sua categoria. O evento de sessão não inicia rodada por conta própria. Recarregar a página volta à entrada. Reiniciar é uma ação explícita e limpa desafios e contagens pendentes.

**Aceite.** Pausar com projétil em voo e esperar 60 s externos; conferir posição, pontos, nível e vidas. Tentar retomar por Esc durante os 3 s. Verificar retomada central e interrupção com postura alterada. Suspender no meio de um aviso, anel ou projétil e não obter dano/bônus retroativo. Testar sequência sair → entrar → confirmar e três reinícios no mesmo processo. No PC e emulador, conferir que o HUD mostra os mesmos valores e que se chega ao resultado usando os controles disponíveis em cada um.

### E07 — Associar sons aos eventos de jogo

**Objetivo.** Tornar imediatamente distinguíveis a perda de vida e a subida de nível sem tirar os olhos dos desafios.

**Entradas.** E02, E05–E06, D8, R8 e escolha de timbres/prioridade em P04. **Saídas.** `src/view/audio.ts`, conexão dos eventos em `main.ts`, controles escolhidos na UI e casos de emissão nos testes de estado.

**Regras e execução.**
1. Criar ou retomar o contexto de áudio durante um gesto válido de início/entrada. Usar uma instância reutilizável. Gerar sinais curtos localmente. Tratar rejeição, contexto suspenso ou dispositivo mudo sem interromper a simulação.
2. Emitir som de dano em **toda** perda real, inclusive a última. Emitir som de nível quando o placar cruzar uma fronteira, inclusive por excedente. Preservar som de acerto previsto em D8 conforme a prioridade escolhida. Não acionar áudio na renderização do painel.
3. Distinguir sinais por contorno e timbre. Evitar sobrepor acerto e avanço de modo que o avanço fique mascarado. Limitar o volume e usar envelopes curtos. Pausa, retomada, fim, recarga e reinício não repetem notificações antigas. Permitir que o som do dano final seja ouvido.
4. Som informa a mudança. O painel continua a informar quantas vidas restam e o nível exato. A última vida é perceptível também pela borda de E08.

**Aceite.** Com coletor de eventos no lugar do áudio, medir exatamente três avisos de dano em 3→2→1→0 e um aviso de nível em 5→8. Confirmar zero avisos por renderizar 100 quadros inalterados, expirar anel, criar rodada, retomar ou reprocessar ID. No PC, ouvir os dois sons separadamente e num cenário com eventos próximos. Desativar/bloquear áudio, terminar a rodada e conferir todo o feedback visual. Repetir audição no Quest em E12.

### E08 — Sinalizar a última vida nas bordas da visão

**Objetivo.** Dar um aviso contínuo e discreto quando resta uma vida, mantendo centro e silhuetas livres.

**Entradas.** E02, E04, E06, R9, calibração de P05. **Saídas.** Efeito em `src/view/ui.ts` e CSS para o desktop, integração com a apresentação XR e casos de transição em `tests/state.test.ts`.

**Regras e execução.**
1. Derivar visibilidade do estado confirmado. Com três ou duas vidas, desligado. Ao passar de duas para uma, ligar. Pontuar ou subir de nível com uma vida mantém o aviso. Ao terminar, reiniciar ou voltar ao menu inicial, desligar. Política de pausa/contagem conforme P05.
2. Usar uma transição espacial suave da transparência central até o vermelho periférico. No desktop, a camada deve acompanhar o viewport e deixar passar ponteiro/toque. No VR, usar representação por olho na camada renderizada, fixada à visão. HTML externo ao canvas não aparece necessariamente na sessão imersiva.
3. Manter HUD e menus legíveis, sem escrever no buffer de profundidade de modo que esconda objetos. Evitar pulsação, flashes e alteração global da iluminação que mude a cor dos perigos. Atualizar/reutilizar o mesmo recurso ao redimensionar, girar a cabeça, pausar ou alternar sessão.

**Aceite.** Forçar estados 3, 2, 1, 0 pela lógica de teste. Comparar capturas da mesma cena em 2 e 1, verificando a região central e a progressão das bordas segundo P05. Conferir que a posição projetada dos alvos, bloqueio, toque e cliques do menu permanecem corretos. Subir de nível com uma vida e preservar a borda. Reiniciar e verificar sua remoção. Testar redimensionamento no PC e rotação da cabeça nos dois olhos. O aceite de discrição e conforto exige registro físico em E12.

### E09 — Persistir recordes nas oito categorias

**Objetivo.** Permitir que o aluno compare partidas disputadas na mesma dificuldade e com o mesmo tipo de controle.

**Entradas.** E02–E03, E06, D7, R10 e política de chave em P06. **Saídas.** `src/storage.ts`, `tests/storage.test.ts` e leitura do resultado em `ui.ts`/`main.ts`.

**Regras e execução.**
1. Fixar a categoria da rodada no início. Filtrar dificuldades e controles pelos valores conhecidos. Usar identificadores estáveis e apresentar nomes em português. Emulador usa a via VR; D7 prevê origem/perfil de teste para separar dados da apresentação.
2. Carregar o máximo válido da categoria. Aceitar somente pontuação inteira, finita e não negativa. Chave ausente ou valor inválido tem base zero. Proteger separadamente acesso ao armazenamento, leitura, interpretação e escrita.
3. Atualizar apenas ao terminar a rodada. Comparar resultado atual com máximo conhecido, gravar o maior e atualizar o valor em memória. Uma falha na gravação deve manter o melhor resultado da sessão e informar essa limitação na tela final.
4. Usar a origem efetiva. HTTP/HTTPS, hosts, portas locais diferentes e perfis distintos podem mostrar conjuntos diferentes. Preservar categorias vizinhas e dados antigos conforme P06. Saída de VR, pausa, limpeza de perigos e reinício sem conclusão não geram novo recorde.

**Aceite.** Parametrizar quatro modos × dois controles, escrever um valor distinto em cada categoria e recarregar. Em uma categoria, terminar com 6 e depois 3 pontos: melhor continua 6. Superá-lo com 8 e conferir 8. Terminar uma rodada de 0 em outra categoria e conferir isolamento. Exercitar dados ausentes, corrompidos, negativos, fracionários, não finitos, texto, falha de leitura e falha de escrita. Recarregar a mesma origem para teste de persistência e fechar/reabrir a tela de fim para verificar que o efeito não é aplicado duas vezes.

### E10 — Integrar e auditar a versão para computador e emulador

**Objetivo.** Verificar que modo, pontuação, contatos, feedback e recordes funcionam juntos usando as entradas normais.

**Entradas.** E01–E09, decisões de P01–P07, suíte de testes e instruções de uso. **Saídas.** Correções nos módulos responsáveis, README atualizado com execução e evidências, pacote `dist/` gerado pelo build e identificação da versão testada.

**Regras e execução.**
1. Em instalação limpa, executar os comandos documentados abaixo. Encerrar o servidor de desenvolvimento antes da prévia se necessário. A porta vem da saída do processo. Comandos que iniciam servidores ficam ativos durante o teste correspondente.

   ```sh
   npm ci
   npm run typecheck
   npm test
   npm run build
   npm run preview
   ```

2. Na prévia de produção, jogar a abertura completa pelas entradas normais. Confirmar tutorial, centro, escolha de cada modo, pausa, resultado, reinício e troca de modo conforme P02. Conferir a instrução ao abrir por arquivo e registrar instruções para `npm run dev` no README.
3. Realizar o percurso de aceitação abaixo no PC. Usar testes determinísticos para reproduzir condições específicas, como eventos no mesmo quadro. Repetir entrada/saída e amostras de gestos no emulador; identificar a ferramenta usada.
4. Examinar o console, carregamento de recursos, erros de áudio/gráficos, listeners, desafios e efeitos após reinícios. Confirmar português nas mensagens de sistema do jogo, inclusive XR indisponível. Gerar evidência da versão atual, sem reaproveitar o número histórico de testes como contagem nova.

**Percurso de aceitação integrado.**

| Preparação e ação | Estado e feedback esperados |
|---|---|
| Começar rodada no modo escolhido | 0 pontos, nível 1, 0/6, 3 vidas, nenhuma borda vermelha e nenhum som de avanço. |
| Desviar do primeiro vermelho, bloquear o azul, tocar o dourado | 3 → 5 → 6 pontos. Nível 2 e 0/9 no toque. Um aviso de avanço. Três vidas. |
| Perder uma vida em dois encontros diferentes | 3→2 com som de dano e borda desligada. 2→1 com segundo som e borda ligada. Pontuação e nível preservados. |
| Pontuar, pausar e retornar com uma vida | Borda segue a política aprovada durante a pausa, volta com a rodada e persiste ao ganhar pontos. Sem som duplicado, avanço por tempo nem dano imediato. |
| Perder a última vida | Um som de dano, 0 vidas, fim único, borda desligada e melhor resultado na categoria da rodada. |
| Jogar novamente e trocar de modo entre rodadas | Rodada nova começa em 0/6, 3 vidas, sem borda. A troca não transfere o recorde anterior. |
| Carregar a mesma URL outra vez | Menu inicial e recordes válidos preservados. Áudio aguarda um gesto válido quando o navegador exigir. |

**Aceite.** Tipos, testes e build passam. A página produzida abre, recarrega, recebe os gestos, avança por pontos e chega ao fim. Para cada uma das quatro dificuldades, registrar ao menos uma observação da cadência inicial e do painel. Registrar explicitamente o que só foi simulado e o que foi ouvido/visto.

### E11 — Preparar a publicação HTTPS da escola

**Objetivo.** Entregar o mesmo pacote de E10 em um endereço que possa iniciar uma sessão imersiva.

**Entradas.** E10, destino indicado pelo aluno em P08 e configuração de subcaminho da hospedagem, se houver. **Saídas.** `dist/` final, URL HTTPS e identificação da versão no README quando publicada.

**Regras e execução.** Validar primeiro o pacote estático local. Confirmar conta, repositório ou outro destino, e caminho a partir do qual os arquivos serão servidos. Ajustar a base do Vite somente se o host exigir, recompilar e repetir a prévia e a inspeção de recursos. Publicar apenas o pacote destinado à hospedagem. Registrar como reconhecer a versão servida. Se o destino ainda faltar, disponibilizar `dist/` pronto e registrar “publicação pendente”.

**Aceite.** Abrir a URL HTTPS em nova aba, recarregar, conferir certificado e requisições do JS/CSS sem 404 ou conteúdo misto, entrar no modo PC e confirmar o modo escolhido. Conferir acesso a partir da rede da escola na etapa física. Uma URL `localhost` do PC não é a URL escolar.

### E12 — Calibrar no Quest e encerrar a auditoria

**Objetivo.** Validar conforto, alcance, leitura, audição e fluidez no hardware real, em particular no Impossível com uma vida.

**Entradas.** E10–E11, P09, Quest com dois controles, URL e versão identificadas, perfis/efeitos escolhidos em P01/P04/P05. **Saídas.** Registro de modelo, versão do navegador/pacote, resultados medidos, alterações de parâmetros justificadas e checklist da seção 5 preenchido com evidências.

**Regras e execução.**
1. Abrir o link na rede escolar. Fazer o fluxo no visor, reconhecer individualmente as mãos, confirmar o centro após girar, tocar um anel por lado, bloquear com cada mão e desviar lateralmente nos dois sentidos.
2. Perder vidas de propósito em encontros separados, cruzar uma meta de pontos e distinguir os dois sons na partida. Com uma vida, ler o HUD, olhar para os lados e jogar vermelho, azul e dourado. Registrar se o vermelho periférico é percebido nos dois olhos e se atrapalha o próximo alvo. Repetir um trecho com o som desligado.
3. Conferir remoção/retorno do visor, perda de um controle, pausa/retomada, saída da sessão, reinício e recordes. Comparar os quatro modos na postura central. Anotar desconforto, erros de alcance e casos de incompatibilidade entre gestos.
4. Medir 60 s de carga alta reproduzível, com efeitos ativos, no ritmo mais intenso aprovado e com a simultaneidade permitida. Para curva assintótica, testar também sua envoltória de carga como cenário de medição, sem criar um último nível no jogo. Usar o período nominal da sessão `T = 1000 / Hz` em ms. Meta inicial D9: pelo menos 95% dos intervalos de quadro dentro de `1,2 × T`. A 72 Hz isso corresponde a cerca de 16,7 ms. Registrar duração, quantidade de amostras e proporção dentro da meta.
5. Se a taxa nominal não estiver exposta, registrar intervalos observados e percepção de fluidez, com a comparação numérica pendente. Havendo ajuste de balanço, armazenar valor anterior, valor novo, modo, razão e caso afetado; recompilar, republicar no destino aprovado e repetir os testes afetados.

**Aceite.** Descrever resultados por modelo e versão, incluindo visão binocular, leitura, gestos, distinção dos sons, duração da última vida e fluidez. Se o tempo de escola for curto, priorizar entrada XR, rastreamento, conforto, alcance, borda e fluidez. Marcar os casos restantes como pendentes. A validação física só termina com observação em aparelho real.

## 4. Tratamento de erros e exceções

| Estímulo ou falha a reproduzir | Comportamento e recuperação | Como conferir |
|---|---|---|
| Node incompatível, instalação interrompida ou divergência de lock | Registrar versões/erro, corrigir a causa, repetir instalação limpa e build preservando o trabalho do aluno. | A cópia limpa aceita `npm ci`; tipos, testes e pacote gerado correspondem à mesma versão. |
| Duplo clique no HTML, servidor parado ou porta diferente | Manter orientação em português no arquivo e README. Para jogar, iniciar o Vite na pasta e abrir o endereço efetivo. | Abrir por arquivo, depois iniciar pelo servidor. O segundo caminho chega à arena. |
| WebGL indisponível, inicialização incompleta ou perda de contexto | Indicar falha antes do início, suspender a rodada ativa e oferecer recuperação/recarga. Invalidar recursos antigos antes de voltar. | Resultado legível, botões coerentes, nenhuma simulação oculta, pontuação preservada ou retorno à entrada se houve recarga. |
| HTTP inseguro, XR ausente/sem suporte, sessão negada ou dois cliques rápidos | Exibir instrução de HTTPS/Quest ou modo de computador. Tratar rejeição e liberar tentativa posterior. Impedir duas solicitações simultâneas. | Não anunciar VR ativo antes da sessão real. Vidas e pontos permanecem intactos. |
| Controle ausente/invertido, pose atrasada, inválida ou tracking recuperado | Invalidar pose e contato antigos. Indicar o lado ausente, suspender, recuperar amostras e pedir confirmação/contagem. | Nenhum escudo congelado pontua e a retomada usa amostras novas. |
| Mudança de referência, aba oculta, visor retirado, menu do sistema, `visible-blurred`, saída do VR | Suspender relógio e agendador, limpar perigo sem prêmio se mudou o espaço, conservar categoria e rodada. Voltar pelo fluxo de E06. | Comparar estado antes/depois de 60 s externos e confirmar ausência de rajada retroativa. |
| Delta negativo, não finito, fora de ordem ou acima de 0,25 s | Descartar amostra inválida; para salto grande, suspender e limpar conforme D6. Reiniciar a base temporal. | Mesmo com objeto próximo à cabeça não há dano instantâneo nem ganho de nível por tempo. |
| Ocorrência repetida, duas mãos no mesmo alvo, colisão e passagem no mesmo quadro, terceiro dano concorrente | Ordenar por instante físico e desempates de E05. Marcar resultado uma vez. Ignorar eventos após o fim. | Repetir com ordem de iteração invertida. Conferir vidas, pontos, áudio, quantidade de fins e escrita do recorde. |
| Modo desconhecido ou perfil com duração não finita, velocidade negativa ou intervalo zero | Validar perfis antes da partida. Pedir escolha válida ou indicar falha de configuração. Conservar as demais categorias e registros. | Injetar configuração inválida no teste; nenhum lançamento ou recorde atribuído a modo errado. |
| Meta cruzada por excedente, evento inválido ou nível alto | Consumir apenas o custo da transição válida. Placar total continua inteiro não negativo. Valor inválido não deve produzir som, nível ou recorde. | Conferir tabela 2.4, repetir uma resolução e testar nível 100 e níveis superiores. |
| Janelas sobrepostas ou alvo inalcançável no Impossível | Rejeitar candidato e procurar outro encaixe com tentativas limitadas. Se falharem, adiar sem dívida de lançamentos. | Estressar o gerador sem congelamento; cada ação obrigatória respeita a recuperação aprovada. |
| Áudio bloqueado, suspenso ou que falha no meio do jogo | Prosseguir com HUD e borda. Tentar desbloquear no próximo gesto aplicável. Descartar avisos vencidos. | Jogar até o fim em silêncio, recuperar áudio e ouvir apenas novos eventos. |
| Indicador disponível só no monitor, desalinhado num olho, obscuro ou bloqueando clique | Corrigir a apresentação específica do ambiente e calibrar P05. O HUD mantém o número de vidas. | Verificar os dois olhos, o centro, mudança de aspecto e entrada do mouse. Manter item Quest pendente até confirmação. |
| Armazenamento indisponível, chave inválida ou escrita recusada | Tratar leitura e escrita separadamente, aceitar só dados válidos e usar máximo em memória. Informar quando o recorde vale só para a sessão. | Injetar falhas independentes, terminar mais duas rodadas e confirmar máximo e categorias. |
| Reinício, fim durante inicialização, temporizador ou áudio atrasado de rodada anterior | Cancelar inscrições/timers antigos ou vinculá-los à identidade da rodada. Limpar desafios e restaurar visual/entrada. | Três reinícios consecutivos e reentrada XR mantêm uma reação por gesto e ausência de borda com três vidas. |
| Link escolar abre no PC e falha no Quest | Conferir URL idêntica, rede, certificado, base dos recursos, suporte XR, modelo e navegador. Corrigir a causa observada e republicar a versão correspondente. | Repetir no mesmo aparelho e registrar nova versão e resultado. |

## 5. Checklist final de validação

Preencher no momento da execução. Cada marca precisa de referência a ambiente + versão + caso + observado. Manter “pendente”, com motivo, onde faltar decisão, publicação ou aparelho.

**Entrega e regressões anteriores**

- [ ] O executor identificou as decisões revisadas, a versão de base e quais P01–P09 se aplicam à tarefa executada.
- [ ] Instalação limpa pelo lock, tipos, testes e build concluídos. Prévia de produção aberta e recarregada.
- [ ] Duplo clique no HTML orienta o jogador. URL indicada pelo Vite inicia a partida em português no computador.
- [ ] A/D, retorno ao centro, seleção 1/2, mouse, mãos independentes e Esc funcionam pela entrada normal.
- [ ] Alvos continuam alcançáveis e visíveis. O primeiro trio mantém a ordem e permite experimentar cada gesto.

**Modos, níveis e placar**

- [ ] Os quatro nomes aparecem corretamente. Modo escolhido e tipo de controle são registrados separadamente.
- [ ] Todos começam no nível 1 com 0/6, três vidas e placar zero, inclusive o Impossível.
- [ ] Metas 6/9/12/15, totais 6/15/27/42 e excedente 5 + 3 → 8, nível 2, progresso 2/9 conferidos.
- [ ] Aguardar, pausar, retomar e perder vidas preservam progresso. Nenhum consumidor sobe nível a cada 30 s.
- [ ] Níveis altos continuam possíveis. Perfis respeitam unidades, ordem de dificuldade e os valores aprovados. O Impossível exige reação rápida desde o início.
- [ ] Mudança de nível ajusta novos desafios; objetos já lançados mantêm velocidade, trajetória e desfecho único.
- [ ] Todos os casos de E05 passaram. Vermelho ignora escudo; azul resolve o primeiro contato; dourado é opcional, alcançável e aceita as duas mãos.
- [ ] Aviso, janela do anel, recuperação e máximo de objetos conferidos, inclusive adiamento de conflito e ausência de rajada pós-pausa.
- [ ] Terceiro dano finaliza imediatamente uma única vez. Reinício limpa rodada, progresso e desafios.

**Comunicação ao jogador e continuidade**

- [ ] HUD informa modo, pontos totais, vidas, nível e progresso conforme P03, no PC e na apresentação imersiva.
- [ ] Cada perda de vida, inclusive a final, toca um dano. Cada subida real toca um avanço distinguível.
- [ ] Início, retomada, redesenho e resultado duplicado não repetem os sons. Jogo termina mesmo se áudio falhar.
- [ ] Borda ausente com 3 e 2 vidas, ligada com 1 durante a partida, removida no fim e no reinício.
- [ ] Centro livre e menus acionáveis. Persistência após pontuar e comportamento de pausa conferidos.
- [ ] Pausa manual congela a simulação; interrupção de tracking/visibilidade/referência trata pose antiga; retomada explícita com 3 s testada.
- [ ] Reentrada na mesma página conserva a rodada e categoria. Recarga retorna à entrada. Reinícios não duplicam efeitos ou ciclo.
- [ ] Oito categorias de recorde isoladas. Resultados de 6 e 3 preservam 6; falha de leitura/escrita e recarga na mesma origem testadas.

**Publicação e aceite físico**

- [ ] Destino HTTPS confirmado pelo aluno, pacote identificado, URL no README e recursos acessíveis após recarga.
- [ ] Emulador exercita cabeça, mãos separadas, entrada, saída e recuperação XR.
- [ ] **Quest:** registrar modelo, navegador, rede da escola, URL e versão efetivamente testada.
- [ ] **Quest:** centralização, escolha de modo, três gestos por postura/mão aplicável, gatilho nos menus e reinício conferidos.
- [ ] **Quest:** ambos os sons reconhecíveis; HUD e borda legíveis com uma vida nos dois olhos, inclusive ao mover a cabeça.
- [ ] **Quest:** testar pausa, tracking e saída/retorno; verificar que a visão não fica tingida numa rodada nova.
- [ ] **Quest:** 60 s de carga alta medidos e resultado D9 anotado. Ajustes físicos registrados, recompilados e revalidados.

### Perguntas pendentes para o aluno — recomendações para validar ou ajustar

As regras de pontos, os quatro modos, o nível sem limite, os dois sons obrigatórios, o aviso de última vida e as oito categorias de recorde já estão decididos. As perguntas abaixo tratam de **como** concretizar essas escolhas e de informações ainda indisponíveis. Cada recomendação é uma proposta de trabalho.

**P01 · Qual ritmo inicial, curva por nível e intensidade prática deseja em cada modo?**  
**Recomendação para o primeiro ensaio.** Usar os tempos de voo já discutidos como referências, com aproximação gradual aos valores de alta intensidade. Manter o número de níveis ilimitado. Os intervalos de lançamento e fatores abaixo são sugestões novas para calibração, em aberto. Os valores de alta intensidade são referências de conforto para a curva proposta, sem disparar fim de rodada ou congelar a contagem de níveis.

| Modo | Voo no nível 1 → referência em nível alto (s) | Intervalo nominal inicial → referência em nível alto (s) | Fator por nível proposto |
|---|---:|---:|---:|
| Fácil | 2,00 → 1,20 | 2,20 → 1,30 | 0,94 |
| Médio | 1,60 → 0,70 | 1,60 → 0,70 | 0,90 |
| Difícil | 1,20 → 0,60 | 1,20 → 0,60 | 0,86 |
| Impossível | 0,70 → 0,50 | 0,90 → 0,55 | 0,82 |

Se aprovada, aplicar separadamente a cada duração: `valor(n) = referência + (inicial − referência) × fator^(n − 1)`. Para a distância nominal de 2,4 m, obter a velocidade por `2,4 / tempoDeVoo(n)`. Exemplo de conferência: no Médio, nível 2, voo e intervalo ficam em 1,51 s e velocidade em aproximadamente 1,59 m/s. Aviso de 0,4 s precede o lançamento e não integra o tempo de voo. A regra de recuperação pode aumentar o intervalo efetivo. Validar a diferença perceptível entre os modos e recalibrar no Quest.

**P02 · Qual modo aparece selecionado, quando pode mudar e o que faz “Jogar novamente”?**  
**Recomendação.** Selecionar Médio na primeira visita, pois é a referência do protótipo. Permitir escolher qualquer modo antes de começar. “Jogar novamente” repete a dificuldade da rodada concluída e “Escolher modo” retorna ao menu. Conservar a escolha durante pausa/retomada. Na mesma rodada XR, reentrar em VR restaura a categoria original. Para passar do VR ao teclado ou vice-versa, oferecer nova rodada na categoria escolhida. Guardar a última seleção apenas enquanto a página estiver aberta.

**P03 · Como exibir o progresso e o resultado, inclusive no visor?**  
**Recomendação.** Mostrar modo, placar total, vidas restantes e nível com progresso numérico. Para total 8, por exemplo, mostrar “Médio · 8 pontos · 2 vidas · Nível 2 · 2/9”. No fim, apresentar modo, pontos, nível atingido e recorde daquela combinação de controle/modo. Usar painel curto e fora da trajetória; ajustar posição/tamanho em visão binocular.

**P04 · Que sons usar, como priorizá-los e como desligá-los?**  
**Recomendação.** Usar tom grave descendente curto para dano (ensaio de 180 ms), duas ou três notas ascendentes para avanço (ensaio de 300 ms) e toque mais discreto para acerto comum. O acerto que sobe de nível toca o sinal de avanço em lugar do toque comum. Cada dano, inclusive o final, conserva seu som. Para dois eventos válidos distintos muito próximos, respeitar a ordem do jogo e evitar que o sinal secundário encubra o principal. Começar com volume moderado, opção “Som ligado/desligado” na entrada/pausa e ajuste de ganho em teste auditivo. Rejeição do áudio mantém os indicadores visuais.

**P05 · Qual intensidade da borda e o que mostrar na pausa?**  
**Recomendação.** Gradiente vermelho estável, sem piscar. Como primeiro ensaio, manter transparentes os 75% centrais de largura e altura de cada vista e crescer suavemente até cerca de 10% de opacidade na extremidade. Avaliar com cena idêntica, alvo azul e vermelho e movimento de cabeça. Exibir ao jogar com uma vida; ocultar nos menus/pausa/contagem e restaurar quando a simulação voltar. Não ligar ao levar o primeiro dano. Se no visor o aluno não perceber o alerta ou tiver a mira prejudicada, ajustar intensidade e extensão e registrar os valores aceitos.

**P06 · Como nomear os recordes locais e lidar com versões antigas?**  
**Recomendação.** Usar uma chave versionada por categoria, por exemplo `teste-de-reflexos:v2:recorde:<controle>:<modo>`, com IDs internos estáveis. Guardar o inteiro decimal, validar o conteúdo inteiro antes de converter e rejeitar negativos ou frações. Reservar `desktop` e `vr` para os controles e quatro IDs sem acentos para os modos. O protótipo inspecionado não grava recordes. Se surgir uma versão intermediária com pontuação sem categoria, preservar os dados antigos e começar as oito listas da versão 2 sem atribuição automática.

**P07 · Qual tolerância usar ao retomar da pausa e ao comparar contatos simultâneos?**  
**Recomendação.** Guardar a pose central e as poses no momento da pausa manual. Para o primeiro ensaio, considerar mudança superior a 5 cm na cabeça ou em uma mão, ou giro superior a 10° na cabeça/escudo, como mudança relevante da postura congelada. Se exceder essas referências, revalidar centro e limpar desafios sem pontuar antes da contagem. Calibrar para que tremor normal de tracking não descarte a partida. Para empate numérico de contatos, testar uma pequena tolerância explícita (proposta inicial: diferença de até 0,000001 no intervalo normalizado do quadro); conferir ambos os lados da fronteira antes de fixar. Ordem física prevalece fora da tolerância.

**P08 · Em qual conta, repositório ou host publicar a versão da escola?**  
**Recomendação.** Usar GitHub Pages se o aluno indicar um repositório autorizado, conforme D9; senão, usar o host estático HTTPS que ele indicar. Informar destino e caminho público antes de publicar. Essa informação só condiciona E11 e a verificação escolar de E12.

**P09 · Qual emulador está disponível e quais são o aparelho, navegador e janela de teste da escola?**  
**Recomendação.** Usar em casa um emulador WebXR compatível que permita manipular cabeça e dois controles de forma independente. Registrar nome e versão realmente usados. Na primeira visita à escola, anotar modelo do Quest, versão do navegador, taxa nominal se exposta, acesso à rede e tempo disponível. Reservar primeiro o teste de alcance, feedback da última vida e conforto, seguido dos 60 s de medição. Uma informação desconhecida pode permanecer “a medir no aparelho”.

Para ajustar as escolhas de calibração depois desta execução, identificar **P01–P07** e indicar o valor desejado. Para finalizar as tarefas externas, indicar o destino HTTPS em P08 e os dados conhecidos do Quest/escola em P09. A resposta “ainda não sei” mantém apenas a publicação ou a medição correspondente pendente.
