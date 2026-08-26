# TherapistDesk

# Technical Architecture

| Property     | Value                  |
| ------------ | ---------------------- |
| Project      | TherapistDesk          |
| Document     | Technical Architecture |
| Version      | 2.2                    |
| Status       | Active Development     |
| Last Updated | August 2026            |

---

# 1. Purpose

This document describes the technical architecture of TherapistDesk.

It defines:

* application layers;
* frontend architecture;
* backend architecture;
* database access;
* authentication;
* API communication;
* deployment boundaries;
* major technical conventions.

Functional behavior is documented in `01-1-architecture.md`.

Database details are documented in `02-database.md`.

Development practices are documented in `03-development.md`.

---

# 2. Technology Stack

## Frontend

```text id="a2c7mf"
React
Vite
JavaScript / JSX
```

The frontend provides the user interface and communicates with the backend through HTTP APIs.

---

## Backend

```text id="m8k3qp"
NestJS
TypeScript
Prisma
```

The backend contains authentication, authorization, business logic and database access.

---

## Database

```text id="d4n7sx"
PostgreSQL 17
```

Prisma is used as the ORM and database schema management layer.

---

## Hosting

The current hosted environment uses Render.

Frontend and backend are deployed separately.

---

# 3. High-Level Architecture

```text id="p5w2az"
┌──────────────────────────────┐
│          React UI            │
│          Vite                │
└──────────────┬───────────────┘
               │ HTTPS / REST
               ▼
┌──────────────────────────────┐
│        NestJS API            │
│        TypeScript            │
├──────────────────────────────┤
│ Authentication               │
│ Authorization                │
│ Business Logic               │
│ Validation                   │
└──────────────┬───────────────┘
               │ Prisma
               ▼
┌──────────────────────────────┐
│        PostgreSQL 17         │
└──────────────────────────────┘
```

The frontend is not directly connected to the database.

---

# 4. Frontend Architecture

The frontend is a React application built with Vite.

Its responsibilities include:

* rendering the user interface;
* maintaining local UI state;
* handling user interaction;
* displaying calendar data;
* sending API requests;
* displaying API results and errors.

The frontend must not be treated as an authorization boundary.

---

# 5. Application-Level State

Application-level state is currently coordinated primarily through the main application layer.

The project is gradually extracting clearly defined responsibilities into focused components and helpers.

Examples include:

* settings components;
* recurring appointment UI;
* client access UI;
* note UI;
* calendar-related helpers.

The goal is separation by responsibility rather than arbitrary file splitting.

---

# 6. App.jsx

`App.jsx` currently contains significant application-level coordination and calendar functionality.

It should remain responsible for application-level concerns that genuinely span multiple parts of the UI.

New isolated functionality should not automatically be added to `App.jsx`.

When a clear responsibility boundary exists, functionality should be extracted into:

* a React component;
* a helper;
* or another appropriate module.

Extraction should be incremental and behavior-preserving.

---

# 7. Calendar Architecture

The calendar is a major frontend subsystem.

It combines:

* date calculations;
* time-slot rendering;
* working intervals;
* break intervals;
* past-time detection;
* appointment positioning;
* appointment interaction;
* conflict detection;
* practice-location context.

Calendar availability is derived from the selected practice location.

The calendar should not maintain an independent duplicate working-hours model.

---

# 8. Working Intervals

Working intervals are provided by the backend through the selected practice location.

The frontend converts database interval values into the format required for calendar rendering.

The current interval types are:

```text id="q7k2dc"
work
break
```

The calendar interprets them as:

```text id="r6m4va"
work  → normally available
break → inactive / blocked
gap   → inactive
past  → inactive
```

The exact visual representation is a frontend concern.

The underlying availability rule must remain consistent.

---

# 9. Time Representation

Working intervals are stored in the database as minutes from midnight.

Example:

```text id="v5q8zn"
09:00 → 540
12:00 → 720
17:00 → 1020
```

This representation avoids dependence on date objects for recurring weekly schedules.

The frontend converts between minutes and display times when required.

---

# 10. Appointment Rendering

Appointments are positioned according to:

* date;
* start time;
* duration;
* selected calendar view.

The calendar also evaluates:

* working availability;
* past time;
* appointment conflicts;
* location context.

Rendering calculations should remain separate from persistence logic where practical.

---

# 11. Appointment Interaction

Appointment creation and movement are interactive calendar operations.

Frontend interaction may prevent obviously invalid actions.

The backend remains authoritative for persisted validation.

The same conceptual availability rules should be applied to:

* creating appointments;
* moving appointments;
* recurring appointment creation.

---

# 12. Backend Architecture

The backend is implemented using NestJS.

The backend follows the normal NestJS separation between:

```text id="x4m7qe"
Controller
   │
   ▼
Service
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
```

Controllers handle transport-level concerns.

Services contain business logic.

Prisma provides database access.

---

# 13. Controllers

Controllers are responsible primarily for:

* defining HTTP routes;
* receiving requests;
* passing authenticated user context;
* invoking services;
* returning responses.

