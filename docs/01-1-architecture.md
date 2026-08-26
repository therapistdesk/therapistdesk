# TherapistDesk

# Application Architecture

| Property     | Value                   |
| ------------ | ----------------------- |
| Project      | TherapistDesk           |
| Document     | Functional Architecture |
| Version      | 2.2                     |
| Status       | Active Development      |
| Last Updated | August 2026             |

---

# 1. Purpose

This document defines the functional architecture of TherapistDesk.

It describes how the application is organized from the therapist's perspective and serves as the primary reference for future functional development.

This document intentionally avoids implementation details. Technical decisions, technologies, database structure and application internals are described in **01-2-technical-architecture.md**.

The objectives of this document are to:

* define the overall structure of the application;
* clearly separate daily work from configuration and administration;
* establish consistent design principles;
* encourage component reuse;
* support future expansion without architectural redesign;
* provide a stable reference for future development.

---

# 2. Core Design Principles

TherapistDesk is designed around several long-term principles.

These principles should guide every future feature, module and interface.

## 2.1 Simplicity

The application exists to support therapists in their daily work.

Configuration should require as little time as possible.

The therapist should spend time working with clients rather than learning the software.

---

## 2.2 Consistency

Identical actions should behave identically throughout the application.

Users should never have to learn different workflows for similar tasks.

Buttons, dialogs, validation, notifications and navigation should remain consistent across all modules.

---

## 2.3 Reusability

Whenever possible, existing components should be reused instead of creating new implementations.

The same business logic should not exist in multiple places.

A component created during registration should later become the corresponding editing component inside Settings whenever practical.

---

## 2.4 Separation of Responsibilities

Different types of work should remain clearly separated.

Daily work should never be mixed with configuration.

Configuration should never be mixed with account management.

Administration should remain independent from therapist workflows.

This separation makes the application easier to understand and significantly easier to maintain.

---

## 2.5 Scalability

The architecture must allow new functionality to be added without redesigning existing modules.

New modules should integrate naturally into the existing structure instead of introducing parallel workflows.

---

## 2.6 Predictability

The interface should always behave in an expected way.

The user should immediately know:

* where information is located;
* where it can be edited;
* what will happen after pressing a button;
* how to return to the previous screen.

Predictable behavior reduces errors and minimizes the learning curve.

---

# 3. User Lifecycle

A therapist typically interacts with TherapistDesk through four major phases.

```text
Registration
      │
      ▼
Daily Work
      │
      ▼
Occasional Configuration
      │
      ▼
Account Management
```

## Registration

Registration is performed only once.

Its purpose is to collect the minimum information required for the therapist to begin working immediately after creating an account.

---

## Daily Work

Daily work represents the primary purpose of the application.

This is where therapists spend the vast majority of their time.

Typical activities include:

* managing appointments;
* working with clients;
* writing notes;
* exchanging messages;
* reviewing upcoming work.

---

## Occasional Configuration

Configuration is performed only when practice information changes.

Examples include:

* updating personal information;
* adding or editing a practice location;
* modifying therapeutic approaches and services;
* changing working hours.

These actions should not interfere with daily work.

---

## Account Management

Account management contains subscription and account-related information.

Most information in this section is maintained automatically by the system.

The therapist can review this information but will not necessarily be allowed to modify every item.

---

# 4. Main Application Areas

TherapistDesk is organized into four primary functional areas.

Each area has a clearly defined responsibility.

Keeping these responsibilities separate is one of the core architectural principles of the application.

---

## 4.1 Work

The **Work** area contains everything required for the therapist's daily activities.

This is the default area displayed after login.

Current modules include:

* Calendar;
* Clients;
* Appointments;
* Notes;
* Messages.

Additional modules may be added as the application evolves.

The Work area is the center of the application.

Every module in this area directly supports therapist-client interaction or the organization of daily activities.

Configuration screens must never appear inside the Work area.

---

## 4.2 Tools

