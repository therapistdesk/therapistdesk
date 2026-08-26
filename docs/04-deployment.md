# TherapistDesk

# Deployment and Environment Guide

| Property     | Value                            |
| ------------ | -------------------------------- |
| Project      | TherapistDesk                    |
| Document     | Deployment and Environment Guide |
| Version      | 2.2                              |
| Status       | Active Development               |
| Last Updated | August 2026                      |

---

# 1. Purpose

This document describes how TherapistDesk is configured and deployed across development and production environments.

It covers:

* local development;
* environment variables;
* frontend deployment;
* backend deployment;
* PostgreSQL;
* Prisma migrations;
* deployment verification.

This document describes the current deployment approach.

Future infrastructure changes should be documented when they become part of the actual project.

---

# 2. Application Architecture

TherapistDesk consists of:

```text id="y2u7pi"
React + Vite
      │
      │ REST API
      ▼
NestJS + TypeScript
      │
      │ Prisma
      ▼
PostgreSQL
```

The frontend and backend are independently deployable applications.

The backend communicates with PostgreSQL through Prisma.

---

# 3. Development Environment

Local development uses:

* Node.js;
* npm;
* React + Vite frontend;
* NestJS backend;
* PostgreSQL 17;
* Prisma ORM.

The frontend and backend run as separate development processes.

The backend connects to the local PostgreSQL instance through the configured Prisma database connection.

---

# 4. Local Database

The current development database is PostgreSQL 17 running locally.

The database is not accessed directly by the frontend.

The backend connects through Prisma.

The local database is intended for:

* development;
* schema changes;
* migrations;
* manual testing;
* debugging.

Production data must not be treated as a local development database.

---

# 5. Environment Variables

Environment-specific values must be supplied through environment configuration rather than hard-coded into application source code.

## Frontend

The frontend uses:

```text id="vqkbrc"
VITE_API_URL
```

This variable identifies the backend API URL used by the frontend.

---

## Backend

The backend requires its database connection and authentication configuration through environment variables.

Typical configuration includes:

```text id="a7m7k3"
DATABASE_URL
JWT_SECRET
```

Additional variables may be required as new integrations are introduced.

Secrets must never be committed to source control.

---

# 6. Local Development Workflow

A normal development workflow is:

```text id="c7txp1"
1. Start PostgreSQL
2. Start the backend
3. Start the frontend
4. Open the application
5. Test the affected workflow
```

The backend must be able to connect to PostgreSQL before application functionality requiring database access is tested.

---

# 7. Prisma Workflow

Prisma is used for database access and schema management.

After an intentional schema change:

```bash id="l0ek3q"
npx prisma migrate dev
```

The resulting migration must be reviewed and committed.

When Prisma Client needs to be regenerated independently:

```bash id="1d1pzk"
npx prisma generate
```

The Prisma schema remains:

```text id="9u3q6m"
prisma/schema.prisma
```

---

# 8. Production Database Migrations

Production schema changes must use the committed migration history.

The production migration command is:

```bash id="m6h7kd"
npx prisma migrate deploy
```

Production migrations must not be replaced by ad-hoc schema synchronization.

The intended sequence is:

```text id="4r1g2d"
Change schema
     │
     ▼
Create migration locally
     │
     ▼
Test locally
     │
     ▼
Commit schema + migration
     │
     ▼
Deploy backend
     │
     ▼
Apply production migration
     │
     ▼
Verify application
```

---

# 9. Frontend Deployment

The frontend is a React/Vite application.

The production frontend is deployed as a static application.

The build process generates the production assets.

The backend API URL is supplied through the frontend environment configuration.

The frontend must never contain production secrets.

---

# 10. Backend Deployment

The backend is a NestJS application.

The production backend requires:

* Node.js runtime;
* production environment variables;
* database connection;
* JWT configuration;
* Prisma Client;
* the current database schema.

The backend must be deployed only after the corresponding code and database migration have been verified.

---

# 11. Render

Render is used as a deployment platform for the hosted TherapistDesk environment.

The deployment architecture separates:

```text id="6g5l1x"
Frontend service
       │
       │ HTTPS / REST
       ▼
Backend service
       │
       ▼
PostgreSQL
```

The exact Render service configuration is environment-specific and should be maintained in the deployment configuration rather than duplicated in this document.

---

# 12. Deployment Order

When a release contains both application and database changes, deployment order must be considered carefully.

The preferred process is:

