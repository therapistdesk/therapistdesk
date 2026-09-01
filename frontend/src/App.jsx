import { useState, useEffect, useMemo, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
// import NotePage from "./NotePage";
import Modal from "./components/Modal";
import NoteModal from "./components/NoteModal";
import ClientAccess from "./ClientAccess";
import ClientQR from "./components/ClientQR";

import TopBar from "./components/calendar/TopBar";
import SettingsPage from "./components/settings/SettingsPage";

// след рефакторинг на 20.08.26
import {
  isPastDateTime,
  isOverlapping,
  layoutEvents,
  toMinutes,
  snap,
  clamp,
  getClientColor,
  getAppointmentLayout,
  handleAppointmentDragStart,
} from "./components/calendar/calendarHelpers";
import AppointmentPreview from "./components/calendar/AppointmentPreview";
import ClientContextMenu from "./components/clients/ClientContextMenu";
import AppointmentContextMenu from "./components/calendar/AppointmentContextMenu";
import AppointmentCard from "./components/calendar/AppointmentCard";
import AuthScreen from "./components/auth/AuthScreen";
import AddClientModal from "./components/clients/AddClientModal";
import CalendarNavigation from "./components/calendar/CalendarNavigation";
import { subscribePush } from "./components/push/pushService";

// -------------------------------------------------------------------------


import {
  getClients,
  getAppointments,
  getMessages,
  createAppointment,
  deleteAppointment,
  updateAppointment,
  markMessageAsRead,
} from "./api";

import { t } from "./translations";

import RegisterApp from "./register/RegisterApp";
import ResetPassword from "./register/ResetPassword";
import VerifyEmail from "./register/VerifyEmail";
// import { useNavigate } from "react-router-dom";

import RecurringForm from "./components/RecurringForm";

// const WORK_START = 7;
// const WORK_END = 20;
// const WORK_END_MINUTE = 30;
const SLOT = 30;
const PX_PER_MINUTE = 1;
// const DAY_START = WORK_START * 60;
// const DAY_END = WORK_END * 60 + WORK_END_MINUTE;

const user = JSON.parse(localStorage.getItem("user"));
const userRole = user?.role;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ===== HELPERS =====

function App() {
  //----------------------------------------------
  const [qrClient, setQrClient] = useState(null);
  const path = window.location.pathname;

  if (path.startsWith("/client-access/")) {
    return <ClientAccess />;
  }

  const [showRecurring, setShowRecurring] = useState(false);
  useEffect(() => {
  }, [showRecurring]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.error("SW ERROR", err));
    }
  }, []);

  const [moveMode, setMoveMode] = useState(null);
  const location = useLocation();
  const handleAddNote = (appointment) => {
    setAppointmentMenu(null);

    setNoteAppointment(appointment);
    setNoteModalOpen(true);
  };
  // ===== CLIENTS ====
  const [showAddClient, setShowAddClient] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const [creating, setCreating] = useState(false);

  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    email: "",
    country: "",
    city: "",
    notes: "",
  });

  const token = localStorage.getItem("token");
  const verifyEmail = localStorage.getItem("verifyEmail");
  const [currentDate, setCurrentDate] = useState(new Date());
  const baseDate = currentDate;
  const [messages, setMessages] = useState([]);

  const [mode, setMode] = useState("login");

  useEffect(() => {
    localStorage.setItem("mode", mode);
  }, [mode]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //const [token, setToken] = useState("");
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeAppointment, setActiveAppointment] = useState(null);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteAppointment, setNoteAppointment] = useState(null);

  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const [user, setUser] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [practiceLocations, setPracticeLocations] = useState([]);

  const [selectedLocationId, setSelectedLocationId] = useState(() => {
    const saved = localStorage.getItem("selectedLocationId");
    return saved ? Number(saved) : null;
  });
  const [selectedServiceId, setSelectedServiceId] = useState(() => {
    const saved = localStorage.getItem("selectedServiceId");
    return saved ? Number(saved) : null;
  });
  useEffect(() => {
    if (selectedLocationId != null) {
      localStorage.setItem(
        "selectedLocationId",
        String(selectedLocationId)
      );
    }
  }, [selectedLocationId]);
  useEffect(() => {
    if (selectedServiceId != null) {
      localStorage.setItem(
        "selectedServiceId",
        String(selectedServiceId)
      );
    }
  }, [selectedServiceId]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [newClientId, setNewClientId] = useState(null);
  const [search, setSearch] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const clientRefs = useRef({});

  // ===== APPOINTMENT MENU =====
  const [appointmentMenu, setAppointmentMenu] = useState(null);
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  // ===== ADD CLIENT INPUT =====
  const [newClientName, setNewClientName] = useState("");
  // ===== LANGUAGE (3.7) =====
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || "bg";
  });


  // ===== CLIENT CONTEXT MENU (3.7) =====
  const [clientMenu, setClientMenu] = useState(null);
  // ===== LONG PRESS =====
  const [pressTimer, setPressTimer] = useState(null);

  useEffect(() => {
    const savedTherapist = localStorage.getItem("therapist");
    if (savedTherapist) {
      setTherapist(JSON.parse(savedTherapist));
    }
  }, []);

  useEffect(() => {
    if (!practiceLocations.length) {
      return;
    }

    setSelectedLocationId((current) => {
      const exists = practiceLocations.some(
        (location) => location.id === current
      );

      if (exists) return current;

      return practiceLocations[0].id;
    });
  }, [practiceLocations]);

  const hasAppointment = (day, startMin, endMin) => {
    const dDay = new Date(day).setHours(0, 0, 0, 0);

    return appointments.some((a) => {
      const aDay = new Date(a.startTime).setHours(0, 0, 0, 0);
      if (aDay !== dDay) return false;

      const aStart = toMinutes(a.startTime);
      const aEnd = toMinutes(a.endTime);

      return startMin < aEnd && aStart < endMin;
    });
  };

  const [dragged, setDragged] = useState(null);
  const [preview, setPreview] = useState(null);
  const [hoverY, setHoverY] = useState(null);
  const [hoverDayIndex, setHoverDayIndex] = useState(null);

  const reloadAppointments = () => {
    const start = new Date(startOfWeek);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return getAppointments(
      token,
      start.getTime(),
      end.getTime()
    ).then(setAppointments);
  };

  const markAsRead = async (id) => {
    await markMessageAsRead(id, token);

    setMessages(prev =>
      prev.map(m =>
        m.id === id ? { ...m, readAt: new Date() } : m
      )
    );
  };

  const handleAddClient = async () => {
    if (!clientForm.name.trim()) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(clientForm),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Error");
      return;
    }

    const updated = await getClients(token);
    setClients(updated);

    setShowAddClient(false);

    setClientForm({
      name: "",
      phone: "",
      email: "",
      country: "",
      city: "",
      notes: "",
    });
  };

  const unreadCount = messages.filter(m => !m.readAt).length;

  useEffect(() => {
    if (!token) return;

    getMessages(token).then(data => {
      setMessages(data);
    });
  }, [token]);

  useEffect(() => {
    if (!token) return;

    getMessages(token).then(data => {
      setMessages(data);
    });
  }, [token]);

  useEffect(() => {
    if (selectedClient?.id) {
      subscribePush({
        selectedClient,
        apiUrl: API_URL,
      });
    }
  }, [selectedClient?.id]);

  useEffect(() => {
    async function loadClients() {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
    }

    loadClients();
  }, []);

  useEffect(() => {
    // 👇 АКО сме в register/reset/verify → НЕ auto-login
    if (mode === "register" || mode === "reset" || mode === "verify") {
      return;
    }

    const t = localStorage.getItem("token");

    if (!t || t === "undefined" || t === "null") {
      return;
    }

    fetch(`${API_URL}/therapists/me`, {
      headers: {
        Authorization: `Bearer ${t}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        // setToken(t);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        // setToken(null);
      });
  }, [mode]); // 👈 важно

  useEffect(() => {
    return () => {
      if (pressTimer) clearTimeout(pressTimer);
    };
  }, [pressTimer]);

  useEffect(() => {
    const handleClickOutside = () => {
      setHoverY(null);
      setHoverDayIndex(null);
    };

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);
  // -----------------------------------

  useEffect(() => {
    if (location.state && location.state.reload) {
      reloadAppointments();

      // изчистваме state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (!token) return;

    async function loadPracticeLocations() {
      try {
        const res = await fetch(
          `${API_URL}/settings/practice`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error("Failed to load practice locations");
        }

        setPracticeLocations(
          Array.isArray(data?.practiceLocations)
            ? data.practiceLocations
            : Array.isArray(data)
              ? data
              : []
        );
      } catch (err) {
        console.error(
          "Failed to load practice locations:",
          err
        );
      }
    }

    loadPracticeLocations();
  }, [token]);

  const selectedLocation = practiceLocations.find(
    (location) => location.id === selectedLocationId
  );

  const availableServices = (selectedLocation?.services ?? [])
    .map((item) => item.service)
    .filter(Boolean);

  const selectedService = availableServices.find(
    (service) => service.id === selectedServiceId
  );

  const duration =
    selectedService?.defaultDurationMinutes ?? 60;

  useEffect(() => {
    if (!selectedLocationId) {
      return;
    }

    if (!selectedLocation) {
      return;
    }

    if (!availableServices.length) {
      setSelectedServiceId(null);
      return;
    }

    const stillAvailable = availableServices.some(
      (service) => service.id === selectedServiceId
    );

    if (!stillAvailable) {
      setSelectedServiceId(availableServices[0].id);
    }
  }, [selectedLocationId, selectedLocation, availableServices.length]);

  const locationWorkRange = useMemo(() => {
    const intervals = selectedLocation?.workingIntervals ?? [];

    if (!intervals.length) {
      return null;
    }

    const starts = intervals.map(
      (interval) => interval.startMinutes
    );

    const ends = intervals.map(
      (interval) => interval.endMinutes
    );

    return {
      startMinutes: Math.min(...starts),
      endMinutes: Math.max(...ends),
    };
  }, [selectedLocation]);

  const WORK_START =
    locationWorkRange?.startMinutes != null
      ? Math.floor(locationWorkRange.startMinutes / 60)
      : 8;

  const WORK_END =
    locationWorkRange?.endMinutes != null
      ? Math.floor(locationWorkRange.endMinutes / 60)
      : 24;

  const WORK_END_MINUTE =
    locationWorkRange?.endMinutes != null
      ? locationWorkRange.endMinutes % 60
      : 30;

  const DAY_START = WORK_START * 60;
  const DAY_END =
    WORK_END * 60 + WORK_END_MINUTE;

  const getDayWorkingIntervals = (day) => {
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const dayName = dayNames[new Date(day).getDay()];

    return (selectedLocation?.workingIntervals ?? [])
      .filter((interval) => interval.day === dayName)
      .map((interval) => ({
        start: Number(interval.startMinutes),
        end: Number(interval.endMinutes),
        type: interval.type,
      }))
      .filter((interval) => interval.start < interval.end)
      .sort((a, b) => a.start - b.start);
  };

  useEffect(() => {
    if (!newClientId) return;

    const timer = setTimeout(() => {
      setNewClientId(null);
    }, 1500);

    return () => clearTimeout(timer);
  }, [newClientId]);

  useEffect(() => {
    if (!selectedClient) return;

    const el = clientRefs.current[selectedClient];

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedClient, clients]);

  useEffect(() => {

    if (!token) return;

    getClients(token).then((data) => {
      setClients(data);
    });
  }, [token]);

  // ===== WEEK and MONTH =====
  const startOfWeek = useMemo(() => {
    const d = new Date(baseDate);

    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);

    return d;
  }, [baseDate]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  useEffect(() => {
    if (!token) return;

    reloadAppointments();

    const interval = setInterval(() => {
      reloadAppointments();
    }, 30000); // на 30 секунди 

    return () => clearInterval(interval);
  }, [startOfWeek, token]);

  // ---------------------------
  // ===== EVENTS =====
  const eventsByDay = useMemo(() => {
    return weekDays.map((day) => {
      const dayEvents = appointments
        // .filter((a) => a.status !== "cancelled") // 🔥 ТОВА Е FIX-а
        .filter((a) => {
          const aDate = new Date(a.startTime);
          const dDate = new Date(day);

          // return aDate.toISOString().slice(0, 10) === dDate.toISOString().slice(0, 10);

          return (
            aDate.getFullYear() === dDate.getFullYear() &&
            aDate.getMonth() === dDate.getMonth() &&
            aDate.getDate() === dDate.getDate()
          );
        })

        .map((a) => {
          const relation = a.therapist?.therapistClients?.find(
            (tc) => tc.clientId === a.clientId
          );

          return {
            ...a,
            relation, // 👈 добавяме го тук
            start: toMinutes(a.startTime),
            end: toMinutes(a.endTime),
            column: 0,
            totalColumns: 1,
          };
        });

      return layoutEvents(dayEvents);
    });
  }, [appointments, weekDays]);


  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // ===== CREATE =====

  const handleSlotClick = async (day, yPosition) => {
    if (creating) return;
    setCreating(true);

    try {
      // 🔵 MOVE MODE
      if (moveMode) {
        let minutesFromTop = snap(yPosition / PX_PER_MINUTE);
        // minutesFromTop = clamp(minutesFromTop, 0, 12 * 60);
        minutesFromTop = clamp(
          minutesFromTop,
          0,
          DAY_END - DAY_START
        );

        const absoluteMinutes = DAY_START + minutesFromTop;
        const workingIntervals = getDayWorkingIntervals(day);

        const isWorking = workingIntervals.some(
          (interval) =>
            absoluteMinutes >= interval.start &&
            absoluteMinutes <= interval.end
        );

        if (!isWorking) {
          setCreating(false);
          return;
        }

        const durationMs =
          new Date(moveMode.endTime) - new Date(moveMode.startTime);

        const durationMinutes = durationMs / 60000;

        const start = new Date(day);
        start.setHours(0, 0, 0, 0);
        start.setMinutes(absoluteMinutes);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + durationMinutes);

        await updateAppointment(token, moveMode.id, {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        });

        setMoveMode(null);
        await reloadAppointments();
        return;
      }

      // 🔴 CREATE MODE
      if (!selectedClient) {
        setCreating(false); // 🔥 ОСВОБОЖДАВА LOCK
        return;
      }

      let minutesFromTop = snap(yPosition / PX_PER_MINUTE);
      // minutesFromTop = clamp(minutesFromTop, 0, 12 * 60);
      minutesFromTop = clamp(
        minutesFromTop,
        0,
        DAY_END - DAY_START
      );

      const absoluteMinutes = DAY_START + minutesFromTop;

      const workingIntervals = getDayWorkingIntervals(day);

      const isWorking = workingIntervals.some(
        (interval) =>
          absoluteMinutes >= interval.start &&
          absoluteMinutes <= interval.end
      );

      if (!isWorking) {
        setCreating(false);
        return;
      }

      if (isPastDateTime(day, absoluteMinutes)) {
        setCreating(false);
        return;
      }

      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      start.setMinutes(absoluteMinutes);

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + duration);

      // 🔥 ДОБАВЯМЕ DEBUG (много важно)
      await createAppointment(token, {
        clientId: selectedClient,
        practiceLocationId: selectedLocationId,
        serviceId: selectedServiceId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });

      setSelectedClient(null);

      await reloadAppointments();

    } catch (e) {
      console.error("HANDLE SLOT ERROR:", e);
    } finally {
      // 🔥 малък debounce (спира double trigger)
      setTimeout(() => {
        setCreating(false);
      }, 200);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("therapist", JSON.stringify(data.therapist));

      localStorage.removeItem("mode");
      setMode("login");

      window.location.reload();
    } else {
      alert("Login failed");
    }

    setUser(data.user);
    setTherapist(data.therapist);
  };

  const handleRegister = async () => {
    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // if (data.access_token) {
    if (data.requiresVerification) {
      alert("Verification required");
    } else if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      // ако ти трябва refresh token
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("therapist", JSON.stringify(data.therapist));

      localStorage.removeItem("mode");

      window.location.reload(); // 🔑 винаги последно
    } else {
      alert("Register failed");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter your email first");
      return;
    }

    await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    alert("If this email exists, a reset link was sent.");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token"); // правилния token
    localStorage.removeItem("mode"); // 🔥 това е ключът
    // setToken(null);
    setMode("login"); // 🔥 връща към login екрана
  };

  // ===== DRAG =====
  // ----------------------- 31.08.26
  const calendarEventLockRef = useRef(false);

  const acquireCalendarEventLock = () => {
    if (calendarEventLockRef.current) return false;

    calendarEventLockRef.current = true;
    return true;
  };

  const releaseCalendarEventLock = () => {
    calendarEventLockRef.current = false;
  };
  // -------------------- 31.08.26

  const handleDrop = async (day, yPosition) => {
    setHoverY(null);
    setHoverDayIndex(null);
    if (!dragged) return;

    let minutesFromTop = snap(yPosition / PX_PER_MINUTE);
    minutesFromTop = clamp(
      minutesFromTop,
      0,
      DAY_END - DAY_START
    );

    const absoluteMinutes = DAY_START + minutesFromTop;

    if (isPastDateTime(day, absoluteMinutes)) return;

    const durationMs =
      new Date(dragged.endTime) - new Date(dragged.startTime);

    const durationMinutes = durationMs / 60000;

    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    start.setMinutes(absoluteMinutes);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMinutes);

    await updateAppointment(token, dragged.id, {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });

    setTimeout(() => {
      setDragged(null);
      setPreview(null);
      setHoverY(null);
      setHoverDayIndex(null);
    }, 0);

    setAppointmentMenu(null);
    setActiveAppointment(null);

    await reloadAppointments();
  };

  // ===== CLIENT FILTER =====
  // const filteredClients =
  //   clients.length > 0 ? clients : [];

  if (!token) {
    if (verifyEmail) return <VerifyEmail />;
    if (mode === "register")
      return (
        <RegisterApp
          onBack={() => setMode("login")}
        />
      );
    if (mode === "reset") return <ResetPassword />;

    if (mode === "settings") {
      return (
        <div style={{ padding: 30 }}>
          <h2>Settings</h2>
          <p>Coming soon...</p>

          <button onClick={() => setMode("calendar")}>
            Back
          </button>
        </div>
      );
    }

    return (
      <AuthScreen
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        handleForgotPassword={handleForgotPassword}
        onRegister={() => setMode("register")}
      />
    );
  }

  <Routes>
    <Route path="/client-access/:id" element={<ClientAccess />} />
  </Routes>

  if (mode === "settings-home") {
    return (
      <SettingsPage
        onBack={() => setMode("calendar")}
      />
    );
  }

  return (
    <>
      <div
        style={{ padding: 20 }}
        onMouseDown={() => {
          setActiveAppointment(null);
        }}
      >
        {/* старо */}
        {/* <h2>TherapistDesk</h2>

        <div>
          Добре дошъл, {therapist?.firstName} {therapist?.lastName}
        </div> */}
        <TopBar
          therapist={therapist}
          moveMode={moveMode}
          clients={clients}
          selectedClient={selectedClient}
          setMode={setMode}
        />

        <div style={{ marginBottom: 10 }}>
          <button
            onClick={() => {
              setLang("bg");
              localStorage.setItem("lang", "bg");
            }}
          >
            BG
          </button>

          <button
            onClick={() => {
              setLang("en");
              localStorage.setItem("lang", "en");
            }}
            style={{ marginLeft: 5 }}
          >
            EN
          </button>
        </div>

        <input
          placeholder={t("searchClient", lang)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ marginTop: 10 }}>
          <input
            placeholder={t("enterClientName", lang)}
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            style={{ marginRight: 5 }}
          />

          <button onClick={() => setShowAddClient(true)}>
            {t("addClient", lang)}
          </button>
        </div>

        <div style={{ maxHeight: 120, overflow: "auto", border: "1px solid #ccc" }}>
          {clients
            // .filter((c) =>
            //   c.client?.name?.toLowerCase().includes(search.toLowerCase())
            // )
            .filter((c) => {
              const name = c.client?.name || c.name || "";
              return name.toLowerCase().includes((search || "").toLowerCase());
            })

            .map((c) => {
              if (!c) return null;

              return (
                <div
                  key={c.id}
                  ref={(el) => (clientRefs.current[c.id] = el)}
                  onClick={() => {
                    setSelectedClient(c);
                  }}
                  onMouseDown={(e) => {
                    const timer = setTimeout(() => {
                      setClientMenu({
                        x: e.clientX,
                        y: e.clientY,
                        client: c,
                      });
                    }, 600);

                    setPressTimer(timer);
                  }}
                  onMouseUp={() => {
                    clearTimeout(pressTimer);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setClientMenu({
                      x: e.clientX,
                      y: e.clientY,
                      client: c,
                    });
                  }}
                  style={{
                    padding: 5,
                    cursor: "pointer",
                    background:
                      newClientId === c.id
                        ? "#fff59d"
                        // : selectedClient?.id === c.client.id
                        : selectedClient?.id === c.id
                          ? "#c8e6c9"
                          : "white",
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* {c.client.name} */}
                  {c.name}
                  {c.alias && ` (${c.alias})`}

                  <button
                    onClick={async (e) => {
                      e.stopPropagation();

                      const confirmDelete = window.confirm(t("deleteAppointment", lang));
                      if (!confirmDelete) return;

                      const hasAppointments = appointments.some(
                        // (a) => a.client?.id === c.client.id
                        (a) => a.client?.id === c.id && a.status !== "cancelled"
                      );

                      if (hasAppointments) {
                        alert(t("clientHasAppointments", lang));
                        return;
                      }

                      await fetch(`${API_URL}/clients/${c.id}`, {
                        method: "DELETE",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });

                      const updated = await getClients(token);
                      setClients(updated);
                    }}
                    style={{ marginLeft: 10 }}
                  >
                    ❌
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrClient(c);
                    }}
                  >
                    QR
                  </button>
                </div>
              );
            })}

        </div>

        <hr />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label>{t("service", lang)}: </label>

          <select
            value={selectedServiceId ?? ""}
            onChange={(e) =>
              setSelectedServiceId(
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">-- избери услуга --</option>

            {availableServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} ({service.defaultDurationMinutes} min)
              </option>
            ))}
          </select>
        </div>

        <hr />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <CalendarNavigation
            setCurrentDate={setCurrentDate}
            selectedClient={selectedClient}
            setShowRecurring={setShowRecurring}
            selectedDate={selectedDate}
          />

          {practiceLocations.length > 0 && (
            <select
              value={selectedLocationId ?? ""}
              onChange={(e) =>
                setSelectedLocationId(Number(e.target.value))
              }
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "#fff",
                fontSize: 14,
              }}
            >
              {practiceLocations
                .filter((location) => location.isActive !== false)
                .map((location) => (
                  <option
                    key={location.id}
                    value={location.id}
                  >
                    📍 {location.name}
                  </option>
                ))}
            </select>
          )}
        </div>

        <div style={{ fontWeight: "bold", marginBottom: 5 }}>
          {baseDate.toLocaleDateString(lang === "bg" ? "bg-BG" : "en-US", {
            month: "long",
            year: "numeric",
          })}
        </div>

        {/* CALENDAR */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px repeat(7, 1fr)",
            gridAutoColumns: "1fr",
            // position: "relative",
            position: "static",
            pointerEvents: "none",
            height: "80vh",
            overflowY: "auto",
            alignContent: "start",
            paddingTop: 40,
          }}
        >

          <div
            style={{
              height: 0,              // 👈 вместо 30
              position: "sticky",
              top: 0,
              background: "transparent", // 👈 да не покрива
              zIndex: 0,              // 👈 да не е над часовете
            }}
          ></div>

          {weekDays.map((d, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                fontWeight: hoverDayIndex === i ? "bold" : "normal",
                fontSize: hoverDayIndex === i ? 16 : 13,
                transition: "all 0.15s ease",
                zIndex: 20,
                background: "#fff",


                background:
                  new Date(d).toDateString() === new Date().toDateString()
                    ? "#e3f2fd"
                    : "transparent",
                borderBottom:
                  new Date(d).toDateString() === new Date().toDateString()
                    ? "2px solid #2196f3"
                    : "none",
              }}
            >
              {dayNames[i]} <br />
              {d.toLocaleDateString()}
            </div>
          ))}

          {/* TIME */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            {Array.from({
              // length: ((WORK_END * 60 + WORK_END_MINUTE) - WORK_START * 60) / SLOT
              length: (DAY_END - DAY_START) / SLOT + 1
            }).map((_, i) => {
              // const totalMin = WORK_START * 60 + i * SLOT;
              const totalMin = DAY_START + i * SLOT;
              const hour = Math.floor(totalMin / 60);
              const min = (totalMin % 60).toString().padStart(2, "0");

              return (
                <div
                  key={i}
                  style={{
                    height: SLOT,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 6,
                    borderTop: "1px solid #eee",
                    background: "#fff",
                  }}
                >
                  {hour}:{min}
                </div>
              );
            })}
          </div>

          {/* DAYS */}
          {eventsByDay.map((events, dayIndex) => (

            <div
              key={dayIndex}
              data-dayindex={dayIndex}

              onClickCapture={(e) => {
                // изпълнява се само веднъж за целия клик
                if (e.nativeEvent.__handled) return;
                e.nativeEvent.__handled = true;

                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;

                // if (!selectedClient) return;
                if (!selectedClient && !moveMode) return;

                handleSlotClick(weekDays[dayIndex], y);
              }}

              style={{
                position: "relative",
                borderLeft: "1px solid #ccc",
                height: DAY_END - DAY_START + SLOT,
                overflow: "hidden",
                pointerEvents: "auto",
                width: "100%",
                backgroundImage: "repeating-linear-gradient(to bottom, #eee 0px, #eee 1px, transparent 1px, transparent 30px)",
              }}

              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;

                const snapped = snap(y / PX_PER_MINUTE);

                setHoverY(snapped * PX_PER_MINUTE);
                setHoverDayIndex(dayIndex);

                // 👉 ВРЪЩАМЕ визуалния hover
                setHoverY(snapped * PX_PER_MINUTE);
                setHoverDayIndex(dayIndex);

                if (dragged) {
                  setPreview(y);
                }
              }}

              onTouchMove={(e) => {
                if (!dragged) return;

                const touch = e.touches[0];

                const rect = e.currentTarget.getBoundingClientRect();
                const y = touch.clientY - rect.top;

                const snapped = snap(y / PX_PER_MINUTE);

                setHoverY(snapped * PX_PER_MINUTE);
                setHoverDayIndex(dayIndex);
                setPreview(y);

                // e.preventDefault();
              }}

              onDragOver={(e) => {
                e.preventDefault();

                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;

                const snapped = snap(y / PX_PER_MINUTE);

                // 👉 обновява линиите по време на drag
                setHoverY(snapped * PX_PER_MINUTE);
                setHoverDayIndex(dayIndex);

                // (по желание) ако ползваш preview при drag
                setPreview(y);
              }}

              onDrop={(e) => {
                e.preventDefault();

                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;

                handleDrop(weekDays[dayIndex], y);
              }}

              onMouseLeave={() => {
                if (!dragged) {
                  setHoverY(null);
                  setPreview(null);
                }
              }}
            >

              {new Date(weekDays[dayIndex]).toDateString() ===
                new Date().toDateString() && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: 3,
                      background: "#2196f3",
                      zIndex: 20,
                    }}
                  />
                )}

              {!selectedClient && dayIndex === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    right: 10,
                    background: "#fff3cd",
                    padding: 6,
                    fontSize: 12,
                    border: "1px solid #ffeeba",
                    zIndex: 5,
                  }}
                >
                  {t("selectClientHint", lang)}
                </div>
              )}

              {/* GRID + WORKING HOURS */}
              {Array.from({
                length: (DAY_END - DAY_START) / SLOT + 1,
              }).map((_, i) => {
                const minutes = DAY_START + i * SLOT;
                const day = weekDays[dayIndex];

                const workingIntervals = getDayWorkingIntervals(day);

                const activeInterval = workingIntervals.find(
                  (interval) =>
                    minutes >= interval.start &&
                    minutes < interval.end + SLOT
                );


                const isWorking = activeInterval?.type === "work";
                const isBreak = activeInterval?.type === "break";

                const isPast =
                  isPastDateTime(day, minutes) ||
                  !activeInterval;

                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: i * SLOT,
                      height: SLOT,
                      left: 0,
                      right: 0,
                      borderTop:
                        i % 2 === 0
                          ? "1px solid #eee"
                          : "1px dashed #ddd",
                      background:
                        isBreak
                          ? "#dff3e3"
                          : !isWorking || isPast
                            ? "#f5f5f5"
                            : "transparent",

                      pointerEvents:
                        isWorking && !isPast ? "none" : "auto",
                    }}
                    onClickCapture={(e) => {
                      if (!isWorking || isPast) {
                        e.stopPropagation();
                      }
                    }}

                    onMouseDown={(e) => {
                      if (!isWorking || isPast) {
                        e.stopPropagation();
                      }
                    }}

                    onDragOver={(e) => {
                      if (!isWorking || isPast) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}

                    onDrop={(e) => {
                      if (!isWorking || isPast) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  />
                );
              })}

              {/* ACTIVE COLUMN + VERTICAL LINE */}
              {hoverDayIndex === dayIndex && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "rgba(255,0,0,0.03)",
                      pointerEvents: "none",
                      zIndex: 0,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: 2,
                      background: "red",
                      opacity: 0.4,
                    }}
                  />
                </div>
              )}

              {/* ACTIVE ROW + HOVER LINE */}
              {hoverY !== null && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: hoverY,
                      height: SLOT,
                      left: 0,
                      right: 0,
                      background: "rgba(255,0,0,0.05)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: hoverY,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "red",
                      opacity: 0.6,
                      pointerEvents: "none",   // 👈 добави
                      zIndex: 0,               // 👈 добави
                    }}
                  />
                </>
              )}

              {/* PREVIEW */}

              {events
                .map((a) => {
                  const {
                    start,
                    end,
                    top,
                    height,
                    width,
                    left,
                    borderColor,
                    isSeen,
                    isCancelled,
                    isConfirmed,
                    isClientCancelled,
                  } = getAppointmentLayout(a, {
                    DAY_START,
                    PX_PER_MINUTE,
                  });

                  return (
                    <AppointmentCard
                      a={a}
                      start={start}
                      end={end}
                      top={top}
                      height={height}
                      width={width}
                      left={left}
                      borderColor={borderColor}
                      isSeen={isSeen}
                      isCancelled={isCancelled}
                      isClientCancelled={isClientCancelled}
                      canDrag={!isCancelled}
                      activeAppointment={activeAppointment}
                      dragged={dragged}
                      hoverY={hoverY}
                      longPressTriggered={longPressTriggered}
                      pressTimer={pressTimer}
                      setLongPressTriggered={setLongPressTriggered}
                      setAppointmentMenu={setAppointmentMenu}
                      setPressTimer={setPressTimer}
                      setHoverPosition={setHoverPosition}
                      setActiveAppointment={setActiveAppointment}
                      handleDragStart={(e, a) =>
                        handleAppointmentDragStart(e, a, {
                          setHoverY,
                          setHoverDayIndex,
                          setDragged,
                        })
                      }
                      setDragged={setDragged}
                      handleDrop={handleDrop}
                      day={weekDays[dayIndex]}
                      weekDays={weekDays}
                      snap={snap}
                      PX_PER_MINUTE={PX_PER_MINUTE}
                      setHoverY={setHoverY}
                      setHoverDayIndex={setHoverDayIndex}
                      setPreview={setPreview}
                      handleAddNote={handleAddNote}
                      deleteAppointment={deleteAppointment}
                      reloadAppointments={reloadAppointments}
                      token={token}
                      t={t}
                      lang={lang}
                      acquireCalendarEventLock={acquireCalendarEventLock}
                      releaseCalendarEventLock={releaseCalendarEventLock}
                    />

                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* CLIENT CONTEXT MENU */}
      <ClientContextMenu
        clientMenu={clientMenu}
        setClientMenu={setClientMenu}
        API_URL={API_URL}
        token={token}
        getClients={getClients}
        setClients={setClients}
        appointments={appointments}
        t={t}
        lang={lang}
      />

      <AppointmentPreview
        activeAppointment={activeAppointment}
        hoverPosition={hoverPosition}
      />

      {/* APPOINTMENT MENU */}
      <AppointmentContextMenu
        appointmentMenu={appointmentMenu}
        setAppointmentMenu={setAppointmentMenu}
        t={t}
        lang={lang}
        token={token}
        deleteAppointment={deleteAppointment}
        reloadAppointments={reloadAppointments}
        handleAddNote={handleAddNote}
        setMoveMode={setMoveMode}
      />

      {showAddClient && (
        <AddClientModal
          clientForm={clientForm}
          setClientForm={setClientForm}
          onSave={handleAddClient}
          onCancel={() => setShowAddClient(false)}
        />
      )}

      {showRecurring && (
        <Modal
          onClose={() => {
            setShowRecurring(false);
            setSelectedClient(null); // 🔥 зануляване
          }}
        >
          <RecurringForm
            onClose={() => {
              setShowRecurring(false);
              setSelectedClient(null); // 🔥 зануляване
            }}
            selectedClient={selectedClient}
            selectedLocationId={selectedLocationId}
            selectedServiceId={selectedServiceId}
            duration={duration}
            WORK_START={WORK_START}
            WORK_END={WORK_END}
            WORK_END_MINUTE={WORK_END_MINUTE}
          />
        </Modal>
      )}

      <NoteModal
        open={noteModalOpen}
        appointment={noteAppointment}
        onClose={() => setNoteModalOpen(false)}

        onSave={async (text) => {
          await updateAppointment(token, noteAppointment.id, {
            notes: text,
          });

          await reloadAppointments();

          setNoteModalOpen(false);
        }}

      />

      {qrClient && (
        <div style={overlayStyle}>
          <div style={modalStyle}>

            <button
              onClick={() => setQrClient(null)}
              style={{ float: "right" }}
            >
              ✖
            </button>

            <ClientQR token={qrClient.clientAccessToken} />

          </div>
        </div>
      )}

    </>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  minWidth: 300,
};

export default App;

// ===== VERSION ..... END =====