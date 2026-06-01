const fetch = require("node-fetch");

const BASE_URL = "http://localhost:3000";

// =======================
// AUTH
// =======================

async function createTherapist(i) {
  const email = `therapist${i}@therapist${i}.com`;
  const password = "00000001";

  // REGISTER
  await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  // LOGIN
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!data.access_token) {
    console.log("❌ LOGIN FAILED");
    return null;
  }

  return data.access_token;
}

// =======================
// CLIENT
// =======================

async function createClient(token, name) {
  await fetch(`${BASE_URL}/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
}

// =======================
// APPOINTMENT
// =======================

async function createAppointment(token, start, end, clientId) {
  await fetch(`${BASE_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      clientId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    }),
  });
}

// =======================
// MAIN
// =======================

async function run() {
  const THERAPISTS = 5;
  const CLIENTS_PER_THERAPIST = 30;

  const APPOINTMENTS_PER_WEEK = 200;
  const TOTAL_WEEKS = 4;

  for (let i = 1; i <= THERAPISTS; i++) {
    console.log(`\n👨‍⚕️ Therapist ${i}`);

    const token = await createTherapist(i);
    if (!token) continue;

    // =======================
    // CREATE CLIENTS
    // =======================

    for (let j = 1; j <= CLIENTS_PER_THERAPIST; j++) {
      await createClient(token, `Client_${i}_${j}`);
    }

    // =======================
    // FETCH CLIENTS (ЕДИН ПЪТ!)
    // =======================

    const res = await fetch(`${BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const clients = await res.json();

    if (!Array.isArray(clients) || clients.length === 0) {
      console.log("❌ NO CLIENTS");
      continue;
    }

    // =======================
    // GENERATE APPOINTMENTS
    // =======================

    console.log("  → generating appointments");

    for (let week = 0; week < TOTAL_WEEKS; week++) {
      for (let n = 0; n < APPOINTMENTS_PER_WEEK; n++) {
        const client =
          clients[Math.floor(Math.random() * clients.length)];

        if (!client) continue;

        const start = new Date();

        // начало на деня
        start.setHours(0, 0, 0, 0);

        // седмица
        start.setDate(start.getDate() + week * 7);

        // ден (Понеделник–Събота)
        const day = Math.floor(Math.random() * 6);
        start.setDate(start.getDate() + day);

        // час (8–18)
        const hour = 8 + Math.floor(Math.random() * 10);

        // минути
        const minute = Math.random() > 0.5 ? 0 : 30;

        start.setHours(hour, minute, 0, 0);

        const end = new Date(start.getTime() + 60 * 60000);

        await createAppointment(token, start, end, client.id);
      }
    }
  }

  console.log("\n✅ DONE");
}

run();