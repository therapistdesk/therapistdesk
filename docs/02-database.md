# TherapistDesk

# Database Architecture

| Property     | Value                 |
| ------------ | --------------------- |
| Project      | TherapistDesk         |
| Document     | Database Architecture |
| Version      | 2.2                   |
| Status       | Active Development    |
| Last Updated | August 2026           |

---

# 1. Purpose

This document describes the current TherapistDesk database structure.

It covers:

* database technology;
* primary models;
* relationships;
* ownership;
* scheduling data;
* important constraints;
* migration principles.

The authoritative database definition is:

```text id="p4n7cx"
prisma/schema.prisma
```

If this document differs from the Prisma schema, the Prisma schema is authoritative.

---

# 2. Database Technology

TherapistDesk currently uses:

```text id="j6v2qm"
PostgreSQL 17
```

Prisma is used as:

* ORM;
* typed database client;
* schema definition;
* migration system.

---

# 3. Main Models

The current main database models are:

```text id="c8r4wd"
User
Therapist
PracticeLocation
WorkingInterval
Service
ServiceLocation
Client
Appointment
Note
PushSubscription
Message
TherapistSettings
```

---

# 4. High-Level Relationship Model

```text id="m7x3qa"
User
 │
 └── Therapist
      │
      ├── PracticeLocation
      │      └── WorkingInterval
      │
      ├── Service
      │      └── ServiceLocation ─── PracticeLocation
      │
      ├── Client
      │      └── Appointment
      │             └── Note
      │
      ├── TherapistSettings
      ├── Message
      └── PushSubscription
```

The `ServiceLocation` model is the junction model implementing the many-to-many relationship between services and practice locations.

---

# 5. User and Therapist

## User

`User` represents the authentication account.

It contains the information required to establish the user's account and authentication state.

---

## Therapist

`Therapist` represents the therapist's application profile and ownership boundary.

A therapist may own:

* practice locations;
* services;
* clients;
* appointments;
* settings;
* messages;
* push subscriptions.

The therapist is the principal ownership boundary for application data.

---

# 6. PracticeLocation

`PracticeLocation` represents a place where the therapist provides services.

Important fields include:

```text id="v3k8ms"
id
therapistId
name
country
city
address
type
notes
isActive
number
```

A practice location belongs to exactly one therapist.

A therapist may have multiple practice locations.

The location number is unique within a therapist:

```text id="n5q2fd"
@@unique([therapistId, number])
```

---

# 7. WorkingInterval

`WorkingInterval` represents one configured time interval for a practice location.

Important fields include:

```text id="s7w4ka"
id
practiceLocationId
day
startMinutes
endMinutes
type
```

`day` identifies the weekday.

`startMinutes` and `endMinutes` represent minutes from midnight.

Example:

```text id="d8p5rx"
09:00 → 540
12:00 → 720
17:00 → 1020
```

The current interval types are:

```text id="y6c3qm"
work
break
```

---

# 8. Working Interval Semantics

The application interprets working intervals as follows:

```text id="f4m9zb"
work
    → normally available

break
    → blocked / inactive

gap between intervals
    → inactive

time outside configured intervals
    → inactive

past date/time
    → inactive
```

A `break` is not a separate calendar entity.

It is a type of working interval.

This allows the schedule to represent multiple intervals in the same day.

Example:

```text id="r2v7nc"
09:00–12:00  work
12:00–15:00  gap
15:00–17:00  break
```

---

# 9. Service

`Service` represents a therapeutic service offered by the therapist.

Important fields include:

```text id="q8m3ps"
id
therapistId
categoryId
name
description
defaultDurationMinutes
defaultPrice
currency
color
```

A service belongs to one therapist.

Services may be associated with multiple practice locations.

---

# 10. ServiceLocation

`ServiceLocation` is a junction model between:

```text id="u4n7yd"
Service
PracticeLocation
```

This creates a many-to-many relationship:

```text id="a6q9km"
Service
  │
  ├── ServiceLocation ── PracticeLocation
  │
  └── ServiceLocation ── PracticeLocation
```

A service can therefore be offered at multiple locations.

A practice location can offer multiple services.

The junction model prevents duplication of service definitions while allowing location-specific availability.

---

# 11. Client

`Client` represents a therapist's client.

A client belongs to one therapist.

A therapist may have multiple clients.

Clients may have:

* profile information;
* contact information;
* aliases;
* appointments;
* client-access information.

The client does not have a direct relationship with `Note`.

Notes are associated with appointments.

---

# 12. Appointment

`Appointment` represents a scheduled session.

An appointment may reference:

