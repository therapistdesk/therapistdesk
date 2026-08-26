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

## Settings

### My Profile

* [ ] My Profile loads correctly.
* [ ] Profile information can be edited.
* [ ] Save is disabled when there are no changes.
* [ ] Save stores changes successfully.
* [ ] Cancel restores the last saved values.

### Practice Locations

* [ ] Practice Locations loads correctly.
* [ ] Existing locations are displayed.
* [ ] A new location can be added.
* [ ] Location information can be edited.
* [ ] Save stores location changes successfully.
* [ ] Cancel restores the last saved values.
* [ ] Location numbers remain correct.

### Therapeutic Approaches & Services

* [ ] Categories are displayed.
* [ ] Services are displayed under the correct categories.
* [ ] Categories can be added and edited.
* [ ] Services can be added, edited and removed.
* [ ] Save is disabled when there are no changes.
* [ ] Save stores changes successfully.
* [ ] Cancel restores the last saved values.

### Working Hours

* [ ] Practice locations can be selected.
* [ ] Each location displays its own working hours.
* [ ] Working intervals can be added.
* [ ] Working intervals can be edited.
* [ ] Working intervals can be removed.
* [ ] A day can be cleared.
* [ ] Working hours can be copied to other days.
* [ ] Save is disabled when there are no changes.
* [ ] Save stores changes successfully.
* [ ] The selected location remains selected after Save.
* [ ] Cancel restores the last saved working hours.
* [ ] Working hours remain correct after page refresh.
* [ ] A location without working hours can be configured normally.



\## General



\* \[ ] No backend exceptions.

\* \[ ] No frontend console errors.

\* \[ ] PostgreSQL data is consistent.



