# 06 - Domain Model

## Practice Domain

### Therapist

Represents the professional using TherapistDesk.

A therapist may have:

- multiple categories
- multiple services
- multiple certificates
- multiple locations
- working hours for every location

---

### Category

Represents an area of practice.

Examples:

- Bowen Therapy
- Massage
- Yumeiho
- Psychotherapy
- Kinesiology
- Speech Therapy

A category contains multiple services.

---

### Service

Represents something a client can book.

A service always belongs to exactly one Category.

Examples:

Massage

- Classic Massage
- Sports Massage
- Relax Massage

Psychotherapy

- Individual
- Family
- Couples

A service defines the default configuration for appointments.

Every service has:

- name
- description
- default duration
- default price
- currency
- color
- active status
- available locations

Appointments are always created for a Service.

Appointment copies the service configuration (duration, price, etc.) as a snapshot so historical appointments remain unchanged after future edits.

---

### Certificate

Represents therapist qualifications.

Certificates are informational only.

They are not used for scheduling.

---

### Location

Represents a place where services are provided.

Examples:

- Office Burgas
- Office Sofia
- Online

---

### Service Availability

A service may be available in multiple locations.

Examples:

Classic Massage

- Office Burgas
- Office Sofia

Online Consultation

- Online

Bowen Therapy

- Office Burgas
- Home Visit

A service is linked to one or more Locations.

There is no special "online" flag.

Online is simply another Location.

---

### Working Hours

Working hours belong to a Location.

Different locations may have different schedules.