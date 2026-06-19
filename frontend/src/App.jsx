import { useState, useEffect, useMemo, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import NotePage from "./NotePage";
import Modal from "./components/Modal";
import ClientAccess from "./ClientAccess";
import ClientQR from "./components/ClientQR";

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
import { useNavigate } from "react-router-dom";

import RecurringForm from "./components/RecurringForm";
console.log("RecurringForm:", RecurringForm);

// console.log("API_URL:", API_URL);

// const SLOT = 30;
// const PX_PER_MINUTE = 1;
// const DAY_START = WORK_START  * 60;

const WORK_START = 7;
const WORK_END = 20;
const WORK_END_MINUTE = 30;
const SLOT = 30;
const PX_PER_MINUTE = 1;
const DAY_START = WORK_START * 60;
const DAY_END = WORK_END * 60 + WORK_END_MINUTE;

const user = JSON.parse(localStorage.getItem("user"));
const userRole = user?.role;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ===== HELPERS =====
const getBlockColor = (type) => {
  if (type === "green") return "#c8e6c9";
  if (type === "yellow") return "#fff3cd";
  if (type === "red") return "#ffcdd2";
  return "#eee";
};

// 🔴 CRITICAL: cancel = status cancelled (no delete)

// ===== COLORS =====
const COLORS = [
  "#E3F2FD",
  "#E8F5E9",
  "#FFF3E0",
  "#F3E5F5",
  "#E0F7FA",
  "#FCE4EC",
]

const getClientColor = (clientId) => {
  return COLORS[(Number(clientId) || 0) % COLORS.length];
};

const darkenColor = (hex, amount = 0.2) => {
  const num = parseInt(hex.replace("#", ""), 16);

  let r = (num >> 16) - 255 * amount;
  let g = ((num >> 8) & 0x00ff) - 255 * amount;
  let b = (num & 0x0000ff) - 255 * amount;

  r = Math.max(0, Math.min(255, Math.round(r)));
  g = Math.max(0, Math.min(255, Math.round(g)));
  b = Math.max(0, Math.min(255, Math.round(b)));

  return `rgb(${r}, ${g}, ${b})`;
};

const toMinutes = (date) => {
  const d = new Date(date);
  return d.getHours() * 60 + d.getMinutes();
};

const snap = (min) => Math.floor(min / SLOT) * SLOT;
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// const isPastDateTime = (day, minutes) => {
//   const d = new Date(day);
//   d.setHours(0, 0, 0, 0);
//   d.setMinutes(minutes);
//   return d < new Date();
// };

const isPastDateTime = (day, minutes) => {
  const now = new Date();

  const slot = new Date(day);

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  slot.setHours(hours, mins, 0, 0);

  return slot < now;
};

const isOverlapping = (a, b) => {
  return a.start < b.end && b.start < a.end;
};

// ===== LAYOUT ENGINE =====
// function layoutEvents(events) {
//   const sorted = [...events].sort((a, b) => a.start - b.start);

//   const columns = [];

//   sorted.forEach((event) => {
//     let placed = false;

//     for (let i = 0; i < columns.length; i++) {
//       const last = columns[i][columns[i].length - 1];

//       if (!isOverlapping(last, event)) {
//         columns[i].push(event);
//         event._column = i;
//         placed = true;
//         break;
//       }
//     }

//     if (!placed) {
//       event._column = columns.length;
//       columns.push([event]);
//     }
//   });

//   const totalColumns = columns.length;

//   return sorted.map((e) => ({
//     ...e,
//     column: e._column,
//     totalColumns,
//   }));
// }

function layoutEvents(events) {
  const sorted = [...events].sort((a, b) => a.start - b.start);

  const groups = [];

  // 🔵 1. групиране по overlap
  sorted.forEach((event) => {
    let placed = false;

    for (const group of groups) {
      const overlaps = group.some((e) => {
        return event.start < e.end && event.end > e.start;
      });

      if (overlaps) {
        group.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) {
      groups.push([event]);
    }
  });

  // 🔵 2. layout вътре във всяка група
  const result = [];

  let globalColumnOffset = 0;

  groups.forEach((group) => {
    const columns = [];

    group.forEach((event) => {
      let placed = false;

      for (let i = 0; i < columns.length; i++) {
        const last = columns[i][columns[i].length - 1];

        if (!(event.start < last.end && event.end > last.start)) {
          columns[i].push(event);
          event._column = i;
          placed = true;
          break;
        }
      }

      if (!placed) {
        event._column = columns.length;
        columns.push([event]);
      }
    });

    const totalColumns = columns.length;

    group.forEach((e) => {
      result.push({
        ...e,
        column: e._column, // 🔥 FIX
        totalColumns,
      });
    });

    // globalColumnOffset += totalColumns; // 🔥 FIX
  });

  return result;
}

function App() {
  //----------------------------------------------
  const [qrClient, setQrClient] = useState(null);
  const path = window.location.pathname;

  if (path.startsWith("/client-access/")) {
    return <ClientAccess />;
  }

  const [showRecurring, setShowRecurring] = useState(false);

  console.log("showRecurring:", showRecurring);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW REGISTERED', reg))
        .catch(err => console.log('SW ERROR', err));
    }
  }, []);

  async function subscribePush() {
    if (!selectedClient) {
      console.log("NO CLIENT → SKIP SUBSCRIBE");
      return;
    }

    console.log("STEP 1");

    const reg = await navigator.serviceWorker.ready;
    console.log("STEP 2 - SW READY", reg);

    const permission = await Notification.requestPermission();
    console.log("STEP 3 - PERMISSION:", permission);

    if (permission !== 'granted') return;

    const vapidKey = 'BIG1WJJIFMKKgf4IgGTdAlkQyEdYKriGLbWZC25MELTduDwnuq8POrgtZ2vCSIyLjLhdWhn3RKzOPdX3T6xoWyY';
    const convertedKey = urlBase64ToUint8Array(vapidKey);

    console.log("STEP 4 - BEFORE SUBSCRIBE");

    // let sub;
    // try {
    //   sub = await reg.pushManager.subscribe({
    //     userVisibleOnly: true,
    //     applicationServerKey: convertedKey,
    //   });
    // } catch (e) {
    //   console.log("SUBSCRIBE ERROR:", e);
    //   return;
    // }

    // console.log("STEP 5 - SUB:", sub);

    // const subData = sub.toJSON();

    const existing = await reg.pushManager.getSubscription();

    if (existing) {
      console.log("UNSUBSCRIBING OLD");
      await existing.unsubscribe();
    }

    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
      } catch (e) {
        console.log("SUBSCRIBE ERROR:", e);
        return;
      }
    }

    const subData = sub?.toJSON();

    if (!subData || !subData.keys) {
      console.log("INVALID SUB DATA", subData);
      return;
    }

    const res = await fetch(`${API_URL}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subData.endpoint,
        p256dh: subData.keys.p256dh,
        auth: subData.keys.auth,
        clientId: selectedClient.id,
      }),
    });

    console.log("STEP 6 - RESPONSE:", res.status);
    console.log("CLIENT AT SUBSCRIBE:", selectedClient);
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
  }
  //---------------------------------------------

  // console.log("APP RENDER");
  const [moveMode, setMoveMode] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const handleAddNote = (appointment) => {
    setAppointmentMenu(null); // затваря менюто
    navigate(`/appointments/${appointment.id}/notes`);
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

  // console.log("TOKEN:", token);
  // console.log("VERIFY:", verifyEmail);
  // console.log("VERIFY:", localStorage.getItem("verifyEmail"));
  // const verifyEmail = localStorage.getItem("verifyEmail");
  const [mode, setMode] = useState("login");

  useEffect(() => {
    function urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
    }

    localStorage.setItem("mode", mode);
  }, [mode]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //const [token, setToken] = useState("");
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const [user, setUser] = useState(null);
  const [therapist, setTherapist] = useState(null);

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

  const [duration, setDuration] = useState(60);
  const [blocks, setBlocks] = useState([]);
  const blocksRef = useRef(blocks);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    const savedTherapist = localStorage.getItem("therapist");
    if (savedTherapist) {
      setTherapist(JSON.parse(savedTherapist));
    }
  }, []);

  const isBlocked = (day, startMin, endMin) => {
    const dDay = new Date(day).setHours(0, 0, 0, 0);

    return blocksRef.current.some((b) => {
      if (b.day !== dDay) return false;

      const bStart = Number(b.start);
      const bEnd = Number(b.end);

      return startMin < bEnd && bStart < endMin;
    });
  };

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

  const [activeBlockMode, setActiveBlockMode] = useState(null); // "green" | "yellow" | "red" | "erase"
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);

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

  const unreadCount = messages.filter(m => !m.readAt).length;

  useEffect(() => {
    if (!token) return;

    getMessages(token).then(data => {
      console.log("MESSAGES FROM API:", data);
      setMessages(data);
    });
  }, [token]);

  useEffect(() => {
    if (!token) return;

    // getMessages(token).then(setMessages);
    getMessages(token).then(data => {
      console.log("MESSAGES:", data);
      setMessages(data);
    });
  }, [token]);

  useEffect(() => {
    console.log("EFFECT TRIGGER:", selectedClient);
    if (selectedClient?.id) {
      console.log("AUTO SUBSCRIBE WITH CLIENT:", selectedClient.id);
      subscribePush();
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

      console.log("CLIENTS:", data);

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
    try {
      const saved = localStorage.getItem("blocks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBlocks(parsed);
        }
      }
    } catch (e) {
    }
  }, []);

  useEffect(() => {
    if (blocks.length === 0) return;
    localStorage.setItem("blocks", JSON.stringify(blocks));
  }, [blocks]);

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

        // .map((a) => ({
        //   ...a,
        //   start: toMinutes(a.startTime),
        //   end: toMinutes(a.endTime),
        // }));
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
        minutesFromTop = clamp(minutesFromTop, 0, 12 * 60);

        const absoluteMinutes = DAY_START + minutesFromTop;

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
      minutesFromTop = clamp(minutesFromTop, 0, 12 * 60);

      const absoluteMinutes = DAY_START + minutesFromTop;

      if (isPastDateTime(day, absoluteMinutes)) {
        setCreating(false);
        return;
      }

      if (isBlocked(day, absoluteMinutes, absoluteMinutes + duration)) {
        setCreating(false);
        return;
      }

      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      start.setMinutes(absoluteMinutes);

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + duration);

      // 🔥 ДОБАВЯМЕ DEBUG (много важно)
      console.log("CREATE CLICK", start.toISOString());

      await createAppointment(token, {
        clientId: selectedClient,
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
  const handleDragStart = (e, a) => {
    setHoverY(null);
    setHoverDayIndex(null);
    setDragged(a);
    e.dataTransfer.setData("text/plain", "dragging"); // 🔥 критично
  };

  const handleDrop = async (day, yPosition) => {
    setHoverY(null);
    setHoverDayIndex(null);
    if (!dragged) return;

    let minutesFromTop = snap(yPosition / PX_PER_MINUTE);
    minutesFromTop = clamp(minutesFromTop, 0, 12 * 60);

    const absoluteMinutes = DAY_START + minutesFromTop;

    if (isPastDateTime(day, absoluteMinutes)) return;

    const durationMs =
      new Date(dragged.endTime) - new Date(dragged.startTime);

    const durationMinutes = durationMs / 60000;

    // ✅ BLOCK CHECK (преди всичко)
    if (isBlocked(day, absoluteMinutes, absoluteMinutes + durationMinutes)) {
      // 🔥 RESET ВСИЧКО
      setDragged(null);
      setPreview(null);
      setHoverY(null);
      setHoverDayIndex(null);

      return;
    }

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
    if (mode === "register") return <RegisterApp />;
    if (mode === "reset") return <ResetPassword />;

    return (
      <div style={{ padding: 40 }}>
        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button onClick={handleLogin}>Login</button>

        <br /><br />

        <button onClick={handleForgotPassword}>
          Forgot password?
        </button>

        <br /><br />

        <button onClick={() => setMode("register")}>
          Register
        </button>
      </div>
    );
  }

  // if (location.pathname.includes("/notes")) {
  //   return (
  //     <Routes>
  //       <Route path="/appointments/:id/notes" element={<NotePage />} />
  //     </Routes>
  //   );
  // }
  <Routes>
    <Route path="/appointments/:id/notes" element={<NotePage />} />
    <Route path="/client-access/:id" element={<ClientAccess />} />
  </Routes>

  console.log("CLIENTS:", clients);

  return (
    <>
      <div
        style={{ padding: 20 }}
        onMouseDown={() => {
          setActiveAppointment(null);
        }}
      >

        <h2>TherapistDesk</h2>

        <div>
          Добре дошъл, {therapist?.firstName} {therapist?.lastName}
        </div>

        {/* <div>
          <h3>Съобщения</h3>
          <div>Нови съобщения: {unreadCount}</div>

          {messages.map(m => (
            <div
              key={m.id}
              onClick={() => {
                console.log("CLICK", m.id);
                markAsRead(m.id);
              }}
              style={{
                marginBottom: '10px',
                cursor: 'pointer',
                background: m.readAt ? '#eee' : '#cce5ff',
                padding: '8px',
              }}
            >
              <div><b>{m.clientId}</b></div>
              <div>{m.content}</div>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>
                {new Date(m.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div> */}

        {/* <div>Appointments count: {appointments.length}</div> */}

        {moveMode && (
          <div
            style={{
              background: "#fff3cd",
              padding: 8,
              marginBottom: 10,
              border: "1px solid #ffeeba",
            }}
          >
            Moving: {moveMode.client?.name}
          </div>
        )}

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }}
        >
          Logout
        </button>

        {/* <button onClick={subscribePush}>
          Enable Notifications
        </button> */}

        {selectedClient && (
          <div
            style={{
              background: "#e3f2fd",
              padding: 10,
              marginBottom: 10,
              border: "1px solid #90caf9",
            }}
          >
            Adding appointment for:{" "}
            {clients.find((c) => c.id === selectedClient)?.name}
          </div>
        )}

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


        {/* <div style={{ color: "red" }}>
          DEBUG SAME PLACE: {clients.length}
        </div> */}

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
              console.log("CLIENT ROW", c);
              // if (!c.client) return null;
              if (!c) return null;

              return (
                <div
                  // key={c.client.id}
                  key={c.id}
                  ref={(el) => (clientRefs.current[c.id] = el)}
                  onClick={() => {
                    // setSelectedClient(c.client);
                    setSelectedClient(c);
                    setActiveBlockMode(null);
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

                      const confirmDelete = window.confirm(
                        t("confirmDeleteClient", lang)
                      );
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
                      console.log("CLICK", c);
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
          <label>{t("duration", lang)}: </label>

          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            <option value={30}>30 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
            <option value={120}>120 min</option>
          </select>

          {/* BUTTONS */}

          {[
            { type: "green", color: "#4caf50", label: t("blockVacation", lang) },
            { type: "yellow", color: "#ffc107", label: t("blockBusy", lang) },
            { type: "red", color: "#f44336", label: t("blockPersonal", lang) },
            { type: "erase", color: "#9e9e9e", label: t("blockErase", lang) },
          ].map((b) => {
            const active = activeBlockMode === b.type && !selectedClient;
            const disabled = !!selectedClient;

            return (
              <div
                key={b.type}
                onClick={() => {
                  setSelectedClient(null); // 🔥 изключваме клиента

                  setActiveBlockMode((prev) =>
                    prev === b.type ? null : b.type
                  );
                }}
                style={{
                  minWidth: 90,
                  height: 36,
                  padding: "0 10px",
                  background: b.color,
                  borderRadius: 8,
                  cursor: disabled ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  color: b.type === "yellow" ? "#333" : "white",
                  userSelect: "none",

                  // 🔥 RELIEF EFFECT
                  boxShadow: disabled
                    ? "0 2px 4px rgba(0,0,0,0.1)"
                    : active
                      ? "inset 0 4px 8px rgba(0,0,0,0.4)"
                      : "0 4px 0 rgba(0,0,0,0.25), 0 6px 12px rgba(0,0,0,0.2)",

                  transform: disabled
                    ? "translateY(0)"
                    : active
                      ? "translateY(2px)"
                      : "translateY(0)",

                  transition: "all 0.1s ease",
                }}
              >
                {b.label}
              </div>
            );
          })}

        </div>

        <hr />

        <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
          {/* МЕСЕЦ */}
          <button onClick={() => {
            setCurrentDate(d => {
              const newDate = new Date(d);
              newDate.setMonth(newDate.getMonth() - 1);
              return newDate;
            });
          }}>
            ⏪ Month
          </button>

          <button onClick={() => {
            setCurrentDate(d => {
              const newDate = new Date(d);
              newDate.setMonth(newDate.getMonth() + 1);
              return newDate;
            });
          }}>
            Month ⏩
          </button>

          {/* СЕДМИЦА */}
          <button onClick={() => {
            setCurrentDate(d => {
              const newDate = new Date(d);
              newDate.setDate(newDate.getDate() - 7);
              return newDate;
            });
          }}>
            ← Week
          </button>

          <button onClick={() => {
            setCurrentDate(d => {
              const newDate = new Date(d);
              newDate.setDate(newDate.getDate() + 7);
              return newDate;
            });
          }}>
            Week →
          </button>

          <button onClick={() => setCurrentDate(new Date())}>
            Today
          </button>

          <button
            onClick={() => {
              if (!selectedClient) {
                alert("Select client first");
                return;
              }
              setShowRecurring(true);
            }}
          >
            Recurring
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;

              setCurrentDate(new Date(value));
            }}
          />

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
              length: ((WORK_END * 60 + WORK_END_MINUTE) - WORK_START * 60) / SLOT
            }).map((_, i) => {
              const totalMin = WORK_START * 60 + i * SLOT;
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
                //  position: "static",
                borderLeft: "1px solid #ccc",
                height: ((WORK_END * 60 + WORK_END_MINUTE) - WORK_START * 60),
                overflow: "hidden",
                // background: "rgba(255,0,0,0.1)",
                pointerEvents: "auto",
                width: "100%",
                backgroundImage: "repeating-linear-gradient(to bottom, #eee 0px, #eee 1px, transparent 1px, transparent 30px)",
              }}

              onMouseDown={(e) => {
                if (!activeBlockMode) return;

                e.stopPropagation();

                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;

                setSelectionStart({
                  dayIndex,
                  y,
                });
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

                if (selectionStart) {
                  setSelectionEnd({
                    dayIndex,
                    y,
                  });
                }
              }}

              onMouseUp={() => {
                if (!selectionStart || !selectionEnd) return;

                const startY = Math.min(selectionStart.y, selectionEnd.y);
                const endY = Math.max(selectionStart.y, selectionEnd.y);

                const startMin = DAY_START + snap(startY / PX_PER_MINUTE);
                const endMin = DAY_START + snap(endY / PX_PER_MINUTE);

                const day = weekDays[selectionStart.dayIndex];

                if (activeBlockMode === "erase") {
                  setBlocks((prev) =>
                    prev.filter(
                      (b) =>
                        !(
                          b.day === new Date(day).setHours(0, 0, 0, 0) &&
                          startMin < b.end &&
                          b.start < endMin
                        )
                    )
                  );
                } else {

                  setBlocks((prev) => [
                    ...prev,
                    {
                      day: new Date(day).setHours(0, 0, 0, 0),
                      start: startMin,
                      end: endMin,
                      type: activeBlockMode,
                    },
                  ]);
                }

                setSelectionStart(null);
                setSelectionEnd(null);
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
                setSelectionStart(null);
                setSelectionEnd(null);
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

              {/* GRID + PAST */}
              {Array.from({ length: (DAY_END - DAY_START) / SLOT + 1 }).map((_, i) => {
                const minutes = DAY_START + i * SLOT;

                const day = weekDays[dayIndex];            // 👈 важно
                const isPast = isPastDateTime(day, minutes); // 👈 връщаме логиката

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
                      background: isPast ? "#f5f5f5" : "transparent", // 👈 това рисува сивото
                      pointerEvents: "none"
                    }}
                  />
                );
              })}

              {blocks
                .filter(
                  (b) =>
                    b.day === new Date(weekDays[dayIndex]).setHours(0, 0, 0, 0)
                )
                .map((b, i) => {
                  const start = Number(b.start);
                  const end = Number(b.end);

                  const top = (start - DAY_START) * PX_PER_MINUTE;
                  const height = (end - start) * PX_PER_MINUTE;
                  console.log("TOP blocks:", top);
                  console.log("HEIGHT blocks:", height);

                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        top,
                        height,
                        left: 2,
                        right: 2,
                        background: getBlockColor(b.type),
                        opacity: 0.6,
                        borderRadius: 4,
                        pointerEvents: "none",
                        zIndex: 1,  // проблем 3
                      }}
                    />
                  );
                })}

              {selectionStart && selectionEnd && selectionStart.dayIndex === dayIndex && (
                (() => {
                  const startY = Math.min(selectionStart.y, selectionEnd.y);
                  const endY = Math.max(selectionStart.y, selectionEnd.y);

                  return (
                    <div
                      style={{
                        position: "absolute",
                        // top: snap(startY),
                        top: hoverY + 1,
                        height: snap(endY) - snap(startY),
                        left: 2,
                        right: 2,
                        background:
                          activeBlockMode === "green"
                            ? "#4caf50"
                            : activeBlockMode === "yellow"
                              ? "#ffc107"
                              : activeBlockMode === "red"
                                ? "#f44336"
                                : "#9e9e9e",
                        opacity: 0.3,
                        border: "2px dashed #333",
                        borderRadius: 4,
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    />
                  );
                })()
              )}

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
                // .filter(a => {
                //   if (userRole === "therapist") return true;
                //   return a.status !== "cancelled";
                // })
                .map((a) => {

                  if (a.status === "cancelled") {
                    console.log("CANCELLED FOUND IN RENDER", a.id);
                  }
                  console.log("EVENT IN UI:", a);
                  // console.log("RENDER EVENT", a.id);        

                  const color = getClientColor(a.client?.id || 0);
                  const borderColor = darkenColor(color, 0.25);
                  // ---
                  // const top = (a.start - DAY_START) * PX_PER_MINUTE;
                  const start = new Date(a.startTime);

                  const minutes =
                    start.getHours() * 60 + start.getMinutes() - DAY_START;
                  const top = Math.max(0, minutes * PX_PER_MINUTE);
                  console.log("TOP:", top);
                  // const top = minutes * PX_PER_MINUTE;
                  // ---
                  // const height = (a.end - a.start) * PX_PER_MINUTE;

                  const end = new Date(a.endTime);

                  const durationMinutes =
                    (end.getTime() - start.getTime()) / 1000 / 60;

                  const height = durationMinutes * PX_PER_MINUTE;
                  console.log("HEIGHT:", height);

                  // const width = 100 / a.totalColumns;
                  // const left = a.column * width;

                  const totalColumns = a.totalColumns || 1;
                  const column = a.column || 0;

                  console.log("COLUMNS:", a.totalColumns, a.column);

                  const width = 100 / totalColumns;
                  const left = column * width;

                  // const isRead = a.messages?.some(m => m.readAt);
                  // const isRead = !!a.seenAt;
                  const isSeen = !!a.seenAt;
                  const isCancelled = a.status === "cancelled";
                  const isConfirmed = a.status === "confirmed";

                  return (
                    <div
                      key={a.id}
                      className="event-card"
                      draggable
                      // title={a.cancelReason || ""}
                      onClick={(e) => {
                        e.stopPropagation(); // 🔥 ТОЧНО ТОВА
                      }}

                      onMouseMove={(e) => {
                        clearTimeout(pressTimer); // 🔥 КЛЮЧОВО
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        if (dragged) return;
                        // e.stopPropagation();
                        setLongPressTriggered(false);
                        if (dragged && hoverY !== null) return;
                        const timer = setTimeout(() => {
                          setLongPressTriggered(true);

                          setAppointmentMenu({
                            x: e.clientX,
                            y: e.clientY,
                            appointment: a,
                          });
                        }, 600);

                        setPressTimer(timer);
                      }}

                      onTouchStart={(e) => {
                        setLongPressTriggered(false);

                        const touch = e.touches[0];

                        const timer = setTimeout(() => {
                          setLongPressTriggered(true);

                          setAppointmentMenu({
                            x: touch.clientX,
                            y: touch.clientY,
                            appointment: a,
                          });
                        }, 500);

                        setPressTimer(timer);
                      }}

                      onMouseEnter={(e) => {
                        if (dragged) return;

                        const rect = e.currentTarget.getBoundingClientRect();

                        setHoverPosition({
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });

                        setActiveAppointment(a);
                      }}

                      onMouseUp={() => {
                        clearTimeout(pressTimer);
                      }}

                      onTouchEnd={() => {
                        clearTimeout(pressTimer);
                      }}

                      onMouseLeave={() => {
                        clearTimeout(pressTimer);
                      }}

                      // onClick={(e) => {
                      //   // тук
                      //   e.stopPropagation();

                      //   if (longPressTriggered) {
                      //     setLongPressTriggered(false);
                      //     return;
                      //   }

                      //   setActiveAppointment(a);

                      //   setAppointmentMenu({
                      //     x: e.clientX,
                      //     y: e.clientY,
                      //     appointment: a,
                      //   });
                      // }}

                      onClick={(e) => {
                        e.stopPropagation();

                        // 🔥 ако е long press → НЕ правим click логика
                        if (longPressTriggered) {
                          setLongPressTriggered(false);
                          return;
                        }

                        // 🔥 ЗАТВАРЯМЕ менюто ако е отворено
                        setAppointmentMenu(null);

                        setActiveAppointment(a);
                      }}
                      // ----------------------------

                      onTouchEnd={(e) => {
                        clearTimeout(pressTimer);

                        // 🔥 ако е било long press → спираме всичко
                        if (longPressTriggered) {
                          setLongPressTriggered(false);
                          return;
                        }

                        // 🔥 малко delay, за да не се засече с long press
                        setTimeout(() => {
                          setAppointmentMenu(null);
                          setActiveAppointment(a);
                        }, 50);
                      }}

                      onDragStart={(e) => handleDragStart(e, a)}

                      // onMouseEnter={(e) => {
                      //   const rect = e.currentTarget.getBoundingClientRect();

                      //   setHoverPosition({
                      //     x: rect.left + rect.width / 2,
                      //     y: rect.top,
                      //   });

                      //   setActiveAppointment(a);
                      // }}

                      onMouseLeave={() => {
                        if (dragged) return;
                        setActiveAppointment(null);
                      }}

                      onContextMenu={(e) => {
                        e.preventDefault();

                        const confirmDelete = window.confirm(t("deleteAppointment", lang));
                        if (!confirmDelete) return;

                        deleteAppointment(token, a.id).then(() => {
                          reloadAppointments();
                        });
                      }}

                      style={{
                        position: "absolute",
                        top: top + 2,
                        height: height - 4,
                        // left: `${left + 6}%`,
                        // width: `${width - 12}%`,

                        left: `${left}%`,
                        width: `${width}%`,
                        // left: 4,
                        // right: 4,

                        opacity: isCancelled ? 0.5 : 1,
                        textDecoration: isCancelled ? "line-through" : "none",
                        boxSizing: "border-box",
                        background: "#fff",
                        borderLeft: `4px solid ${borderColor}`,
                        borderRadius: 6,
                        padding: "4px 4px 4px 6px",
                        fontSize: 12,
                        overflow: "hidden",
                        cursor: dragged ? "grabbing" : "grab",
                        transition: "all 0.15s ease",
                        // pointerEvents: "none",
                        opacity: isCancelled ? 0.5 : 1,
                        textDecoration: isCancelled ? "line-through" : "none",

                        transform:
                          activeAppointment?.id === a.id ? "scale(1.02)" : "scale(1)",

                        zIndex:
                          activeAppointment?.id === a.id ? 20 : 10,

                        boxShadow:
                          activeAppointment?.id === a.id
                            ? "0 6px 16px rgba(0,0,0,0.15)"
                            : "0 2px 6px rgba(0,0,0,0.08)",
                      }}
                    >

                      <div style={{ pointerEvents: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {a.client?.name}
                            {isCancelled && (
                              <div style={{ fontSize: 10, color: "red" }}>
                                cancelled
                                {a.cancelReason && ` • ${a.cancelReason}`}
                              </div>
                            )}
                          </div>

                          <div>
                            {/* {isRead ? "✔" : "🔔"} */}
                            {!isSeen && "🔔"}
                            {isSeen && !isConfirmed && "👁"}
                            {isConfirmed && "✔"}
                          </div>

                          {a.notes && (
                            <span
                              style={{
                                fontSize: 11,
                                opacity: 0.6,
                                cursor: "pointer",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/appointments/${a.id}/notes`);
                              }}
                            >
                              📝
                            </span>
                          )}

                        </div>
                      </div>

                      <div style={{ fontSize: 11, color: "#555" }}>
                        {start.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" – "}
                        {end.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}

                        {" • "}
                        {Math.round((end - start) / 1000 / 60)}m
                      </div>

                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>


      {/* CLIENT CONTEXT MENU */}
      {clientMenu && (
        <div
          style={{
            position: "fixed",
            top: clientMenu.y,
            left: clientMenu.x,
            background: "white",
            border: "1px solid #ccc",
            padding: 10,
            zIndex: 9999,
          }}
          onMouseLeave={() => setClientMenu(null)}
        >

          {/* ✅ НОВ БУТОН */}
          <div
            style={{ cursor: "pointer", marginBottom: 5 }}
            onClick={async () => {
              const clientId = clientMenu.client.id;

              const newAlias = prompt(
                "Въведи код за клиента:",
                clientMenu.client.alias || ""
              );

              if (newAlias === null) return;

              await fetch(`${API_URL}/clients/${clientId}/alias`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ alias: newAlias }),
              });

              const updated = await getClients(token);
              setClients(updated);

              setClientMenu(null);
            }}
          >
            ✏️ Код
          </div>

          {/* ❌ DELETE */}
          <div
            style={{ cursor: "pointer", color: "red" }}
            onClick={async () => {
              const clientId = clientMenu.client.id;

              // 1. confirm
              // const confirmDelete = window.confirm("Сигурен ли си, че искаш да изтриеш този клиент?");
              const confirmDelete = window.confirm(t("confirmDeleteClient", lang));
              if (!confirmDelete) return;

              // 2. проверка за срещи
              const hasAppointments = appointments.some(
                // (a) => a.client?.id === clientId
                (a) => a.client?.id === c.id && a.status !== "cancelled"
              );

              if (hasAppointments) {
                // alert("Този клиент има срещи. Първо ги изтрий ръчно.");
                alert(t("clientHasAppointments", lang));
                setClientMenu(null);
                return;
              }

              // 3. изтриване
              await fetch(`${API_URL}/clients/${clientId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              // console.log("DELETE STATUS:", res.status);

              const data = await res.json().catch(() => null);

              // console.log("DELETE RESPONSE:", data);

              if (!res.ok) {
                alert(data?.message || "Delete failed");
                return;
              }

              getClients(token).then((data) => {
                if (Array.isArray(data)) {
                  //  setClients(data);
                } else {
                  console.error("Invalid clients response:", data);
                  //  setClients([]);
                }
              });
              setClientMenu(null);
            }}
          >
            Delete
          </div>
        </div>
      )}

      {activeAppointment && (
        <div
          style={{
            position: "fixed",
            top: hoverPosition.y - 10,
            left: hoverPosition.x,
            transform: "translate(-50%, -100%)",
            width: 220,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 12,
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 5 }}>
            {activeAppointment.client?.name}
          </div>

          <div style={{ fontSize: 12 }}>
            {Math.floor(activeAppointment.start / 60)
              .toString()
              .padStart(2, "0")}
            :
            {(activeAppointment.start % 60).toString().padStart(2, "0")}
            {" – "}
            {Math.floor(activeAppointment.end / 60)
              .toString()
              .padStart(2, "0")}
            :
            {(activeAppointment.end % 60).toString().padStart(2, "0")}

            {" • "}
            {Math.round(activeAppointment.end - activeAppointment.start)}m
          </div>

          {activeAppointment.notes && (
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "#333",
                borderTop: "1px solid #eee",
                paddingTop: 5,
              }}
            >
              📝 {activeAppointment.notes}
            </div>
          )}

        </div>
      )}

      {/* APPOINTMENT MENU */}
      {appointmentMenu && (
        <>
          {/* 🔥 BACKDROP */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
            }}
            onClick={() => setAppointmentMenu(null)}
            // onTouchStart={() => setAppointmentMenu(null)}
            onTouchStart={(e) => {
              e.stopPropagation();
              setAppointmentMenu(null);
            }}
          />

          {/* 🔥 MENU */}
          <div
            style={{
              position: "fixed",
              top: appointmentMenu.y,
              left: appointmentMenu.x,
              background: "white",
              border: "1px solid #ccc",
              padding: 10,
              zIndex: 9999,
            }}
          >

            {/* STATUS + REASON */}
            {appointmentMenu.appointment.status === "cancelled" && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: "red", fontWeight: 600 }}>
                  ❌ Отменена среща
                </div>

                {appointmentMenu.appointment.cancelReason && (
                  <div
                    style={{
                      marginTop: 4,
                      color: "#333",
                      fontSize: 13,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      maxWidth: 220,
                    }}
                  >
                    Причина: {appointmentMenu.appointment.cancelReason}
                  </div>
                )}
              </div>
            )}

            {/* DELETE */}
            <div
              style={{ cursor: "pointer", color: "red" }}
              onClick={async () => {
                const confirmDelete = window.confirm("Delete?");
                if (!confirmDelete) return;

                await deleteAppointment(token, appointmentMenu.appointment.id);

                setAppointmentMenu(null);
                await reloadAppointments();
              }}
            >
              Delete
            </div>

            {/* ADD / EDIT NOTE */}
            <div
              style={{ cursor: "pointer", marginTop: 5 }}
              onClick={() => handleAddNote(appointmentMenu.appointment)}
            >
              {appointmentMenu.appointment.notes ? "Edit note" : "Add note"}
            </div>

            {/* MOVE */}
            <div
              style={{ cursor: "pointer", marginTop: 5 }}
              onClick={() => {
                setMoveMode(appointmentMenu.appointment);
                setAppointmentMenu(null);
              }}
            >
              Move
            </div>

          </div>
        </>
      )}

      {showAddClient && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: 300,
            }}
          >
            <h3>Add Client</h3>

            <input
              placeholder="Name"
              value={clientForm.name}
              onChange={(e) =>
                setClientForm({ ...clientForm, name: e.target.value })
              }
            />

            <br /><br />

            <input
              placeholder="Phone"
              value={clientForm.phone}
              onChange={(e) =>
                setClientForm({ ...clientForm, phone: e.target.value })
              }
            />

            <br /><br />

            <input
              placeholder="Email"
              value={clientForm.email}
              onChange={(e) =>
                setClientForm({ ...clientForm, email: e.target.value })
              }
            />

            <br /><br />

            <input
              placeholder="Country"
              value={clientForm.country}
              onChange={(e) =>
                setClientForm({ ...clientForm, country: e.target.value })
              }
            />

            <br /><br />

            <input
              placeholder="City"
              value={clientForm.city}
              onChange={(e) =>
                setClientForm({ ...clientForm, city: e.target.value })
              }
            />

            <br /><br />

            <textarea
              placeholder="Notes"
              value={clientForm.notes}
              onChange={(e) =>
                setClientForm({ ...clientForm, notes: e.target.value })
              }
            />

            <br /><br />

            <button
              onClick={async () => {
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
              }}
            >
              Save
            </button>

            <button
              onClick={() => setShowAddClient(false)}
              style={{ marginLeft: 10 }}
            >
              Cancel
            </button>
          </div>
        </div>
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
            therapist={{ id: 1 }}
            duration={duration}
            WORK_START={WORK_START}
            WORK_END={WORK_END}
            WORK_END_MINUTE={WORK_END_MINUTE}
          />
        </Modal>
      )}

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