1. verify the migration locally;
2. verify the backend against the migrated schema;
3. deploy the backend and required migration;
4. verify backend health;
5. deploy the frontend;
6. verify the affected user workflow.

If a schema change is not backward compatible, the deployment must be planned so that the application is never left operating against an incompatible schema.

---

# 13. Production Configuration

Production configuration must be provided through the hosting environment.

Examples include:

```text id="l4p7av"
DATABASE_URL
JWT_SECRET
VITE_API_URL
```

Values must be appropriate for the production environment.

Secrets must not be stored in:

* source code;
* committed `.env` files;
* frontend bundles;
* documentation;
* screenshots;
* public repositories.

---

# 14. Build Verification

Before deployment, verify that the production build succeeds.

Frontend:

```bash id="3qf4qv"
npm run build
```

Backend:

```bash id="jv5e4r"
npm run build
```

The exact npm scripts may vary as the project evolves.

A successful build does not replace functional testing.

---

# 15. Deployment Verification

After deployment, verify at minimum:

## Frontend

* application loads;
* authentication page loads;
* static assets load;
* API requests point to the production backend.

## Backend

* application starts;
* authentication works;
* database connection works;
* protected endpoints accept valid JWTs;
* invalid authentication is rejected.

## Database

* expected migration is applied;
* application can read and write required data;
* no migration error is present.

---

# 16. Scheduling Verification

Because scheduling is central to TherapistDesk, deployments containing calendar or working-hour changes should additionally verify:

* practice locations load;
* working intervals load;
* multiple intervals per day work;
* `work` intervals are available;
* `break` intervals are inactive;
* gaps between intervals are inactive;
* past time is inactive;
* appointments can be created in valid periods;
* appointments cannot be created in blocked periods;
* appointments can be moved only to valid periods.

Boundary cases should be explicitly tested.

For example:

```text id="s9z4gd"
09:00–12:00 work
15:00–17:00 break
```

should be checked at:

```text id="afw6kw"
09:00
12:00
15:00
17:00
```

---

# 17. Rollback Considerations

Application rollback and database rollback are separate concerns.

Before deploying a database-changing release:

* identify the affected tables;
* identify whether the migration is reversible;
* consider existing production data;
* avoid destructive changes unless explicitly planned.

A deployment should not depend on being able to automatically reverse arbitrary database changes.

For destructive schema changes, a backup or other recovery mechanism should be considered before deployment.

---

# 18. Backups

Production database backups are an infrastructure responsibility.

The application itself must not assume that a database rollback is available simply because a previous application version exists.

Before high-risk schema changes, the current production data should be protected through the available database backup mechanism.

Backup and restore procedures should be documented separately when the production infrastructure is formalized further.

---

# 19. Security

Production deployments must follow basic security requirements:

* HTTPS must be used for production communication;
* JWT secrets must remain server-side;
* database credentials must remain server-side;
* environment secrets must not be committed;
* authenticated endpoints must enforce authorization;
* therapist ownership must be verified server-side.

The frontend must be treated as an untrusted client.

---

# 20. Development vs Production

Development and production environments must remain logically separated.

Development may use:

* local PostgreSQL;
* development environment variables;
* development logging;
* local frontend/backend processes.

Production uses:

* hosted services;
* production environment variables;
* production database;
* production deployment configuration.

Development credentials and production credentials must never be mixed.

---

# 21. Release Checklist

Before a production release:

```text id="g4z2k1"
1. Code changes tested locally
2. Database changes migrated locally
3. Prisma schema and migrations synchronized
4. Frontend build succeeds
5. Backend build succeeds
6. Authentication verified
7. Affected feature verified
8. Scheduling verified when applicable
9. Environment variables verified
10. Production migration plan confirmed
11. Backend deployment completed
12. Frontend deployment completed
13. Production smoke test completed
```

---

# 22. Documentation Rule

Deployment documentation must describe the actual deployment environment.

Do not document hypothetical infrastructure as if it were already implemented.

When the hosting architecture changes, update this document together with the relevant deployment configuration.

---

# 23. Current Deployment Principle

The deployment strategy should remain simple:

```text id="m8b2tq"
Local Development
       │
       ▼
Local PostgreSQL
       │
       ▼
Test
       │
       ▼
Version Control
       │
       ▼
Render
       │
       ├── Frontend
       │
       └── Backend
              │
              ▼
          PostgreSQL
```

The priority is reliable, reproducible deployment rather than unnecessary infrastructure complexity.