* therapist;
* client;
* service;
* practice location;
* recurring series where applicable.

Important scheduling information includes:

```text id="m8c5qx"
date
start time
end time
status
```

Appointments are owned by the therapist.

Backend ownership validation must be performed before accessing or modifying an appointment.

---

# 13. Note

`Note` represents a note associated with an appointment.

The current relationship is:

```text id="k3v9ma"
Appointment
     │
     └── Note
```

There is no direct:

```text id="e7q2sd"
Client
  │
  └── Note
```

relationship in the current schema.

A client's historical notes can therefore be reached through the client's appointments.

---

# 14. Recurring Appointments

Recurring appointments are represented through the appointment model and recurring-series information defined in the current Prisma schema.

The recurring structure allows multiple appointments to belong to the same logical series.

Recurring appointment creation must preserve:

* therapist ownership;
* client association;
* service association;
* location association;
* scheduling validity.

The backend remains authoritative for recurring appointment validation.

---

# 15. TherapistSettings

`TherapistSettings` stores therapist-level application settings.

Current settings include values such as:

```text id="r5c8vn"
reminderOffsets
retentionMonths
```

Settings are associated with the therapist.

They are separate from practice-location configuration.

---

# 16. Message

`Message` represents application messaging and notification-related records.

Messages may be associated with:

* therapist;
* client;
* appointment;
* scheduling or reminder workflows.

The exact relations are defined by the Prisma schema.

Message creation must include the authenticated therapist context where required by the schema.

---

# 17. PushSubscription

`PushSubscription` stores information required for browser push notifications.

Subscriptions are associated with the relevant authenticated therapist context.

The model supports future notification workflows without placing notification credentials directly in appointment records.

---

# 18. Ownership Model

The primary ownership hierarchy is:

```text id="c4m7xz"
Therapist
   │
   ├── Locations
   ├── Services
   ├── Clients
   ├── Appointments
   ├── Settings
   ├── Messages
   └── Push Subscriptions
```

Backend services must verify ownership before operating on therapist-owned resources.

An ID supplied by the frontend is never sufficient proof of ownership.

---

# 19. Referential Integrity

Relations between models should be enforced through Prisma relations and database constraints where appropriate.

Examples include:

```text id="y8p3qd"
PracticeLocation → Therapist
WorkingInterval → PracticeLocation
Service → Therapist
ServiceLocation → Service
ServiceLocation → PracticeLocation
Client → Therapist
Appointment → Therapist
Appointment → Client
Note → Appointment
```

Deletion behavior must be considered whenever a related record is removed.

Destructive cascading behavior should only be used intentionally.

---

# 20. Unique Constraints

Important uniqueness requirements include:

```text id="n6w2kf"
PracticeLocation:
@@unique([therapistId, number])
```

Other unique constraints are defined directly in the Prisma schema.

Application code should not assume uniqueness where the database does not enforce it.

---

# 21. Time Storage

Working interval times are stored as integer minutes from midnight.

This is preferable to storing recurring weekly working times as full timestamps.

It allows the same weekly schedule to be applied independently of a specific calendar date.

Appointment dates and times remain date/time data because they represent actual scheduled events.

---

# 22. Database and Calendar Relationship

The database stores the configured schedule.

The frontend calendar interprets that configuration.

The general flow is:

```text id="p7d4mc"
PostgreSQL
    │
    ▼
PracticeLocation
    │
    ▼
WorkingInterval[]
    │
    ▼
Frontend calendar
    │
    ▼
Availability
```

The calendar should not maintain a separate persistent copy of the working schedule.

---

# 23. Schema Changes

Database structure should be changed through Prisma migrations.

Development:

```bash id="w2k8rx"
npx prisma migrate dev
```

Production:

```bash id="g6v4qp"
npx prisma migrate deploy
```

Schema changes must be tested locally before production deployment.

---

# 24. Migration Principles

Before introducing a schema change:

1. inspect the current schema;
2. determine whether the existing structure can support the requirement;
3. identify affected relations;
4. consider existing data;
5. create the smallest appropriate migration;
6. test the migration;
7. verify application behavior.

Avoid destructive schema changes unless they are explicitly required and planned.

---

# 25. Database Source of Truth

The authoritative source for the current database structure is:

```text id="q4m8cz"
prisma/schema.prisma
```

This document is explanatory documentation.

When a discrepancy exists between this document and the Prisma schema, the schema takes precedence and this document should be corrected.

---

# 26. Guiding Principle

The database should represent stable business entities and relationships.

The preferred approach is:

> **Explicit ownership, clear relationships, minimal duplication and deliberate schema evolution.**