The **Tools** area contains utilities that support the therapist's work but are not part of the primary daily workflow.

These modules improve productivity, automate repetitive tasks and assist clinical work.

Planned modules include:

* Waiting List;
* Exercise Queue;
* Homework Library;
* Templates;
* Reports;
* Import / Export;
* AI Tools.

Unlike the Work area, these modules are used when needed rather than continuously throughout the day.

As TherapistDesk evolves, productivity features that do not belong to the daily scheduling workflow should generally become part of the Tools area.

---

## 4.3 Settings

The **Settings** area contains all therapist-configurable practice information.

Configuration should happen infrequently.

The goal is to provide one central location for editable aspects of the therapist's practice.

Current modules are:

* My Profile;
* Practice Locations;
* Therapeutic Approaches & Services;
* Working Hours.

Planned modules may include:

* Notifications;
* Security;
* Appearance;
* Language.

Every configuration screen should follow the same interaction model:

1. load the current configuration;
2. allow editing;
3. validate the entered data;
4. save the changes;
5. refresh the displayed information.

Whenever possible, Settings should reuse the same components and validation logic originally developed for the registration wizard.

---

## 4.4 Account

The **Account** area contains information related to the therapist's subscription and access to the platform.

Typical modules include:

* Subscription;
* Billing;
* Payments;
* Licenses;
* Modules;
* Usage Statistics;
* Storage;
* API Access.

Unlike Settings, the Account area primarily displays information managed by the platform.

Some sections may allow limited editing, while others are read-only.

---

# 5. Calendar and Scheduling

The Calendar is part of the **Work** area and represents the primary daily scheduling interface.

The calendar is organized around:

* dates;
* time intervals;
* practice locations;
* services;
* clients;
* appointments.

Appointments are created within the context of a selected client, practice location and service.

The selected practice location determines the working schedule used by the calendar.

---

## 5.1 Location-Specific Availability

Working hours belong to individual practice locations.

Different locations may therefore have different schedules.

When a location is selected in the calendar, its working intervals determine which time periods are available for scheduling.

Time outside configured working intervals is inactive.

---

## 5.2 Working Intervals in the Calendar

Working intervals may contain different functional types.

### Work

A `work` interval represents a period during which appointments may be scheduled.

Time slots within the interval are active unless they are otherwise unavailable, such as when the time has already passed.

### Break

A `break` interval represents an intentional interruption in the working schedule.

Break periods are displayed separately from unavailable time and cannot be used for appointment creation or movement.

The current visual representation uses a light green background.

### Unconfigured Time

Time for which no working interval exists is displayed as inactive.

The current visual representation uses a grey background.

The same principle is used for past time periods.

---

## 5.3 Calendar Interaction

The calendar must prevent appointment creation or movement into inactive periods.

Active periods allow normal appointment interaction.

Inactive periods cannot be used for scheduling.

The calendar therefore uses the configured working schedule not only as visual information but also as a functional availability boundary.

---

## 5.4 Recurring Appointments

The calendar supports recurring appointments.

A recurring appointment creates a series of appointments based on the selected recurrence parameters.

Each generated appointment remains an independent appointment record while sharing the recurring-series relationship.

Cancelling an individual appointment does not automatically cancel the remaining appointments in the series.

Future functionality may provide additional series-level operations.

---

# 6. Navigation Philosophy

Navigation should always reflect the functional architecture of the application.

The therapist should immediately understand:

* where they are;
* what they can do on the current screen;
* how to return;
* where related functionality is located.

The same feature must never appear in multiple unrelated places.

If functionality belongs to Settings, it should always be accessed through Settings.

If functionality belongs to Work, it should always remain inside the Work area.

This principle minimizes confusion and prevents duplicated user flows.

---

# 7. Registration Philosophy

Registration is a guided, one-time process.

Its purpose is to prepare the therapist for immediate use of the application after creating an account.

The registration wizard currently consists of six steps:

