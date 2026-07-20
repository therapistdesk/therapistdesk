# 08 - Registration

## Цел

Регистрацията на терапевт представлява многостъпков wizard.

Целта е още при регистрацията да бъдат събрани всички необходими данни за начална работа със системата.

След успешна регистрация терапевтът трябва да може веднага да започне да използва календара.

---

# Основни принципи

* Регистрацията е разделена на независими React компоненти.
* Всеки компонент отговаря само за една стъпка.
* Всички данни се пазят в един общ `form` state.
* Компонентите никога не пазят собствено копие на данните.
* Навигацията между стъпките не губи информация.
* Всички helper функции са pure functions.
* Не се допуска директна мутация на state.

---

# Структура

Регистрацията е разделена на следните компоненти:

```
RegisterAccount
RegisterPersonal
RegisterPractice
RegisterLocations
RegisterWorkingHours
RegisterReview
```

Последният компонент в момента изпълнява ролята на Review / Register екран.

---

Registration workflow:

Step 1 – Account
Step 2 – Personal
Step 3 – Practice
Step 4 – Locations
Step 5 – Working Hours
Step 6 – Review & Register

Всички стъпки работят върху един общ form state.
Регистрацията се изпраща към backend едва след успешно преминаване през всички валидации.


# Form Model

Главният state е:

```text
form
```

Той съдържа:

```text
form.basic
form.profile
form.practice
```

---

## form.basic

Съдържа:

* firstName
* middleName
* lastName
* email
* phone
* password
* confirmPassword

---

## form.profile

Съдържа личната информация:

* gender
* birthDate
* country
* city
* address

---

## form.practice

Съдържа професионалната конфигурация:

* categories
* locations
* certificates

---

# Categories

Категорията представлява област на работа.

Пример:

* Massage
* Bowen
* Psychotherapy

Всяка категория съдържа множество услуги.

---

# Services

Услугата е това, което клиентът реално резервира.

Всяка услуга съдържа:

* name
* description
* defaultDurationMinutes
* defaultPrice
* currency
* color
* locations

Цветът принадлежи на услугата.

Appointment няма собствен цвят.

Календарът визуализира цвета на услугата.

---

# Colors

Използва се фиксирана палитра.

Не се използва color picker.

Всички услуги използват една от предварително дефинираните стойности:

* violet
* indigo
* blue
* green
* yellow
* orange
* red

В базата се записва идентификаторът на цвета, а не HEX стойност.

HEX цветовете се определят единствено във frontend helper.

---

# Locations

Локацията представлява място за работа.

Примери:

* Централен кабинет
* Онлайн
* Поморие

Всяка локация съдържа:

* type
* name
* country
* city
* address
* notes
* active
* workingHours

Всяка локация има постоянен номер, уникален за конкретния терапевт.

Номерът се използва за визуализация в календара и за бързо разпознаване на локацията.

---

# Working Hours

Работното време принадлежи на конкретна локация.

Различните локации могат да имат различно работно време.

Работното време съдържа:

* monday
* tuesday
* wednesday
* thursday
* friday
* saturday
* sunday

Всеки ден съдържа списък от интервали.

Интервалът съдържа:

* start
* end
* type

Типовете са:

* work
* break

## RegisterWorkingHours

Step 5 позволява конфигуриране на работното време за всяка практика локация.

Поддържа:

* множество интервали за ден;
* добавяне, редакция и изтриване на интервали;
* Apply to all days;
* Clear Day;
* валидация на интервалите.

По време на редакция интервалите не се сортират.

При преминаване към следващата стъпка RegisterApp извиква `sortPracticeWorkingHours()`, след което се изпълнява `validateWorkingHours()`.

По този начин потребителят редактира стабилен списък, а следващите стъпки и записът в базата винаги работят със сортирани данни.

## Функционалности

✅ Поддръжка на множество работни интервали за всеки ден.

✅ Добавяне, редакция и изтриване на интервали.

✅ Apply to all days – копира всички интервали към всички ден.

✅ Clear Day – изтрива всички интервали за деня.

✅ Валидация за:
- минимална продължителност;
- валиден диапазон;
- липса на застъпване между интервалите.

## Сортиране

По време на редакция интервалите не се сортират, за да не се променя позицията на редактирания ред и да се осигури стабилно потребителско изживяване.

При преминаване към **Step 6** интервалите се сортират автоматично по начален час чрез `sortPracticeWorkingHours()`.

Step 6 и записът в базата винаги работят със сортирани интервали.

---

# RegisterHelpers

Всички бизнес операции върху form се изпълняват чрез RegisterHelpers.

Файлът не съдържа React.

Файлът не съдържа JSX.

Всички функции са pure.

---

## Factory functions

Създават празни обекти:

* createEmptyCategory()
* createEmptyService()
* createEmptyLocation()
* createDefaultWorkingHours()
* createEmptyWorkingInterval()

---

## Category helpers

* addCategory()
* updateCategory()
* removeCategory()

---

## Service helpers

* addService()
* updateService()
* removeService()

---

## Location helpers

* addLocation()
* updateLocation()
* removeLocation()

---

## Working hours helpers

* addWorkingInterval()
* updateWorkingInterval()
* removeWorkingInterval()
* copyWorkingDay()
* clearWorkingDay()

---

## Validation

Валидирането е разделено по стъпки.

Използват се:

* validateBasic()
* validateProfile()
* validatePractice()
* validateLocations()
* validateWorkingHours()

Всяка функция връща:

```
{
    valid,
    errors
}
```

---

# Backend

Регистрацията записва пълния модел в базата.

При успешна регистрация се създават:

* User
* Therapist
* Categories
* Services
* PracticeLocations
* ServiceLocation
* WorkingIntervals

Всички релации се създават в рамките на една регистрация.

След успешен запис терапевтът разполага с напълно конфигурирана практика.
---

# Следващи задачи

След регистрацията предстои разработването на модула:

* Therapist Profile
* Редакция на личните данни
* Управление на категории
* Управление на услуги
* Управление на Practice Locations
* Управление на Working Hours
