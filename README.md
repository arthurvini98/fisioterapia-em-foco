# Anatomia em Foco

Atlas introdutório estático em português, com Three.js 0.170.0 servido localmente. Não requer servidor de aplicação, conta adicional ou chave de API. Sirva a pasta `dist` por HTTP.

## Conteúdo

Esqueleto derivado de Z-Anatomy, navegação orbital, seleção individual de 202 estruturas ósseas, grupos expansíveis, isolamento, contexto com transparência ajustável, revisão por identificação com retomada dos erros e planos anatômicos esquemáticos. Cada seleção é enquadrada de frente. Inclui cinco músculos do ombro em ambos os lados e seis acidentes ósseos de cada fêmur. O progresso da revisão existe somente na sessão atual. Não é um módulo de diagnóstico ou simulação biomecânica. Veja `PLAN.md` para o plano executado e suas verificações.

## Procedência dos modelos

Fonte: https://github.com/Z-Anatomy/Models-of-human-anatomy — `Z-Anatomy.zip`, `Z-Anatomy/Startup.blend`.

Créditos: BodyParts3D — The Database Center for Life Science — CC BY-SA 2.1 Japan; Z-Anatomy — The libre 3D atlas of anatomy — CC BY-SA 4.0; Gauthier Kervyn e colaboradores. A licença original acompanha a distribuição em `dist/LICENCA-modelo.txt`. Os modelos derivados `skeleton.bin` e `skeleton.json` são distribuídos sob CC BY-SA 4.0.

Adaptações: seleção de ossos e músculos do ombro, remoção de textos, demais tecidos, dentes e ossículos auditivos; redução de polígonos dos ossos; conversão de coordenadas para Y superior; normalização uniforme da altura. Não foram inventadas geometrias anatômicas. O número de estruturas selecionáveis inclui partes do esterno e não corresponde à contagem convencional dos 206 ossos. Todos os modelos derivados, incluindo `shoulder.bin`, `shoulder.json` e `landmarks.json`, são disponibilizados sob CC BY-SA 4.0 com os mesmos créditos.

Para reproduzir, execute `export-model.py` com Blender 4.2 em modo background e informe o caminho do `.blend` após `--`.

Textos introdutórios e referências: OpenStax, Anatomy and Physiology 2e, capítulos 7, 8 e 11.5; StatPearls, Anatomy, Rotator Cuff (https://www.ncbi.nlm.nih.gov/books/NBK441844/). Conferir sempre com o material da disciplina. O modelo representa um adulto específico e não toda a variação anatômica humana. `export-shoulder.py` exporta a camada muscular e as âncoras; usa a mesma transformação fixa do esqueleto desta versão.

## Verificação

Validar sintaxe dos módulos, referências locais, alinhamento dos dados binários, índices, limites geométricos e presença dos grupos esperados antes de publicar. A publicação inicial não inclui teste em navegador real.


## Aula guiada e progresso

Aula do ombro em 12 etapas, com explicações, foco frontal e três atividades de identificação. O histórico e a retomada são persistidos por usuário autenticado em D1. A opção Revisar meus erros reúne estruturas com último resultado incorreto, inclusive respostas reveladas; um novo acerto remove a pendência. A rodada em andamento continua sendo temporária. Falhas de conexão mantêm a fila nesta página, com aviso e tentativa manual.

Build: `npm run build`. Migrações Drizzle em `drizzle/`; não alterar migrações publicadas. Teste funcional do armazenamento: `node tests/progress.test.mjs` (SQLite real, isolamento por usuário, idempotência, retomada e recuperação da fila). Frontend autoral permanece em `dist/`; servidor gerado em `dist/server/`.


## Aula do joelho

Seletor com ombro (12 etapas) e joelho (10 etapas, quatro atividades). Progresso independente por aula usando a chave composta existente, sem mudança de esquema ou migração dos dados anteriores. API mantém o campo `lesson` e a aula padrão para clientes antigos. Enquadramento regional do joelho calculado a partir da patela; os ossos continuam selecionáveis por inteiro. Fontes: OpenStax Anatomy and Physiology 2e, 8.4 e 9.6, vinculadas nos créditos. Não são simulados movimentos ou tecidos ausentes do modelo.


Aula de tornozelo e pé: 10 etapas, quatro atividades, enquadramento regional por tálus e calcâneo e progresso próprio. Fonte: OpenStax 8.4. Sem alteração de esquema.


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

### Hospedagem no Railway

A adaptação independente com Node.js, SQLite persistente e acesso público com históricos separados por navegador está em `server/`. Ver `RAILWAY.md` para configurar GitHub, volume, variáveis e publicação automática. A transferência dos dados antigos e a primeira publicação no Railway permanecem pendentes.

## Laboratório de peças da prova prática

`/pecas.html` isola seis regiões: pelve/sacro, L3, clavícula direita, esterno, mão direita e pé direito. São 64 pontos: 36 extremidades de anotações anatômicas do Z-Anatomy e 28 identificadores de ossos/partes inteiras. Os pontos anatômicos usam o vértice 1 da anotação original após avaliação dos modificadores Hook; os dos ossos inteiros usam um vértice próximo ao centro da malha. Forames são identificados no espaço da abertura, não projetados artificialmente na superfície.

Selecionar um ponto orienta e aproxima a câmera; a lista funciona com teclado. Há seis vistas, isolamento do osso, ocultação de nomes, pesquisa e links diretos. Pontos encobertos por geometria opaca são ocultados para evitar identificação através da peça. O carregamento é por região, sem substituir `skeleton.bin`. Os modelos do Sketchfab indicados pelo usuário são incorporados sob demanda como comparação externa, mantendo o original e seus créditos; suas coordenadas e anotações não são transplantadas para as nossas peças.

A geometria nativa é a malha disponível no atlas, sem decimação adicional nem subdivisão que invente detalhe. Algumas peças, como L3 e quadril, já são simplificadas na fonte. O sacro preserva os triângulos do original, que tinham sido reduzidos no esqueleto geral. Isso não equivale à resolução da digitalização de 153 mil triângulos indicada no Sketchfab.

Reprodução com Python 3.11 e bpy 4.2.0, a partir de `Z-Anatomy/Startup.blend` do repositório original:

```sh
python export-study-pieces.py /caminho/Startup.blend /tmp/extracted-study.json
python package-study-pieces.py /tmp/extracted-study.json
node translate-study-pieces.mjs
node tests/pieces.test.mjs
node tests/exam.test.mjs
```

A extração carrega somente os objetos necessários, sem executar scripts do arquivo. Os testes verificam índices, coordenadas finitas, proximidade das marcações à superfície (com exceções explícitas para forames), enquadramento, nomes e links. Uma falha de WebGL mantém a lista de pontos acessível e oferece nova tentativa.
