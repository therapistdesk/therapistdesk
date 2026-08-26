# TherapistDesk

# Development Guidelines

| Property     | Value                  |
| ------------ | ---------------------- |
| Project      | TherapistDesk          |
| Document     | Development Guidelines |
| Version      | 2.2                    |
| Status       | Active Development     |
| Last Updated | August 2026            |

---

# 1. Purpose

This document defines the development principles and working practices for TherapistDesk.

It describes how changes should be planned, implemented, tested and documented.

The purpose is to keep development:

* predictable;
* incremental;
* maintainable;
* easy to debug;
* consistent with the existing architecture.

This document does not describe individual application features.

Functional architecture is documented in `01-1-architecture.md`.

Technical architecture is documented in `01-2-technical-architecture.md`.

Database structure is documented in `02-database.md`.

---

# 2. General Development Principles

## 2.1 Understand Before Changing

Before modifying code:

1. inspect the current implementation;
2. identify where the relevant logic actually lives;
3. identify related components, helpers and API calls;
4. determine whether the requested behavior already exists elsewhere;
5. make the smallest appropriate change.

Do not modify code based solely on an older version of a file or an assumption about its current structure.

The currently supplied or most recently verified source is authoritative for the active change.

---

## 2.2 One Logical Change at a Time

Development should proceed in small logical steps.

A change should normally have one clear purpose.

Examples:

* fix one calendar behavior;
* add one validation rule;
* extract one component;
* modify one database relationship;
* correct one API workflow.

Avoid combining unrelated changes into the same modification.

---

## 2.3 Test After Meaningful Changes

After each meaningful change:

1. run the application;
2. reproduce the affected workflow;
3. verify the expected behavior;
4. check the browser console;
5. check the Network tab when API behavior is involved;
6. verify that unrelated functionality still works.

Do not accumulate several untested changes and attempt to debug them together.

---

# 3. Source of Truth

When working on an existing module, the actual current source code is authoritative.

Documentation, previous versions, archived files and earlier conversation fragments may provide context but must not override the current implementation.

When multiple versions of a file exist:

1. identify the current version;
2. verify its modification time or upload context when available;
3. inspect the current file;
4. ignore archived copies unless historical comparison is explicitly required.

This is particularly important for large files such as `App.jsx`.

---

# 4. Existing Code First

Before introducing new logic, determine whether the existing code already provides the required behavior.

Prefer:

* reusing an existing helper;
* extending an existing condition;
* reusing an existing component;
* modifying an existing data structure.

Avoid introducing a second mechanism when the current mechanism can be extended safely.

---

# 5. Avoid Duplicate Business Logic

The same rule should not be implemented independently in multiple locations.

Examples include:

* working-hour interpretation;
* appointment availability;
* ownership checks;
* service configuration;
* location configuration;
* validation rules.

When a rule is already represented by a shared helper or backend service, extend that implementation instead of creating another parallel version.

---

# 6. Frontend Development

## 6.1 Component Responsibilities

React components should have clear responsibilities.

A component should not become responsible for unrelated application areas merely because they are convenient to implement there.

When a component becomes excessively large, logical responsibilities should be extracted gradually.

---

## 6.2 Refactoring Large Files

Large files should be refactored incrementally.

The preferred process is:

1. identify one logical responsibility;
2. extract it into a focused component or helper;
3. update imports and references;
4. run the application;
5. verify the affected functionality;
6. continue only after the previous step is stable.

Refactoring should preserve existing behavior unless a behavior change is explicitly intended.

---

## 6.3 App.jsx

`App.jsx` contains application-level state and coordination for the main application workflow.

It should not become the default location for every new feature.

New reusable UI or isolated logic should be extracted when there is a clear responsibility boundary.

Extraction should be driven by responsibility, not simply by line count.

---

# 7. Helper Functions

Helpers should be used for reusable calculations and transformations.

Examples include:

* time conversion;
* interval sorting;
* appointment positioning;
* overlap detection;
* date calculations;
* calendar layout calculations.

A pure helper should preferably:

* receive explicit inputs;
* return explicit outputs;
* avoid React state;
* avoid JSX;
* avoid direct database access;
* avoid hidden side effects.

