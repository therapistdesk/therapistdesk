export const translations = {
  bg: {
    confirmDeleteClient: "Сигурен ли си, че искаш да изтриеш този клиент?",
    clientHasAppointments: "Този клиент има срещи. Първо ги изтрий ръчно.",
    deleteAppointment: "Сигурни ли сте, че искате да отмените срещата?",
    enterClientName: "Име на клиент",
    searchClient: "Търси клиент...",
    duration: "Продължителност",
    addClient: "+ Добави",
    selectClientHint: "Избери клиент за да създадеш среща",
blockVacation: "Отпуск",
blockBusy: "Зает",
blockPersonal: "Личен",
blockErase: "Изтрий",
blockConflict: "Има срещи в този период. Първо ги преместете или изтрийте.",
  },
  en: {
    confirmDeleteClient: "Are you sure you want to delete this client?",
    clientHasAppointments: "This client has appointments. Delete them first.",
    deleteAppointment: "Are you sure you want to cancel the meeting?",
    enterClientName: "Client name",
    searchClient: "Search client...",
    duration: "Duration",
    addClient: "+ Add",
    selectClientHint: "Select a client to create an appointment",
blockVacation: "Vacation",
blockBusy: "Busy",
blockPersonal: "Personal",
blockErase: "Erase",
blockConflict: "There are appointments in this period. Please move or delete them first.",
  },
};

export const t = (key, lang) => {
  return translations[lang]?.[key] || key;
};