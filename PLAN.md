# Plano de evolução — Anatomia em Foco

## 1. Estruturas individuais

Concluído: 202 estruturas ósseas do modelo original, com identificação em português e lateralidade. Lista organizada por conjuntos expansíveis. Selecionar no modelo ou na lista destaca apenas aquela estrutura e enquadra pela frente. O conjunto continua disponível para exploração regional.

## 2. Visualização e revisão

Concluído: controle de visibilidade do contexto entre 0 e 100%, isolamento e restauração. Revisão por cliques com lista de respostas escondida, filtro de região, acertos de primeira, questões concluídas e retomadas dos erros após outras questões. Revelar uma resposta também agenda sua retomada. Estado limitado à sessão aberta; não existe sincronização de progresso.

## 3. Acidentes ósseos

Concluído: cabeça, colo, trocânteres maior e menor e côndilos medial e lateral do fêmur. As âncoras derivam do segundo vértice das linhas de anotação `.j` do atlas Z-Anatomy. O lado esquerdo usa reflexão na linha mediana, validada contra os fêmures bilaterais do mesmo modelo. Marcadores indicam uma localização, não toda a extensão da estrutura.

## 4. Músculos do ombro

Concluído: deltoide, supraespinal, infraespinal, redondo menor e subescapular, bilateralmente. As três porções do deltoide são selecionadas como um músculo de cada lado. Textos com origem, inserção e ação; opção de exibir apenas o manguito rotador. Sem animação de movimento ou simulação biomecânica.

## Validação desta entrega

- Nomes traduzidos e IDs únicos para todas as 202 estruturas; lateralidade explícita.
- Integridade de vértices e índices dos arquivos de ossos e músculos.
- Enquadramento frontal validado para 212 alvos em três proporções de tela.
- Estados de revisão: erro, acerto, resposta revelada, retomada e término da rodada.
- Marcas do fêmur próximas à geometria original, sem coordenadas anatômicas inventadas.
- Projeções dos modelos inspecionadas para conferir alinhamento dos músculos e âncoras.
- Sintaxe de JavaScript, estrutura do HTML e referências locais verificadas. Sem teste em navegador real nesta entrega.


## Aula guiada e progresso

Aula do ombro em 12 etapas, com explicações, foco frontal e três atividades de identificação. O histórico e a retomada são persistidos por usuário autenticado em D1. A opção Revisar meus erros reúne estruturas com último resultado incorreto, inclusive respostas reveladas; um novo acerto remove a pendência. A rodada em andamento continua sendo temporária. Falhas de conexão mantêm a fila nesta página, com aviso e tentativa manual.

Build: `npm run build`. Migrações Drizzle em `drizzle/`; não alterar migrações publicadas. Teste funcional do armazenamento: `node tests/progress.test.mjs` (SQLite real, isolamento por usuário, idempotência, retomada e recuperação da fila). Frontend autoral permanece em `dist/`; servidor gerado em `dist/server/`.


## Aula do joelho

Seletor com ombro (12 etapas) e joelho (10 etapas, quatro atividades). Progresso independente por aula usando a chave composta existente, sem mudança de esquema ou migração dos dados anteriores. API mantém o campo `lesson` e a aula padrão para clientes antigos. Enquadramento regional do joelho calculado a partir da patela; os ossos continuam selecionáveis por inteiro. Fontes: OpenStax Anatomy and Physiology 2e, 8.4 e 9.6, vinculadas nos créditos. Não são simulados movimentos ou tecidos ausentes do modelo.


## Sequência introdutória completa

Nove aulas, 90 etapas e 34 atividades: crânio, coluna, tórax, ombro, cotovelo, mão, quadril, joelho e tornozelo. Seletor por região, estado de conclusão e botão para a próxima aula pendente. Referência OpenStax em cada aula. Dados anteriores preservados sem alteração do esquema. Testes: `node tests/progress.test.mjs` e `node tests/lessons.test.mjs`. O segundo usa os modelos reais para verificar alvos e enquadramentos frontais em três proporções de tela; não usa navegador.


