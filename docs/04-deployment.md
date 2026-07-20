## Prisma migrations

При всяка промяна в `schema.prisma`:

1. Създай нова миграция:

```bash
npm run db:migrate -- --name <migration_name>
```

2. Провери, че приложението работи локално.

3. Commit и push на кода заедно с миграцията.

4. Deploy в Render.

5. Приложи миграциите към production базата:

```bash
npm run db:deploy
```

6. Провери Render логовете.

Ако се появи грешка като:

```
P2021
The table `...` does not exist
```

това означава, че production базата не е мигрирана до текущата версия.