Pure helpers are easier to test and reason about.

---

# 8. Calendar Development

The calendar is a high-risk area because it combines visual rendering with interactive scheduling.

Changes affecting the calendar must be evaluated in both dimensions:

1. visual state;
2. interaction state.

For example, a slot that is visually grey must also be non-interactive.

A slot that is visually available must not be blocked accidentally by a conflicting event handler.

---

## 8.1 Working Hours

Calendar availability is derived from the selected practice location's working intervals.

The current interval types are:

```text
work
break
```

The calendar must respect interval boundaries consistently.

For example:

```text
09:00–12:00  work
12:00–15:00  no interval
15:00–17:00  break
```

The expected result is:

```text
09:00–12:00  active
12:00–15:00  grey / inactive
15:00–17:00  green / inactive
```

Boundary values must be tested explicitly.

Do not assume that a condition using `<=` or `<` is correct without checking the actual rendered slots.

---

## 8.2 Past Time

Past time is handled separately from the configured working schedule.

A slot that belongs to a valid `work` interval may still be inactive because its date/time has already passed.

The existing `isPastDateTime` logic should be reused rather than implementing a second past-time calculation.

---

## 8.3 Appointment Movement

Moving an appointment must obey the same availability rules as creating an appointment.

An appointment must not be moved into:

* past time;
* non-working periods;
* break periods;
* other blocked periods;
* conflicting appointments.

Creation and movement should therefore use shared availability logic whenever practical.

---

## 8.4 Appointment Creation

Creating an appointment must validate:

* selected client;
* selected service;
* selected practice location;
* start time;
* end time;
* past time;
* working interval;
* conflicts.

The backend remains authoritative for persisted business validation.

The frontend may prevent obviously invalid interactions before making the API request.

---

# 9. Backend Development

Backend business logic belongs in NestJS services and related backend modules.

Controllers should remain focused on:

* receiving requests;
* validating request structure;
* invoking the appropriate service;
* returning responses.

Services should contain the relevant business rules.

Database access should be performed through Prisma.

---

# 10. Ownership and Authorization

Every therapist-owned resource must be accessed within the authenticated therapist's context.

Backend operations should verify ownership before:

* reading;
* modifying;
* deleting;
* associating records.

Never rely solely on IDs supplied by the frontend.

For example, receiving a `practiceLocationId` does not prove that the location belongs to the authenticated therapist.

The backend must verify the relationship.

---

# 11. API Development

When adding or changing an API endpoint:

1. identify the owning backend module;
2. define the request and response structure;
3. validate input;
4. verify ownership;
5. implement business logic;
6. update database access if necessary;
7. test the endpoint;
8. update the frontend only after the backend contract is clear.

Frontend code should not compensate for an unclear or inconsistent API contract.

---

# 12. Database Development

Database changes must be deliberate.

Before changing the Prisma schema:

1. determine whether the existing model can satisfy the requirement;
2. identify affected relations;
3. identify existing data;
4. consider migration and rollback implications;
5. make the smallest appropriate schema change.

After changing the schema:

1. create a Prisma migration;
2. apply it locally;
3. regenerate Prisma client when required;
4. test affected backend functionality;
5. verify the resulting data structure.

---

# 13. Prisma Migrations

The normal development workflow uses Prisma Migrate.

Development:

```bash
prisma migrate dev
```

Production:

```bash
prisma migrate deploy
```

Migrations must be committed to version control.

The Prisma schema and migration history must remain synchronized.

`prisma db push` is not the standard workflow for intentional schema evolution.

---

# 14. Debugging

Debugging should proceed from evidence rather than assumptions.

Recommended order:

1. reproduce the problem;
2. identify the exact failing behavior;
3. inspect the browser console;
4. inspect the Network tab;
5. inspect the backend log;
6. inspect the database when necessary;
7. identify the first incorrect value or state;
8. fix the source of the problem;
9. retest the complete workflow.

Do not change several unrelated pieces of code simply to see whether the problem disappears.

---

# 15. Logging

Temporary diagnostic logging may be added during debugging.

Logs should identify the relevant state clearly.

For example:

```text
CREATE CLICK
PRACTICE DATA
WORKING INTERVALS
MOVE APPOINTMENT
```

