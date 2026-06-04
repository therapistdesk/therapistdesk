import axios from "axios";

const API_URL = "https://therapistdesk.onrender.com";

// ---------------- AUTH ----------------
export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

// ---------------- CLIENTS ----------------
export const getClients = async (token) => {
  if (!token) return [];

  const res = await fetch(`${API_URL}/clients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return [];
  return res.json();
};

export const deleteClient = async (id, token) => {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete client");
  }

  return res.json();
};

// ---------------- APPOINTMENTS ----------------
export const getAppointments = async (token) => {
  if (!token) return [];

  const res = await fetch(`${API_URL}/appointments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return [];
  return res.json();
};

export const createAppointment = async (token, data) => {
  console.log("CREATE APPOINTMENT RAW:", data);

  const payload = {
    ...data,

    // 🔥 FIX: винаги пращаме число
    clientId: data.clientId?.id || data.clientId,

    // 🔥 FIX: гарантирани валидни дати
    startTime: new Date(data.startTime).toISOString(),
    endTime: new Date(data.endTime).toISOString(),
  };

  console.log("CREATE APPOINTMENT FINAL:", payload);

  const res = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const response = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("CREATE ERROR:", response);
    throw new Error(JSON.stringify(response));
  }

  return response;
};

export const updateAppointment = async (token, id, data) => {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...data,
      clientId: data.clientId?.id || data.clientId,
    }),
  });

  const response = await res.json().catch(() => null);

  console.log("UPDATE STATUS:", res.status);
  console.log("UPDATE RESPONSE:", response);

  if (!res.ok) {
    throw new Error(JSON.stringify(response));
  }

  return response;
};

export async function deleteAppointment(token, id) {
  await fetch(`${API_URL}/appointments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default api;