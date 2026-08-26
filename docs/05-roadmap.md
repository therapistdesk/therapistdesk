# TherapistDesk

# Product Roadmap

| Property     | Value              |
| ------------ | ------------------ |
| Project      | TherapistDesk      |
| Document     | Product Roadmap    |
| Version      | 2.2                |
| Status       | Active Development |
| Last Updated | August 2026        |

---

# 1. Purpose

This document describes the planned development direction of TherapistDesk.

It focuses on work that is not yet considered complete.

Completed functionality should not remain in the active roadmap unless it requires a clearly defined future extension.

The roadmap is intentionally flexible.

Priorities may change as development and testing reveal new requirements.

---

# 2. Current Development Phase

TherapistDesk is currently moving from foundational development toward a more complete operational product.

The core application structure is established.

Current work is focused on:

* stabilizing scheduling behavior;
* completing calendar interaction logic;
* consolidating frontend architecture;
* expanding testing;
* preparing the application for broader validation.

---

# 3. Completed Foundation

The following areas are considered established foundations and are therefore not active roadmap items:

* authentication;
* email verification;
* JWT authentication;
* therapist profile;
* practice locations;
* services;
* working hours;
* multiple working intervals;
* `work` and `break` interval types;
* calendar scheduling;
* clients;
* appointments;
* recurring appointments;
* appointment notes;
* basic reminder/message infrastructure;
* PostgreSQL + Prisma architecture;
* Settings module foundation;
* frontend component restructuring.

These areas may still receive bug fixes and incremental improvements.

---

# 4. Immediate Priorities

## 4.1 Calendar Stabilization

Continue refining calendar behavior around:

* working intervals;
* breaks;
* inactive periods;
* past time;
* appointment creation;
* appointment movement;
* multiple locations;
* interval boundaries.

Special attention should be given to boundary conditions.

Example:

```text id="p6c2wm"
09:00–12:00 work
12:00–15:00 inactive
15:00–17:00 break
```

The visual state and interaction state must remain consistent.

---

## 4.2 Frontend Architecture

Continue reducing unnecessary concentration of logic in `App.jsx`.

The objective is not to minimize file size.

The objective is to establish clear responsibilities for:

* application state;
* calendar rendering;
* appointment interaction;
* modals;
* recurring appointments;
* settings;
* reusable helpers.

Further extraction should be performed only where responsibility boundaries are clear.

---

## 4.3 Broader Application Testing

Expand testing from individual feature verification toward complete workflows.

Priority areas include:

* registration;
* settings;
* working hours;
* calendar;
* clients;
* appointments;
* recurring appointments;
* notes;
* authentication.

Testing should include both normal workflows and important boundary conditions.

---

## 4.4 Production-Oriented Validation

Before broader production use, validate:

* authentication;
* authorization;
* API error handling;
* database migrations;
* environment configuration;
* deployment behavior;
* logging;
* backup and recovery procedures;
* data retention;
* privacy-related requirements.

---

# 5. Near-Term Product Work

After the current stabilization phase, development can proceed toward the operational features below.

---

## 5.1 Client Management

Expand client management with a complete workflow for:

* client profile;
* contact information;
* aliases;
* appointment history;
* notes through appointment history;
* client access;
* reminders;
* client communication.

The existing client model should remain the foundation.

---

## 5.2 Appointment Management

Expand appointment management with:

* improved editing;
* cancellation workflow;
* clearer appointment statuses;
* recurring-series management;
* reminder management;
* better calendar interactions.

The existing appointment model and API should be extended rather than replaced.

---

## 5.3 Notifications and Reminders

Complete the notification workflow around:

* appointment reminders;
* scheduled messages;
* push notifications;
* client notifications;
* reminder preferences.

The existing `Message` and `PushSubscription` models provide the current database foundation.

---

# 6. Financial Module

A future financial module may include:

* prices;
* payments;
* invoices;
* payment status;
* financial history;
* reporting.

The current `Service.defaultPrice` and currency fields provide an initial foundation, but financial transactions should be modeled separately rather than stored directly on appointments.

This module should be designed before implementation begins.

---

# 7. Clinical Documentation

A future clinical module may expand beyond appointment notes.

Potential functionality includes:

* structured session notes;
* treatment plans;
* assessments;
* clinical templates;
* attachments;
* longitudinal client history.

This area requires careful consideration of:

* data structure;
* privacy;
* retention;
* access control;
* auditability.

No clinical structure should be introduced solely for the sake of filling the roadmap.

---

# 8. Client Portal

A future client-facing area may provide:

* appointment information;
* appointment requests;
* reminders;
* shared information;
* communication;
* documents;
* profile management.

The existing client access mechanism may serve as a foundation, but a full portal should be designed as a separate product surface.

---

# 9. Integrations

Potential future integrations include:

* external calendars;
* video meeting platforms;
* messaging services;
* payment providers;
* email providers;
* other therapist productivity tools.

Integrations should be introduced only when there is a clear user workflow and stable internal API boundary.

---

# 10. Reporting

A future reporting module may provide:

* appointment statistics;
* client activity;
* service utilization;
* working-time statistics;
* financial reports;
* practice trends.

Reporting should use stable operational data rather than introducing reporting-specific duplication into the core models unless necessary.

---

# 11. Multi-Location Expansion

The current architecture already supports multiple practice locations.

Future improvements may include:

* richer location management;
* location-specific services;
* location-specific availability;
* location-specific pricing;
* location reporting;
* location-based calendar filtering.

The existing `PracticeLocation`, `ServiceLocation` and `WorkingInterval` models should remain the foundation.

---

# 12. AI Features

AI functionality may be introduced after the core operational workflows are stable.

Potential areas include:

* note assistance;
* session summaries;
* structured information extraction;
* administrative assistance;
* client communication assistance;
* practice analytics.

AI functionality must be designed with particular attention to:

* privacy;
* user control;
* data minimization;
* transparency;
* security.

AI should augment therapist workflows rather than become a prerequisite for normal application use.

---

# 13. Subscription and SaaS Infrastructure

Future SaaS functionality may include:

* subscription plans;
* billing;
* feature limits;
* trials;
* account lifecycle;
* usage tracking.

This should be introduced after the core product workflow is stable enough to support real users.

---

# 14. Audit and Security

As the application becomes more operational, additional infrastructure may be required for:

* audit logs;
* security events;
* account activity;
* administrative actions;
* data export;
* data deletion;
* retention management.

Security-related features should be introduced according to actual product requirements rather than speculative complexity.

---

# 15. Performance and Scalability

Performance work should initially remain focused on real bottlenecks.

Potential future improvements include:

* database query optimization;
* API response optimization;
* calendar rendering optimization;
* caching;
* background processing;
* pagination;
* indexing;
* notification queues.

Optimization should be evidence-driven.

---

# 16. Testing Expansion

The testing strategy should gradually evolve from primarily manual testing toward automated coverage.

Potential areas include:

* backend unit tests;
* service tests;
* API integration tests;
* frontend component tests;
* calendar interaction tests;
* end-to-end workflows.

High-value automated tests should focus first on business-critical workflows.

---

# 17. Production Readiness

Before broader production use, the following areas should be reviewed:

* authentication security;
* authorization;
* database backups;
* migrations;
* error handling;
* logging;
* monitoring;
* environment configuration;
* data retention;
* privacy;
* deployment recovery.

Production readiness should be evaluated as a separate milestone rather than assumed from successful local development.

---

# 18. Roadmap Prioritization

Priority should generally follow this order:

```text id="v5n8qx"
Stability
   ↓
Core workflow completeness
   ↓
Security and reliability
   ↓
User experience
   ↓
Automation
   ↓
Advanced features
   ↓
Optimization
```

New functionality should not be prioritized over unresolved problems in core workflows without a clear reason.

---

# 19. Roadmap Rules

The roadmap should follow several rules:

1. Do not list completed functionality as future work.
2. Do not treat ideas as commitments.
3. Do not add technical work without a product reason.
4. Do not introduce major modules before the underlying workflow is understood.
5. Re-evaluate priorities as the product evolves.
6. Update the roadmap when a planned item becomes active or completed.

---

# 20. Current Focus

The immediate development focus is:

```text id="m2r7cd"
1. Stabilize calendar and working-interval behavior
2. Continue frontend restructuring
3. Expand application testing
4. Validate production-critical workflows
```

Only after these areas are sufficiently stable should larger modules be prioritized.

---

# 21. Guiding Principle

TherapistDesk should grow from a stable operational core.

The roadmap therefore favors:

> **Reliable core workflows before feature expansion.**

New functionality should build on the existing architecture rather than repeatedly replacing it.