Once the problem is understood and fixed:

* remove unnecessary debug logs;
* keep only logs that have a legitimate operational purpose;
* avoid leaving verbose development output in production paths.

---

# 16. Error Handling

Errors should be handled at the appropriate layer.

Frontend responsibilities include:

* displaying understandable feedback;
* preventing invalid interactions where practical;
* handling failed API requests.

Backend responsibilities include:

* validating requests;
* enforcing business rules;
* enforcing ownership;
* returning appropriate HTTP errors.

The frontend must not assume that successful local validation guarantees backend acceptance.

---

# 17. Testing Strategy

Testing should be proportional to the change.

At minimum, every completed change should receive targeted manual verification.

Changes to scheduling should receive additional boundary testing.

Examples:

* start of a working interval;
* end of a working interval;
* start of a break;
* end of a break;
* gap between intervals;
* past time;
* current time;
* different dates;
* different practice locations.

For example, with:

```text
09:00–12:00 work
15:00–17:00 break
```

the following boundaries should be explicitly checked:

```text
09:00
12:00
15:00
17:00
```

---

# 18. Regression Testing

A fix is not complete until the original problem is resolved without introducing a new one.

After changes to shared logic, verify related functionality.

For example, changes to working-hour evaluation should be tested against:

* calendar rendering;
* appointment creation;
* appointment movement;
* past-time handling;
* different locations;
* multiple intervals;
* break intervals.

---

# 19. Refactoring Rules

Refactoring is encouraged when it improves maintainability without changing intended behavior.

Good reasons to refactor include:

* duplicated logic;
* unclear responsibility;
* excessively coupled code;
* difficult testing;
* repeated calculations;
* large components with multiple unrelated responsibilities.

Avoid refactoring solely for stylistic reasons while actively implementing a different feature.

A refactor should have a clear boundary and a clear verification point.

---

# 20. File and Component Naming

Names should describe responsibility.

Examples:

```text
SettingsPage.jsx
SettingsLocations.jsx
SettingsServices.jsx
SettingsWorkingHours.jsx
WorkingDayCard.jsx
RegisterHelpers.js
```

Avoid vague names such as:

```text
Helper.jsx
Utils2.js
NewComponent.jsx
Temp.jsx
```

Temporary files should be removed when no longer needed.

---

# 21. Translation and UI Text

User-visible text should use the application's translation system when the relevant translation infrastructure exists.

Do not introduce hard-coded user-facing strings into a module that already uses translations.

When adding new UI text:

1. identify the translation key;
2. add the required language values;
3. use the translation helper;
4. verify the resulting UI.

---

# 22. Development Workflow

The preferred workflow for a feature or fix is:

```text
Requirement
    │
    ▼
Inspect current implementation
    │
    ▼
Identify smallest change
    │
    ▼
Implement
    │
    ▼
Test
    │
    ▼
Fix regressions
    │
    ▼
Confirm stable behavior
    │
    ▼
Update documentation
```

Large features should be divided into smaller checkpoints.

Each checkpoint should leave the application in a working state.

---

# 23. Working With Existing Files

When a current file is provided or uploaded specifically for an active task, that version should be treated as authoritative.

Archived or renamed copies may be useful for comparison but must not be treated as the current implementation without verification.

This is particularly important when several versions of the same large file exist.

---

# 24. Documentation Updates

Documentation should be updated when a behavior becomes stable.

Documentation should describe:

* what currently exists;
* how the current architecture works;
* important constraints;
* established development rules.

Documentation should not describe planned functionality as if it were already implemented.

Planned functionality belongs in `05-roadmap.md`.

Historical changes belong in `CHANGELOG.md`.

---

# 25. Completion Criteria

A development task is considered complete when:

* the requested behavior is implemented;
* the relevant workflow has been tested;
* no known regression remains;
* temporary debugging code has been removed;
* related documentation has been updated when necessary;
* the implementation remains consistent with the existing architecture.

Completion does not require unrelated cleanup.

---

# 26. Guiding Principle

The preferred solution is:

> **The smallest clear change that solves the problem while preserving the existing architecture.**

TherapistDesk should evolve through controlled, understandable changes rather than large speculative rewrites.