Controllers should not become the main location for complex business rules.

---

# 14. Services

Services contain business logic such as:

* ownership validation;
* appointment validation;
* conflict detection;
* recurring appointment creation;
* settings operations;
* client operations;
* service and location operations.

Business rules should be centralized where practical.

---

# 15. Authentication

Authentication uses JWT.

The general flow is:

```text id="c8f2ym"
Login
  │
  ▼
JWT issued
  │
  ▼
Frontend stores token
  │
  ▼
API request
  │
  ▼
JWT Guard
  │
  ▼
Authenticated request
```

Protected endpoints require a valid JWT.

---

# 16. Authorization

Authentication establishes who the user is.

Authorization determines whether that user is allowed to access the requested resource.

Therapist-owned resources must be checked against the authenticated therapist.

For example, receiving:

```text id="e3p7bx"
practiceLocationId = 45
```

does not by itself establish that the location belongs to the authenticated therapist.

The backend must verify ownership.

---

# 17. Prisma

Prisma is the database access layer.

The main Prisma schema is:

```text id="u7n3kc"
prisma/schema.prisma
```

Prisma provides:

* typed database access;
* relations;
* migrations;
* schema management;
* generated client APIs.

Database structure is documented separately in `02-database.md`.

---

# 18. Data Model Responsibilities

The current main entities include:

```text id="k5r9wd"
User
Therapist
PracticeLocation
Service
Client
Appointment
Note
PushSubscription
Message
TherapistSettings
WorkingInterval
```

The principal relationships include:

```text id="n4q6zt"
Therapist
   │
   ├── PracticeLocation
   │      └── WorkingInterval
   │
   ├── Service
   │      └── ServiceLocation
   │
   ├── Client
   │      └── Appointment
   │             └── Note
   │
   ├── TherapistSettings
   ├── Message
   └── PushSubscription
```

`Note` is associated with an `Appointment`.

There is no direct `Client → Note` relation in the current model.

---

# 19. Settings Architecture

Settings are loaded through the backend settings API.

The frontend settings page acts as the coordinator for settings subcomponents.

Current settings components include:

```text id="h3p8qs"
SettingsPage.jsx
SettingsMenu.jsx
SettingsProfile.jsx
SettingsLocations.jsx
SettingsServices.jsx
SettingsWorkingHours.jsx
```

The general flow is:

```text id="z8v4km"
SettingsPage
    │
    ├── load settings
    │
    ├── render active section
    │
    └── save changes
            │
            ▼
        NestJS API
            │
            ▼
          Prisma
```

---

# 20. API Communication

The frontend communicates with the backend through REST-style HTTP endpoints.

Authenticated requests include the JWT:

```text id="m7c2ra"
Authorization: Bearer <token>
```

The frontend obtains the API base URL from:

```text id="w4n8kf"
VITE_API_URL
```

The API URL must not be hard-coded when environment configuration is available.

---

# 21. Error Propagation

The normal error path is:

```text id="q6m3zs"
Database / Business Rule
          │
          ▼
      NestJS Error
          │
          ▼
      HTTP Response
          │
          ▼
      Frontend Handler
          │
          ▼
      User Feedback
```

Frontend code should not silently reinterpret backend errors as successful operations.

---

# 22. Database and API Boundaries

The frontend must never access PostgreSQL directly.

The backend is the only application layer responsible for:

* database credentials;
* Prisma access;
* ownership checks;
* persistent business rules.

This boundary is mandatory for both security and architectural consistency.

---

# 23. Deployment Architecture

The hosted architecture is:

```text id="t6j4pm"
Browser
   │
   ▼
Frontend on Render
   │
   │ HTTPS / REST
   ▼
Backend on Render
   │
   │ Prisma
   ▼
PostgreSQL
```

Environment-specific configuration is supplied by the deployment environment.

Deployment procedures are documented in `04-deployment.md`.

---

# 24. Logging and Debugging

Development debugging may use temporary console logging on the frontend and server logging on the backend.

Logs should be used to identify the first incorrect state or value.

Temporary diagnostic logs should be removed after the issue is resolved unless they have an ongoing operational purpose.

---

# 25. Technical Change Principles

Technical changes should follow these principles:

1. inspect the current implementation first;
2. use the current source as the source of truth;
3. make the smallest appropriate change;
4. avoid duplicate business logic;
5. preserve existing behavior unless change is intentional;
6. test after meaningful changes;
7. refactor incrementally;
8. update documentation when an architectural decision becomes stable.

---

# 26. Architectural Direction

TherapistDesk should continue moving toward:

* smaller responsibility-focused frontend modules;
* centralized backend business rules;
* explicit ownership boundaries;
* reusable scheduling logic;
* predictable API contracts;
* stable database relationships.

The architecture should become clearer through incremental changes rather than large rewrites.

---

# 27. Guiding Principle

The technical architecture should support the simplest reliable implementation of the therapist's workflow.

The preferred direction is:

> **Clear boundaries, centralized business rules, minimal duplication and incremental evolution.**
