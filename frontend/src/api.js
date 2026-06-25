const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
export const getAppointments = async (token, start, end) => {
  if (!token) return [];

  let url = `${API_URL}/appointments`;

  if (start && end) {
    url += `?start=${start}&end=${end}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return [];
  return res.json();
};

export const createAppointment = async (token, data) => {
  const payload = {
    ...data,
    clientId: data.clientId?.id || data.clientId,
    startTime: new Date(data.startTime).toISOString(),
    endTime: new Date(data.endTime).toISOString(),
  };

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

  if (!res.ok) {
    throw new Error(JSON.stringify(response));
  }

  return response;
};

// export async function deleteAppointment(token, id) {
//   await fetch(`${API_URL}/appointments/${id}`, {
//     method: "DELETE",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// }
export async function deleteAppointment(token, id) {
  await fetch(`${API_URL}/appointments/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: "cancelled",
    }),
  });
}

export const getMessages = async (token) => {
  const res = await fetch(`${API_URL}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return [];
  return res.json();
};

export const markMessageAsRead = async (id, token) => {
  await fetch(`${API_URL}/messages/${id}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};