# База данни

## Технологии

- PostgreSQL 17
- Prisma ORM

---

# Локална база

Основна база:

```
therapistdesk
```

Shadow база:

```
therapistdesk_shadow
```

---

# Конфигурация

Използва се:

```
DATABASE_URL
DIRECT_URL
SHADOW_DATABASE_URL
```

---

# Правила

Всички промени по структурата на базата се правят чрез Prisma Migrate.

Не се редактира базата ръчно.

Не се използва:

```
prisma db push
```

освен при изрично решение.

---

# Добавяне на ново поле

1. Променя се:

```
prisma/schema.prisma
```

2. Изпълнява се:

```bash
npm run db:migrate -- --name име_на_промяната
```

3. Prisma:

- създава migration.sql
- обновява therapistdesk
- обновява therapistdesk_shadow
- обновява _prisma_migrations
- генерира Prisma Client

---

# Проверка

Отваряне на Prisma Studio:

```bash
npm run db:studio
```

---

# Seed

Главен файл:

```
backend/prisma/seed.ts
```

Модули:

```
backend/prisma/seed/
```

---

# Забранени действия

Не се редактират migration.sql файлове след commit.

Не се изтриват миграции от Git историята.

Не се използва db push като заместител на миграции.

---

# Възстановяване

При проблем:

1.

```bash
git status
```

2.

```bash
git diff
```

3.

Проверява се schema.prisma.

4.

Проверява се историята на миграциите.

5.

Едва след това се предприемат промени по базата.