## Navegação e revisão das aulas

Navegação direta para etapas concluídas, etapa atual e primeira pendente, com retomada salva sem apagar conclusões. Revisão específica usa os focos e alvos individuais elegíveis da aula, muda a camada por questão e permite voltar ao roteiro. Marcações do fêmur agora enquadram sua vizinhança mantendo a vista frontal; remover marcação volta ao osso inteiro. `node tests/study.test.mjs` verifica navegação, revisão, retomadas e enquadramentos locais.


## Revisão geral e pendências

Revisão geral reúne apenas focos/alvos individuais elegíveis de etapas concluídas, sem duplicação entre aulas. Lista de erros pendentes abre estruturas no modo Explorar, mantendo a pendência até novo acerto. Revisões gerais e de erros preservam seu escopo ao reiniciar a rodada. Nenhuma mudança de esquema ou regra de salvamento.


## Rodadas curtas

Seleção de até 5, 10 (padrão), 20 ou todas as estruturas, aplicada à próxima rodada após embaralhar e remover duplicatas. Erros continuam voltando como tentativas extras. Resumo final mostra acertos na apresentação inicial, tentativas extras e estruturas difíceis com acesso ao modelo. Score inicial separado das retomadas; histórico global mantém sua regra anterior. Teste: `node tests/rounds.test.mjs`.


## Exploração por nome e lado

Busca combina palavras em qualquer ordem, nome anatômico, nome original e sinônimos introdutórios já usados nos textos. Filtro de lado afeta a lista, com contagem e limpeza; não esconde o modelo. Atalho ao equivalente contralateral disponível apenas em Explorar, sempre com enquadramento frontal. `node tests/explore.test.mjs` verifica busca e correspondência bilateral de todos os registros.


## Controles do visualizador

Botões de zoom sobre o alvo atual, tela cheia da área de estudo e ajuda de teclado. Canvas recebe foco com Tab; setas orbitam, +/- ajustam distância, 0 reenquadra de frente e F alterna tela cheia. Combinações Ctrl/Alt/Meta preservadas. Tela cheia depende da capacidade nativa do navegador e mantém os painéis; botão escondido quando indisponível. Zoom do mouse continua com zoomToCursor. `node tests/camera.test.mjs` verifica matemática dos controles, limites e proteção nos polos.


## Consolidação da interface e renderização

Painel de aulas/revisões recolhível, inicialmente fechado, com contagem sempre visível; falhas de salvamento abrem o painel automaticamente. Mais espaço para a lista de estruturas quando recolhido. FrameScheduler agrupa pedidos e mantém quadros apenas durante alterações, inércia e transições; sem loop WebGL contínuo em repouso. Alterações de materiais, planos, marcações, câmera e tamanho invalidam o quadro. `node tests/render-loop.test.mjs` verifica agendamento e retorno ao repouso.


## Retomada e links de estruturas

Última aula derivada do updated_at já persistido, restaurada uma vez ao carregar sem sobrepor escolha explícita do usuário. Entrar na aula salva o ponto de retomada sem marcar etapa concluída. Links usam fragmento estrutura com IDs validados após carregamento; abertura sempre em Explorar e de frente. Cópia apenas por clique explícito, com campo manual de fallback. Sem alteração de acesso do Site e sem mudança de esquema.


### Anotações por estrutura
Painel Minhas anotações em cada osso ou músculo, com até 4.000 caracteres e salvamento explícito na conta. Rascunhos permanecem na sessão ao trocar de estrutura; edições simultâneas exigem escolher qual versão manter. Migração aditiva structure_notes, isolamento por usuário e concorrência por versão. Verificado com tests/notes.test.mjs em SQLite real e testes existentes de aulas.
