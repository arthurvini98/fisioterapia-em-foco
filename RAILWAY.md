# Anatomia em Foco no Railway

## O que está preparado

Servidor Node.js 24, Dockerfile, healthcheck `/healthz`, SQLite persistente e migrações automáticas transacionais. O modelo 3D e os recursos de estudo existentes são reutilizados. O Dockerfile não depende de Sites nem executa o build do Worker.

Esta configuração é para **uma pessoa**, com usuário e senha no diálogo de autenticação do navegador. Quem receber essas credenciais terá acesso ao mesmo progresso e às mesmas anotações. Para contas individuais de colegas, implementar autenticação multiusuário antes de compartilhar credenciais.

## Primeira publicação

1. Criar um repositório privado no GitHub e enviar este projeto, incluindo `dist`, `server`, `worker` e `drizzle`. Não incluir `.env`, banco de dados ou credenciais.
2. No Railway, criar um projeto com **Deploy from GitHub repo** e selecionar o repositório e a branch `main`.
3. Anexar ao serviço um **Volume** montado em `/data`. Usar uma única réplica.
4. Configurar as variáveis do serviço:

| Variável | Valor |
| --- | --- |
| `APP_USERNAME` | Seu nome de login, sem dois-pontos |
| `APP_PASSWORD` | Senha exclusiva com pelo menos 16 caracteres, definida diretamente no Railway |
| `DATA_DIR` | `/data` |
| `APP_ORIGIN` | URL HTTPS exata do serviço, sem caminho, após gerar o domínio |

O Railway fornece `PORT`. O servidor escuta em `0.0.0.0`. Se `RAILWAY_PUBLIC_DOMAIN` estiver disponível, ele define a origem automaticamente; `APP_ORIGIN` prevalece, especialmente para domínio próprio.

5. Gerar o domínio em Settings → Networking. Aplicar as variáveis e publicar. O serviço não inicia no Railway sem volume persistente e origem configurada.
6. Abrir o endereço, informar usuário e senha e conferir uma anotação e uma etapa de aula. Fazer um redeploy para confirmar que os dados permanecem. Ativar backups do volume no Railway.

## Mudanças futuras

Depois de vincular GitHub e Railway, cada push na branch conectada dispara uma nova publicação. Fluxo local:

```sh
npm run test:railway
node tests/notes.test.mjs
node tests/progress.test.mjs
git add <arquivos-alterados>
git commit -m "Descreva a mudança"
git push github main
```

Use o nome real do remote do GitHub se ele for diferente de `github`. Ainda não há remote do GitHub configurado neste checkout. O repositório anterior é separado do GitHub e não é uma fonte de autodeploy para o Railway.

As migrações em `drizzle/*.sql` são aplicadas uma vez na inicialização, após montar o volume. Não editar migrações já aplicadas; criar novas. Não usar pre-deploy para alterar este SQLite: o volume precisa estar montado no processo que o abre.

## Dados da hospedagem anterior

**O banco D1 e o login do Sites não são transferidos pelo Git.** O primeiro banco do Railway começa vazio. A hospedagem anterior continua com os dados originais. Antes de desativá-la, exportar progresso e anotações por um caminho autenticado, validar o conteúdo e importá-los no SQLite com a identidade `personal-owner` (ou o `APP_USER_ID` configurado). Essa transferência ainda não foi feita.

## Teste local

Com Node.js 24, definir `APP_USERNAME`, `APP_PASSWORD` e `APP_ORIGIN=http://localhost:3000` no ambiente e executar `npm start`. O banco local fica em `data/`, ignorado pelo Git. Os testes usam credenciais fictícias e banco temporário.

## Validação realizada

Testes HTTP reais: autenticação, arquivos do modelo, bloqueio de arquivos internos, identidade definida pelo servidor, bloqueio de origem externa, progresso, conflito de notas e persistência após reinício. O container e a publicação no Railway ainda precisam ser executados na conta conectada.

## Referências

- [Autodeploy pelo GitHub](https://docs.railway.com/deployments/github-autodeploys)
- [Volumes persistentes](https://docs.railway.com/volumes)
- [Dockerfiles](https://docs.railway.com/builds/dockerfiles)
- [Healthchecks](https://docs.railway.com/deployments/healthchecks)
