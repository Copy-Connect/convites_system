# Patch SQLite — Convites

Este patch troca o Prisma para **SQLite** e inclui um `.env.example` pronto.

## Como aplicar
Copie a pasta `backend/` deste patch para dentro do seu `apps/backend/` (ou raiz do backend), **mesclando** os arquivos.

## Passos
1. Instalar deps e gerar o client
   ```bash
   pnpm -C apps/backend i
   pnpm -C apps/backend prisma generate
   ```
2. Criar o banco e aplicar migrações (dev)
   ```bash
   pnpm -C apps/backend prisma migrate dev --name init
   pnpm -C apps/backend prisma db seed
   ```
   > Se você **já** tem um `dev.db` com tabelas: use `prisma db pull` antes, ajuste o `schema.prisma` se necessário e depois `prisma generate`.

3. Subir a API
   ```bash
   pnpm -C apps/backend start:dev
   ```

## Observações
- O arquivo do banco ficará em `apps/backend/prisma/dev.db`.
- Para melhorar concorrência em SQLite, ative `WAL` no boot da app:
  ```ts
  // em algum lugar no bootstrap do backend, opcional
  // await prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL');
  ```
- Em produção, **garanta persistência** do arquivo `dev.db` no caminho configurado (não use pastas temporárias do provedor).
