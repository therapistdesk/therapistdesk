# TherapistDesk

# Registration and Initial Setup

| Property     | Value                          |
| ------------ | ------------------------------ |
| Project      | TherapistDesk                  |
| Document     | Registration and Initial Setup |
| Version      | 2.2                            |
| Status       | Stable Reference               |
| Last Updated | August 2026                    |

---

# 1. Purpose

This document describes the therapist registration flow and the initial configuration created during registration.

The registration process establishes the minimum data required for a therapist to begin using TherapistDesk.

After registration, the same configuration can be maintained through the Settings module.

---

# 2. Registration Flow

The current registration wizard consists of the following steps:

```text id="k7m3qx"
1. Account
      ↓
2. Personal
      ↓
3. Practice
      ↓
4. Practice Locations
      ↓
5. Working Hours
      ↓
6. Review
```

Each step collects a specific group of related information.

---

# 3. Account

The Account step creates the authentication account.

Typical information includes:

* email;
* password;
* account-related credentials.

The account is later used for authentication.

Email verification is part of the authentication workflow.

---

# 4. Personal

The Personal step collects therapist profile information.

This information becomes part of the therapist's professional profile.

The profile can subsequently be edited from Settings.

---

# 5. Practice

The Practice step collects information about the therapist's practice.

This establishes the initial practice context before locations, services and working hours are configured.

---

# 6. Practice Locations

The registration wizard supports multiple practice locations.

A therapist may configure one or more locations.

Location information may include:

* name;
* country;
* city;
* address;
* type;
* notes.

Locations receive a therapist-specific numeric number.

Example:

```text id="q4v8nc"
1 — Location A
2 — Location B
3 — Location C
```

The number is unique within the therapist's practice.

---

# 7. Working Hours

Working hours are configured separately for each practice location.

A day may contain multiple intervals.

The registration flow therefore does not assume a single start/end pair per day.

Example:

```text id="m8c2rx"
Monday

09:00–12:00  work
12:00–15:00  break
15:00–17:00  work
```

Intervals are represented by:

* day;
* start time;
* end time;
* type.

---

# 8. Interval Types

The current supported interval types are:

```text id="d5q7km"
work
break
```

## work

A `work` interval represents normally available working time.

The calendar may allow appointment creation and movement within valid working time.

## break

A `break` interval represents blocked time inside the configured working schedule.

The calendar treats the interval as unavailable for normal appointment operations.

A break is not a separate vacation or absence entity.

---

# 9. Inactive Gaps

A gap between configured intervals is not automatically considered working time.

For example:

```text id="x3n9vb"
09:00–12:00  work
12:00–15:00  gap
15:00–17:00  work
```

The period from 12:00 to 15:00 is inactive.

This allows a working day to contain multiple independent working periods.

---

# 10. Default Working Hours

The registration flow may initialize working hours with a default schedule.

The current default is:

```text id="r6m4za"
Monday–Friday
09:00–17:00
```

The therapist can modify this schedule during registration or later through Settings.

---

# 11. Working Interval Storage

Working intervals are stored using minutes from midnight.

Example:

```text id="p8c5wd"
09:00 → 540
12:00 → 720
17:00 → 1020
```

This representation is independent of a specific calendar date.

The database representation is described in `02-database.md`.

---

# 12. Registration and Settings

Registration creates the initial configuration.

Settings provides the ongoing management interface.

The relationship is:

```text id="n7v2qm"
Registration
     │
     ▼
Initial configuration
     │
     ▼
Settings
     │
     ▼
Ongoing changes
```

Registration should not introduce a separate configuration model that differs from the Settings model.

---

# 13. Review

The Review step allows the therapist to verify the information entered during registration before completing the setup.

The review should represent the actual configuration that will be persisted.

The final submission should not silently modify user-entered values unless a documented default or normalization rule applies.

---

# 14. Persistence

Registration data is persisted through the backend API.

The backend remains responsible for:

* validation;
* ownership;
* persistence;
* database relationships;
* business rules.

The frontend collects and presents the data but is not an authorization boundary.

---

# 15. Registration Completion

After successful completion:

```text id="c6w3pk"
Account
   ↓
Verified / authenticated therapist
   ↓
Practice configuration
   ↓
Practice locations
   ↓
Working hours
   ↓
Application
```

The therapist can then continue configuring the practice through Settings.

---

# 16. Relationship to Calendar

The registration working-hours configuration becomes the initial source of calendar availability.

The calendar later reads the persisted working intervals associated with the selected practice location.

The same interval semantics apply after registration.

There should not be separate registration-only and calendar-only interpretations of working hours.

---

# 17. Future Changes

Changes to registration should preserve compatibility with the existing Settings and database models where practical.

If a new registration field introduces a new persistent concept, its:

* database representation;
* backend API;
* Settings behavior;
* calendar implications;

should be considered together.

---

# 18. Reference Files

The primary registration implementation is located under:

```text id="z4m8qx"
frontend/src/register/
```

Important files include:

```text id="t6c2vn"
RegisterApp.jsx
RegisterHelpers.js
RegisterWorkingHours.jsx
WorkingDayCard.jsx
```

The exact implementation remains the source of truth.

---

# 19. Guiding Principle

Registration should establish a valid initial practice configuration without creating a separate long-term configuration architecture.

> **Configure once, then manage through the same underlying model.**
