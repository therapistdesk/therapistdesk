# TherapistDesk

# Project Overview

| Property     | Value              |
| ------------ | ------------------ |
| Project      | TherapistDesk      |
| Document     | Project Overview   |
| Version      | 2.2                |
| Status       | Active Development |
| Last Updated | August 2026        |

---

# 1. Product Overview

TherapistDesk is a SaaS application designed for therapists and small therapy practices.

The application provides a centralized environment for managing:

* therapist profile;
* practice locations;
* therapeutic approaches and services;
* working hours;
* clients;
* appointments;
* recurring appointments;
* session notes;
* reminders and messages.

The product is designed around the daily workflow of an individual therapist while allowing the architecture to grow toward larger practices and additional SaaS functionality.

---

# 2. Core Product Principles

TherapistDesk is built around several principles.

## Simplicity

The application should remain understandable and predictable.

Features should solve concrete workflow problems without unnecessary complexity.

## Therapist-Centered Design

The therapist is the primary owner of practice data.

Practice locations, services, clients, appointments and configuration belong to the therapist's practice.

## Location-Aware Scheduling

A therapist may work at multiple practice locations.

Each location may have its own:

* working intervals;
* breaks;
* available services.

The calendar operates in the context of the selected practice location.

## Explicit Availability

Calendar availability is derived from the configured working intervals.

The current interval types are:

* `work`;
* `break`.

A `work` interval represents normally available time.

A `break` interval represents blocked time inside the working schedule.

Gaps outside configured intervals are also inactive.

There is no separate vacation-state concept in the calendar architecture. A blocked period is represented through the same availability mechanism and may receive a different visual treatment when required.

## Incremental Development

The application is developed through small, testable changes.

Existing behavior should be preserved unless a behavior change is explicitly intended.

---

# 3. Current Product Areas

## Authentication

The application currently supports:

* registration;
* login;
* email verification;
* verification-code resend;
* JWT-based authenticated sessions.

---

## Therapist Profile

The therapist can configure professional profile information.

The profile belongs to the authenticated therapist.

---

## Practice Locations

Therapists can:

* create locations;
* edit locations;
* delete locations;
* activate or deactivate locations;
* configure location information;
* configure location-specific working intervals.

Each location has a therapist-specific numeric identifier.

---

## Therapeutic Approaches and Services

Services are organized through categories.

Services may be associated with one or more practice locations.

Service configuration includes properties such as:

* name;
* description;
* duration;
* price;
* currency;
* color;
* active state.

---

## Working Hours

Working hours are configured per practice location.

A day may contain multiple intervals.

Supported interval types are:

```text id="z9q7vn"
work
break
```

Times are represented internally as minutes from midnight.

This allows schedules such as:

```text id="f3p8sa"
09:00–12:00  work
12:00–15:00  inactive
15:00–17:00  break
```

The calendar interprets these intervals when determining availability.

---

## Calendar

The calendar provides:

* day and week scheduling;
* appointment creation;
* appointment movement;
* recurring appointments;
* location-aware availability;
* working-time visualization;
* break visualization;
* past-time protection;
* conflict detection.

Calendar behavior is driven by the selected practice location and its working intervals.

---

## Clients

The application supports client management including:

* client profiles;
* contact information;
* aliases;
* appointment history;
* client access;
* reminders;
* communication-related functionality.

---

## Appointments

Appointments can be:

* created;
* edited;
* moved;
* cancelled;
* associated with a client;
* associated with a service;
* associated with a practice location;
* created as recurring appointments.

The backend remains authoritative for persisted appointment validation.

---

## Notes

Session notes are currently associated with appointments.

The current database model does not use a direct `Client → Note` relationship.

---

## Reminders and Messages

The application contains infrastructure for:

* scheduled messages;
* appointment reminders;
* client notifications;
* push subscriptions.

This area remains subject to further development and stabilization.

---

# 4. Settings

The Settings area provides configuration for the therapist's practice.

Current settings areas include:

* My Profile;
* Practice Locations;
* Therapeutic Approaches & Services;
* Working Hours.

Settings are stored in the database where appropriate and loaded through the backend settings API.

The Settings foundation is considered complete.

Future changes should be treated as incremental improvements rather than as a new settings architecture.

---

# 5. Current Technical Stack

## Frontend

