# O projeto possui um Devcontainer para desenvolvimento

VS Code e escolha:

`Dev Containers: Reopen in Container`

Ao abrir, o container instalará as dependências com `pnpm install` e gerará o Prisma Client.

Para preparar o banco SQLite:

```bash
pnpm -C apps/backend prisma migrate dev --name init
pnpm -C apps/backend prisma db seed
```

Para subir backend e frontend juntos:

```bash
pnpm run dev
```

Portas esperadas:

- Backend: 3000
- Frontend Vite: 5173