1. Account
2. Personal Information
3. Therapeutic Approaches & Services
4. Practice Locations
5. Working Hours
6. Review & Register

Each step is responsible for one logical part of the registration process.

All steps operate on a shared form model.

The registration data is submitted only after validation has completed successfully.

After successful registration, the wizard is no longer used.

All future changes are performed through the Settings area.

---

# 8. Editing Philosophy

Editing follows the same business rules as registration.

The application should avoid maintaining separate implementations for creating and editing identical data.

Whenever practical:

* registration components become editing components;
* validation logic is shared;
* helper functions are reused;
* business rules exist in only one place.

The primary difference between Registration and Settings is navigation.

Registration uses:

* Next;
* Back;
* Finish.

Settings uses:

* Save;
* Cancel.

The underlying validation and business logic should remain identical.

This approach minimizes duplicated code, simplifies maintenance and reduces the risk of inconsistent behavior between different parts of the application.

---

# 9. User Experience Principles

A consistent user experience is one of the primary goals of TherapistDesk.

Regardless of the module, users should encounter familiar interaction patterns throughout the application.

---

## 9.1 Consistent Interface

Similar actions should always use the same controls, terminology and visual appearance.

Examples include:

* consistent Save and Cancel buttons;
* consistent confirmation dialogs;
* consistent validation messages;
* consistent success and error notifications;
* consistent editing layouts.

Users should never have to learn different workflows for similar tasks.

---

## 9.2 Minimal Navigation

The application should minimize the number of steps required to complete common tasks.

Frequently used functionality should always be easily accessible.

Unnecessary navigation levels should be avoided.

---

## 9.3 Clear Feedback

Every important action should provide immediate feedback.

Examples include:

* successful save;
* validation errors;
* loading indicators;
* confirmation before destructive actions.

The user should never be uncertain whether an operation has completed successfully.

---

## 9.4 Progressive Disclosure

The interface should present only the information needed for the current task.

Advanced options should remain available without overwhelming the user.

This keeps the application approachable for new users while still supporting experienced therapists.

---

# 10. Future Administration

The architecture is designed to support multiple user roles without changing the overall application structure.

Possible future roles include:

* Owner;
* Practice Manager;
* Therapist;
* Secretary;
* Supervisor;
* Trainee;
* Administrator.

Future administration modules may include:

* Users;
* Roles;
* Permissions;
* Subscription Management;
* Feature Management;
* Audit Log;
* Activity History.

Menus, pages and available actions should be generated according to the permissions assigned to the current user.

The same application should support different responsibilities without requiring separate versions of the software.

---

# 11. Future Functional Modules

The current architecture is intentionally designed to support future expansion.

Planned functional areas include, but are not limited to:

## Clinical Work

* Treatment Plans;
* Psychological Assessments;
* Session Notes;
* Homework;
* Exercise Library.

## Communication

* Email Campaigns;
* SMS;
* Push Notifications;
* Secure Client Portal.

## Business

* Online Booking;
* Payments;
* Invoices;
* Financial Reports.

## Artificial Intelligence

* Session Summaries;
* Homework Suggestions;
* Client Progress Analysis;
* Intelligent Scheduling.

## Platform

* Mobile Application;
* Offline Mode;
* Cloud Synchronization;
* API Integrations.

The addition of future modules should not require redesigning the application's navigation or overall architecture.

---

# 12. Long-Term Architecture Goals

The functional architecture of TherapistDesk should continue to satisfy the following objectives throughout the lifetime of the project:

* maintain a clear separation of responsibilities;
* encourage reusable components and shared business logic;
* minimize duplicated functionality;
* support gradual expansion without architectural redesign;
* provide predictable and consistent user workflows;
* keep configuration independent from daily work;
* simplify future maintenance;
* remain understandable for both developers and therapists.

Every future feature should be evaluated against these goals before implementation.

Features that introduce unnecessary complexity or duplicate existing functionality should be redesigned before being added to the application.
