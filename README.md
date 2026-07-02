Visao geral do repositorio

Monorepo com PNPM. O arquivo `pnpm-workspace.yaml` agrupa os apps do projeto em `apps/*`.

O `package.json` raiz contem scripts para subir backend e frontend em paralelo com `pnpm run dev`.

Backend (`apps/backend`)

Aplicacao NestJS com modulos de autenticacao, pedidos e pagamentos carregados pelo `AppModule`.

O `main.ts` inicializa a API HTTP e o `schema.prisma` descreve as entidades `User`, `Theme`, `Order` e `Payment`.

`AuthService` cuida de hash de senha com Argon2 e emissao de JWT.

`PagSeguroGateway` centraliza a integracao de pagamentos.

Frontend (`apps/frontend`)

Aplicacao Vue 3 + Vite com Pinia e Vue Router.

`main.ts` monta a aplicacao, conecta o roteador e registra o store.

O roteador define as rotas de login, cadastro, dashboard e pedidos, protegendo as rotas internas com o store de autenticacao.

`auth.store.ts` persiste token JWT e dados do usuario em `localStorage`.

`AuthService` abstrai as chamadas HTTP de login e cadastro.

Pontos importantes para comecar

Arquitetura do backend: explore `apps/backend/src` e use o `AppModule` como ponto de entrada para entender as dependencias.

Prisma e banco de dados: use `pnpm -C apps/backend prisma:dev` para criar migracoes e popular dados de desenvolvimento.

Fluxo de autenticacao: veja `AuthService` no backend e `auth.store.ts` no frontend.

Pagamentos: o modulo de pagamentos concentra checkout, consulta de status e webhook.

Frontend em Vue: comece por `main.ts` e `router/index.ts`.