```text id="q1v7dc"
React
Vite
JavaScript / JSX
```

The frontend is responsible for:

* user interface;
* calendar rendering;
* user interaction;
* local UI state;
* API communication.

---

## Backend

```text id="b7r2am"
NestJS
TypeScript
Prisma
```

The backend is responsible for:

* authentication;
* authorization;
* business logic;
* API endpoints;
* database access;
* validation.

---

## Database

```text id="w6h4kp"
PostgreSQL 17
```

Prisma is used as the ORM and schema management layer.

---

## Hosting

The hosted application uses Render for deployment.

The frontend and backend are deployed as separate application services.

---

# 6. Architectural Direction

The application follows a therapist-centered architecture.

At a high level:

```text id="e5d8qy"
User
  │
  ▼
Therapist
  │
  ├── Profile
  ├── Practice Locations
  │      └── Working Intervals
  │
  ├── Categories
  │      └── Services
  │
  ├── Clients
  │      └── Appointments
  │
  ├── Recurring Series
  ├── Therapist Settings
  └── Therapist Links
```

The backend is the authoritative layer for business rules and persistent data.

The frontend is responsible for presentation and interaction.

---

# 7. Frontend Architecture Direction

The main application currently contains significant calendar and application-level coordination logic.

The project is gradually extracting clearly defined responsibilities into focused components and helpers.

The objective is not simply to reduce file size.

The objective is to establish clear responsibility boundaries while preserving behavior.

Refactoring should therefore remain incremental and testable.

---

# 8. Data Ownership

The therapist is the primary ownership boundary.

Backend operations must verify that referenced resources belong to the authenticated therapist.

This applies to resources such as:

* clients;
* appointments;
* services;
* practice locations;
* working intervals;
* recurring series;
* settings;
* links.

The frontend must not be considered an authorization boundary.

---

# 9. Scheduling Model

Scheduling is based on three primary concepts:

```text id="j7m3xa"
Practice Location
        │
        ▼
Working Intervals
        │
        ▼
Calendar Availability
```

An appointment additionally references the relevant client and may reference a service and practice location.

The calendar must consistently apply:

1. working intervals;
2. break intervals;
3. inactive gaps;
4. past-time restrictions;
5. appointment conflicts.

Changes to working hours should cause the calendar to derive its displayed availability from the new configuration rather than maintaining a second independent schedule model.

---

# 10. Current Development State

The foundational product architecture is established.

Current development is focused primarily on:

* calendar stabilization;
* working-interval boundary behavior;
* appointment interaction reliability;
* frontend restructuring;
* broader testing;
* production-oriented validation.

The next product modules should be added only after the current core workflows are sufficiently stable.

---

# 11. Product Roadmap

Future development may include:

* expanded client management;
* improved appointment workflows;
* notification and reminder improvements;
* financial management;
* advanced clinical documentation;
* client portal;
* integrations;
* reporting;
* subscription and SaaS infrastructure;
* AI-assisted workflows.

These items are described in more detail in `05-roadmap.md`.

The roadmap represents planned direction, not guaranteed functionality or deadlines.

---

# 12. Documentation Set

The main project documentation consists of:

```text id="r3f8wd"
00-project.md
01-1-architecture.md
01-2-technical-architecture.md
02-database.md
03-development.md
04-deployment.md
05-roadmap.md
CHANGELOG.md
```

The documents have distinct responsibilities:

* `00-project.md` — project and product overview;
* `01-1-architecture.md` — functional architecture;
* `01-2-technical-architecture.md` — technical architecture;
* `02-database.md` — database structure;
* `03-development.md` — development practices;
* `04-deployment.md` — deployment and environment management;
* `05-roadmap.md` — future development direction;
* `CHANGELOG.md` — historical changes.

---

# 13. Documentation Source of Truth

Documentation describes the current implementation and established architectural decisions.

For technical implementation details:

```text id="x6v2qn"
Source code
```

takes precedence.

For database structure:

```text id="s8c1hf"
prisma/schema.prisma
```

is the authoritative source.

Documentation should be updated when a significant architectural or functional decision becomes stable.

---

# 14. Guiding Principle

TherapistDesk should evolve from a stable and predictable operational core.

The project favors:

> **Simple rules, clear ownership, incremental development and reliable workflows.**
