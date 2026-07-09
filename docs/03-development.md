\# Development Workflow



\## Development Environment



Local development uses:



\* PostgreSQL

\* Prisma ORM

\* NestJS backend

\* React + Vite frontend



\---



\## Database Workflow



All database schema changes must be performed using Prisma Migrate.



Typical workflow:



1\. Update `schema.prisma`.

2\. Run:



```bash

npm run db:migrate

```



3\. Verify the migration.

4\. Update seed data if necessary.

5\. Commit the migration together with the schema changes.



`prisma db push` is not used for normal development.



\---



\## Seed Workflow



The application uses a modular seed system.



Entry point:



```text

prisma/seed.ts

```



Modules:



\* users

\* clients

\* appointments

\* recurring

\* notes

\* messages



Run:



```bash

npm run db:seed

```



\---



\## Git Workflow



Each commit should represent one logical change.



Typical examples:



\* database migration

\* new feature

\* bug fix

\* documentation update



Avoid combining unrelated changes into a single commit.



\---



\## Verification Workflow



After every significant change:



1\. Run migrations (if applicable).

2\. Execute the seed.

3\. Start backend.

4\. Start frontend.

5\. Perform the smoke test.

6\. Update documentation.

7\. Commit changes.



