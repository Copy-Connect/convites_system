Visão geral do repositório
Monorepo com PNPM – O arquivo pnpm-workspace.yaml define dois conjuntos de pacotes: apps/* (aplicações) e packages/* (bibliotecas compartilhadas).

O package.json raiz contém scripts que rodam backend e frontend simultaneamente com pnpm dev.

Packages compartilhados
O pacote @convites/shared reúne tipos e DTOs reutilizados entre backend e frontend, incluindo definições de pedidos e autenticação e o tipo OrderStatus.

Backend (apps/backend)
Construído com NestJS e organizado em módulos (AuthModule, OrdersModule, ThemesModule, PaymentsModule) carregados pelo AppModule.

O main.ts inicializa o servidor, aplicando ValidationPipe e HttpExceptionFilter globais para validação e tratamento de erros.

O schema.prisma modela o banco MySQL com entidades User, Theme, Order e Payment, além do enum OrderStatus.

AuthService utiliza Argon2 para hash de senhas e JWT para emitir tokens de acesso e refresh.

Integração de pagamento via PagSeguro, implementada no PagSeguroGateway com chamadas HTTP e tradução de webhooks de status de pagamento.

Frontend (apps/frontend)
Aplicação Vue 3 + Vite com Pinia e Vue Router, conforme package.json.

main.ts instancia a aplicação Vue, acoplando store e roteador.

O roteador define rotas para login, registro, dashboard e fluxo de pedidos, exigindo autenticação em rotas internas através de um guard que consulta o store de auth.

O store auth.store.ts gerencia token JWT e dados do usuário em localStorage.

AuthService no frontend abstrai chamadas HTTP de login e registro para o backend via um cliente REST simples.

Pontos importantes para quem está começando
Tipos compartilhados – Revise o pacote @convites/shared para entender o formato das requisições e respostas usadas entre front e back.

Arquitetura do backend – Explore src no backend: módulos em modules/, regras de negócio em domain/ e implementações de infraestrutura em infrastructure/. O arquivo AppModule mostra como tudo é conectado.

Prisma e banco de dados – O schema.prisma descreve o modelo relacional; utilize pnpm -C apps/backend prisma:dev para gerar migrations e dados seed quando estiver desenvolvendo.

Fluxo de autenticação – Veja AuthService no backend e auth.store.ts no frontend para entender como o login funciona, do hash de senha até o armazenamento do token.

Pagamentos – O gateway PagSeguro centraliza comunicação com a API de pagamentos; estudar esse módulo ajuda a entender o fluxo de cobrança e webhooks.

Frontend em Vue – Comece pelos arquivos main.ts e router/index.ts para ver como o app é montado e roteado. O Pinia store (auth.store.ts) demonstra o gerenciamento de estado reativo.
