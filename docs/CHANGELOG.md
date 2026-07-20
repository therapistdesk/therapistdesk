\# Changelog



All notable changes to TherapistDesk are documented in this file.



\---



\## 2026-07-06



\### Database



\* Migrated local development from SQLite to PostgreSQL.

\* Configured Prisma Migrate as the standard database migration workflow.

\* Added support for `DIRECT\_URL` and `SHADOW\_DATABASE\_URL`.

\* Created the initial PostgreSQL migration.

\* Updated local development environment.



\### Seed



\* Replaced the legacy seed implementation with a modular Prisma seed system.

\* Added dedicated seed modules for:



&#x20; \* users

&#x20; \* clients

&#x20; \* appointments

&#x20; \* recurring series

&#x20; \* notes

&#x20; \* messages

\* Verified successful execution of the complete seed process.



\### Documentation



\* Added project documentation:



&#x20; \* 00-project

&#x20; \* 01-architecture

&#x20; \* 02-database

&#x20; \* 03-development

&#x20; \* 04-deployment

&#x20; \* 05-roadmap



\### Verification



Completed a full smoke test after the PostgreSQL migration.



Verified successfully:



\* database connection

\* Prisma migrations

\* seed execution

\* backend startup

\* frontend startup

\* therapist login

\* client loading

\* calendar loading

\* appointment creation

\* appointment persistence after page refresh

\* appointment persistence after logout/login


## 2026-07-20

### Registration

* Completed Step 6 – Review & Register.
* Registration now persists the complete therapist practice model.
* Added RegisterReview summary screen.
* Added backend persistence for PracticeLocation, ServiceLocation and WorkingInterval.
* Fixed ServiceLocation mapping for registrations with multiple categories.
* Verified successful registration with multiple categories, services, locations and working intervals.
