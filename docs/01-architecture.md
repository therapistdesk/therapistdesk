# Архитектура

## Общ преглед

TherapistDesk е разделен на две основни приложения:

```
frontend/
backend/
```

Те комуникират чрез REST API.

---

# Frontend

Технологии

- React
- Vite

Основни функции

- регистрация на терапевт
- вход
- календар
- клиенти
- срещи
- повтарящи се срещи
- бележки
- клиентски портал

Frontend никога не достъпва директно базата данни.

Всички заявки минават през Backend API.

---

# Backend

Технологии

- NestJS
- Prisma
- PostgreSQL

Backend съдържа бизнес логиката.

Основни модули

- Auth
- Therapists
- Clients
- Appointments
- Messages
- Notes
- Push Notifications
- Recurring Appointments

---

# Database

Основна база:

PostgreSQL 17

ORM:

Prisma

Всички промени по структурата на базата се правят единствено чрез:

```
prisma migrate dev
```

Не се използва:

```
prisma db push
```

---

# Seed

Seed файловете се намират в:

```
backend/prisma/seed/
```

Главният файл е:

```
backend/prisma/seed.ts
```

---

# API

Frontend използва единствено REST API.

Frontend няма директен достъп до PostgreSQL.

---

# Основен принцип

Логиката принадлежи на Backend.

Frontend визуализира данните.

Database съхранява данните.

Prisma е единственият слой между Backend и PostgreSQL.