\# Smoke Test



Perform this checklist after every major change before committing.



\---



\## Database



\* \[ ] `npm run db:migrate`

\* \[ ] `npm run db:seed`



\---



\## Backend



\* \[ ] Backend starts successfully.

\* \[ ] No startup errors.



\---



\## Frontend



\* \[ ] Frontend starts successfully.

\* \[ ] Login page loads.



\---



\## Authentication



\* \[ ] Therapist login works.

\* \[ ] Logout works.

\* \[ ] Login works again.



\---



\## Clients



\* \[ ] Clients are displayed.

\* \[ ] Client details open correctly.



\---



\## Calendar



\* \[ ] Calendar loads.

\* \[ ] Existing appointments are displayed.

\* \[ ] Create a new appointment.

\* \[ ] Appointment remains after page refresh.

\* \[ ] Appointment remains after logout/login.



\---



\## Messages



\* \[ ] Messages load correctly.

\* \[ ] Scheduled messages are visible.



\---



\## Notes



\* \[ ] Notes can be opened.

\* \[ ] Notes can be created.



\---



\## General



\* \[ ] No backend exceptions.

\* \[ ] No frontend console errors.

\* \[ ] PostgreSQL data is consistent.



