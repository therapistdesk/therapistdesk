import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function ClientAccess() {
    const [client, setClient] = useState(null);

    // const path = window.location.pathname;
    // // const token = path.split("/client-access/")[1];
    // const token = path.includes("/client-access/")
    //     ? path.split("/client-access/")[1]
    //     : null;

    const getTokenFromUrl = () => {
        const match = window.location.pathname.match(/client-access\/(.+)/);
        return match ? match[1] : null;
    };

    const token = getTokenFromUrl();

    console.log("TOKEN:", token);

    if (!token) {
        console.log("NO TOKEN");
        return;
    }

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const loadClient = async () => {
        const res = await fetch(`${API_URL}/clients/access/${token}`);
        console.log("CALLING:", `${API_URL}/client/access/${token}`);
        if (!res.ok) return;
        const data = await res.json();
        setClient(data);
    };

    const subscribeToPush = async () => {
         console.log("SUBSCRIBE STARTED");
        try {
            const path = window.location.pathname;
            const match = path.match(/client-access\/(.+)/);
            const token = match ? match[1] : null;

            console.log("TOKEN INSIDE FUNCTION:", token);

            if (!token) {
                console.log("NO TOKEN IN FUNCTION");
                return;
            }
            console.log("STEP 0");
            if (!("serviceWorker" in navigator)) {
                console.log("NO SW");
                return;
            }
            console.log("STEP 1");

            const reg = await navigator.serviceWorker.ready;
            console.log("STEP 2");

            const existing = await reg.pushManager.getSubscription();
            console.log("STEP 3", existing);
            // if (existing) return;
            if (existing) {
                await existing.unsubscribe();
            }
            const permission = await Notification.requestPermission();
            console.log("STEP 4", permission);
            if (permission !== "granted") return;

            const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            console.log("STEP 5", vapidKey);

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });

            console.log("STEP 6", sub);

            await fetch(`${API_URL}/push/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    subscription: sub,
                }),
            });

            console.log("SUBSCRIPTION SENT");

        } catch (e) {
            console.log("PUSH ERROR", e);
        }
    };

    // useEffect(() => {
    //     const path = window.location.pathname;
    //     const match = path.match(/client-access\/(.+)/);
    //     const token = match ? match[1] : null;
    //     console.log("TOKEN IN EFFECT:", token);
    //     if (!token) return;
    //     loadClient();
    //     subscribeToPush();
    // }, [token]);

    useEffect(() => {
    console.log("FORCE SUBSCRIBE");
    subscribeToPush();
}, []);

    if (!client) return <div style={{ padding: 20 }}>Loading...</div>;

    const appointments = client.appointments || [];
    const now = new Date();

    const isToday = (date) => {
        const d = new Date(date);
        return d.toDateString() === now.toDateString();
    };

    const isTomorrow = (date) => {
        const d = new Date(date);
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        return d.toDateString() === tomorrow.toDateString();
    };

    const getStart = (a) => new Date(a.startTime);

    const today = appointments.filter((a) => isToday(getStart(a)));
    const tomorrow = appointments.filter((a) => isTomorrow(getStart(a)));
    const upcoming = appointments.filter(
        (a) =>
            getStart(a) > now &&
            !isToday(getStart(a)) &&
            !isTomorrow(getStart(a))
    );
    const past = appointments.filter((a) => getStart(a) < now);

    const renderSection = (title, data) => {
        if (data.length === 0) return null;

        const updateStatus = async (id, status, reason) => {
            const res = await fetch(
                `${API_URL}/appointments/${id}/status/public?token=${token}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status, reason }),
                }
            );

            if (!res.ok) throw new Error();
            await loadClient();
        };

        return (
            <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 10 }}>{title}</h3>

                {[...data]
                    .sort((a, b) => {
                        if (!a.seenAt && b.seenAt) return -1;
                        if (a.seenAt && !b.seenAt) return 1;
                        return new Date(a.startTime) - new Date(b.startTime);
                    })
                    .map((a) => (
                        <div
                            key={a.id}
                            style={{
                                border: "1px solid #e5e7eb",
                                padding: 16,
                                marginBottom: 12,
                                borderRadius: 12,
                                background: "#fff",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                                opacity: a.seenAt ? 0.6 : 1,
                            }}
                        >
                            {!a.seenAt && (
                                <div style={{
                                    fontSize: 12,
                                    color: "#2563eb",
                                    fontWeight: 600,
                                    marginBottom: 6
                                }}>
                                    ● НОВО
                                </div>
                            )}

                            <div style={{ fontSize: 16, fontWeight: 500 }}>
                                Среща с {client.therapistName || "вашия терапевт"}
                            </div>

                            <div style={{ fontSize: 14, color: "#555" }}>
                                {new Date(a.startTime).toLocaleString()}
                            </div>

                            <div style={{
                                fontSize: 12,
                                fontWeight: 500,
                                marginTop: 6,
                                color:
                                    a.status === "confirmed"
                                        ? "#16a34a"
                                        : a.status === "cancelled"
                                            ? "#dc2626"
                                            : "#6b7280"
                            }}>
                                {a.status === "scheduled" && "Насрочена"}
                                {a.status === "confirmed" && "Потвърдена"}
                                {a.status === "cancelled" && "Отменена"}
                            </div>

                            {a.cancelReason && (
                                <div style={{
                                    fontSize: 13,
                                    marginTop: 8,
                                    padding: 8,
                                    background: "#f9fafb",
                                    borderRadius: 8
                                }}>
                                    <strong>Причина:</strong> {a.cancelReason}
                                </div>
                            )}

                            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                                <button
                                    style={{
                                        flex: 1,
                                        padding: "10px 12px",
                                        borderRadius: 8,
                                        border: "none",
                                        background: "#16a34a",
                                        color: "#fff",
                                        fontWeight: 500,
                                        cursor: "pointer"
                                    }}
                                    onClick={async () => {
                                        try {
                                            await updateStatus(a.id, "confirmed");
                                        } catch {
                                            alert("Грешка");
                                        }
                                    }}
                                >
                                    Потвърждавам
                                </button>

                                <button
                                    style={{
                                        flex: 1,
                                        padding: "10px 12px",
                                        borderRadius: 8,
                                        border: "none",
                                        background: "#dc2626",
                                        color: "#fff",
                                        fontWeight: 500,
                                        cursor: "pointer"
                                    }}
                                    onClick={async () => {
                                        const reason = prompt("Причина за отмяна:");
                                        if (reason === null) return;

                                        if (reason.trim() === "") {
                                            alert("Моля, въведете причина");
                                            return;
                                        }

                                        try {
                                            await updateStatus(a.id, "cancelled", reason);
                                        } catch {
                                            alert("Грешка");
                                        }
                                    }}
                                >
                                    Отменям
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        );
    };

    return (
        <div style={{
            padding: 20,
            maxWidth: 500,
            margin: "0 auto",
            background: "#f3f4f6",
            minHeight: "100vh"
        }}>
            <h2 style={{ marginBottom: 20 }}>{client.name}</h2>

            {appointments.length === 0 && <div>Няма срещи</div>}

            {renderSection("Днес", today)}
            {renderSection("Утре", tomorrow)}
            {renderSection("Предстоящи", upcoming)}
            {renderSection("Минали", past)}
        </div>
    );
}