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
    const [clientInfo, setClientInfo] = useState(null);
    // console.log("CLIENT:", client);

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
        const res = await fetch(`${API_URL}/messages/access/${token}/appointments`);
        console.log("CALLING:", `${API_URL}/messages/access/${token}/appointments`);
        if (!res.ok) return;

        const text = await res.text();
        if (!text) return;

        const data = JSON.parse(text);
        console.log("DATA:", data);
        setClient(data);
    };

    const actionButtonStyle = {
        color: "#fff",
        border: "none",
        borderRadius: 5,
        padding: "6px 12px",
        width: 90,
        textAlign: "center",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        transition: "all 0.1s ease",
    };

    useEffect(() => {
        if (!token) return;

        loadClient();

        const interval = setInterval(() => {
            loadClient();
        }, 30000); // на всеки 30 сек.

        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        if (!token) return;

        const loadClientInfo = async () => {
            const res = await fetch(`${API_URL}/messages/client/${token}`);
            if (!res.ok) return;

            const text = await res.text();
            if (!text) return;

            const data = JSON.parse(text);
            setClientInfo(data);
        };

        loadClientInfo();
    }, [token]);

    const subscribeToPush = async () => {
        // alert("CLIENT subscribeToPush()");
        console.log("CLIENT subscribeToPush()");
        // console.log("SUBSCRIBE STARTED");
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

            let sub = await reg.pushManager.getSubscription();
            console.log("STEP 3", sub);

            const permission = await Notification.requestPermission();
            console.log("STEP 4", permission);

            if (permission !== "granted") return;

            if (!sub) {
                console.log("CREATE NEW SUBSCRIPTION");

                sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey),
                });
            } else {
                console.log("USING EXISTING SUBSCRIPTION");
            }

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

    // const appointments = client.appointments || [];
    // const appointments = client || [];

    const appointmentsRaw = client || [];
    const appointments = Object.values(
        Object.fromEntries(appointmentsRaw.map(a => [a.id, a]))
    );

    const now = new Date();
    // зануляваме секундите за стабилност
    now.setSeconds(0, 0);

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

    // const getStart = (a) => new Date(a.startTime);
    const getStart = (a) => {
        const d = new Date(a.startTime);

        // FIX timezone drift
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    };

    const today = appointments.filter((a) => isToday(getStart(a)));
    const tomorrow = appointments.filter((a) => isTomorrow(getStart(a)));
    const upcoming = appointments.filter(
        (a) =>
            getStart(a) > now &&
            !isToday(getStart(a)) &&
            !isTomorrow(getStart(a))
    );
    // const past = appointments.filter((a) => getStart(a) < now);
    const past = appointments.filter(
        (a) => getStart(a) < now && a.status !== "scheduled"
    );

    // const renderSection = (title, data) => {
    //     if (data.length === 0) return null;

    //     const updateStatus = async (id, status, reason) => {
    //         const res = await fetch(
    //             `${API_URL}/appointments/${id}/status/public?token=${token}`,
    //             {
    //                 method: "PATCH",
    //                 headers: { "Content-Type": "application/json" },
    //                 body: JSON.stringify({ status, reason }),
    //             }
    //         );

    //         // if (!res.ok) throw new Error();
    //         if (!res.ok) {
    //             console.log(await res.text());
    //             throw new Error();
    //         }

    //         await fetch(
    //             `${API_URL}/appointments/${id}/seen?token=${token}`,
    //             {
    //                 method: "PATCH",
    //             }
    //         );

    //         await loadClient();
    //     };
    //     console.log("RAW EVENTS:", data);


    //     return (
    //         <div style={{ marginBottom: 24 }}>
    //             <h3 style={{ marginBottom: 10 }}>{title}</h3>

    //             {[...data]
    //                 .sort((a, b) => {
    //                     if (!a.seenAt && b.seenAt) return -1;
    //                     if (a.seenAt && !b.seenAt) return 1;
    //                     return new Date(a.startTime) - new Date(b.startTime);
    //                 })
    //                 .map((a) => {
    //                     console.log("EVENT:", a.id, a.status, a.cancelledBy);
    //                     const isScheduled = a.status === "scheduled";
    //                     const isCancelled = a.status === "cancelled";

    //                     const isTherapistCancelled =
    //                         a.status === "cancelled" && a.cancelledBy !== "client";

    //                     const isClientCancelled =
    //                         isCancelled && a.cancelledBy === "client";
    //                     // console.log("APPOINTMENT:", a);
    //                     return (
    //                         <div
    //                             key={a.id}
    //                             style={{
    //                                 border: "1px solid #e5e7eb",
    //                                 padding: 16,
    //                                 marginBottom: 12,
    //                                 borderRadius: 12,
    //                                 background: "#fff",
    //                                 boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    //                                 opacity: a.seenAt ? 0.6 : 1,
    //                             }}
    //                         >

    //                             {/* 🔥 НОВО САМО АКО НЕ Е ВИДЯНА И НЕ Е CANCELLED */}
    //                             {!a.seenAt && !isCancelled && (
    //                                 <div style={{
    //                                     fontSize: 12,
    //                                     color: "#2563eb",
    //                                     fontWeight: 600,
    //                                     marginBottom: 6
    //                                 }}>
    //                                     ● НОВО
    //                                 </div>
    //                             )}

    //                             <div style={{ fontSize: 16, fontWeight: 500 }}>
    //                                 Среща с {client.therapistName || "вашия терапевт"}
    //                             </div>

    //                             <div style={{ fontSize: 14, color: "#555" }}>
    //                                 {new Date(a.startTime).toLocaleString()}
    //                             </div>

    //                             <div style={{
    //                                 fontSize: 12,
    //                                 fontWeight: 500,
    //                                 marginTop: 6,
    //                                 color:
    //                                     isScheduled
    //                                         ? "#16a34a"
    //                                         : isCancelled
    //                                             ? "#dc2626"
    //                                             : "#6b7280"
    //                             }}>
    //                                 {isScheduled && "Насрочена"}
    //                                 {isCancelled && "Отменена"}
    //                             </div>

    //                             {a.cancelReason && (
    //                                 <div style={{
    //                                     fontSize: 13,
    //                                     marginTop: 8,
    //                                     padding: 8,
    //                                     background: "#f9fafb",
    //                                     borderRadius: 8
    //                                 }}>
    //                                     <strong>Причина:</strong> {a.cancelReason}
    //                                 </div>
    //                             )}

    //                             {/* 🔥 БУТОНИ */}
    //                             <div style={{ marginTop: 12, display: "flex", gap: 10 }}>

    //                                 {/* 🔒 ако терапевт е отменил → няма бутони */}
    //                                 {!isTherapistCancelled && (
    //                                     <>
    //                                         {/* ✅ Потвърждавам (ако НЕ е scheduled) */}
    //                                         {!isScheduled && !isTherapistCancelled && (
    //                                             <button
    //                                                 style={{
    //                                                     flex: 1,
    //                                                     padding: "10px 12px",
    //                                                     borderRadius: 8,
    //                                                     border: "none",
    //                                                     background: "#16a34a",
    //                                                     color: "#fff",
    //                                                     fontWeight: 500,
    //                                                     cursor: "pointer"
    //                                                 }}
    //                                                 onClick={async () => {
    //                                                     try {
    //                                                         await updateStatus(a.id, "confirmed");
    //                                                     } catch {
    //                                                         alert("Грешка");
    //                                                     }
    //                                                 }}
    //                                             >
    //                                                 Потвърждавам
    //                                             </button>
    //                                         )}

    //                                         {/* ❌ Отменям (ако НЕ е отменена от клиента) */}
    //                                         {!isClientCancelled && !isTherapistCancelled && (
    //                                             <button
    //                                                 style={{
    //                                                     flex: 1,
    //                                                     padding: "10px 12px",
    //                                                     borderRadius: 8,
    //                                                     border: "none",
    //                                                     background: "#dc2626",
    //                                                     color: "#fff",
    //                                                     fontWeight: 500,
    //                                                     cursor: "pointer"
    //                                                 }}
    //                                                 onClick={async () => {
    //                                                     const reason = prompt("Причина за отмяна:");
    //                                                     if (reason === null) return;

    //                                                     if (reason.trim() === "") {
    //                                                         alert("Моля, въведете причина");
    //                                                         return;
    //                                                     }

    //                                                     try {
    //                                                         await updateStatus(a.id, "cancelled", reason);
    //                                                     } catch {
    //                                                         alert("Грешка");
    //                                                     }
    //                                                 }}
    //                                             >
    //                                                 Отменям
    //                                             </button>
    //                                         )}
    //                                     </>
    //                                 )}

    //                             </div>

    //                             {/* 🔴 статус текст */}
    //                             {a.status === "cancelled" && a.cancelledBy === "therapist" && (
    //                                 <div>Отменена от терапевт</div>
    //                             )}

    //                         </div>
    //                     );
    //                 })}
    //         </div>
    //     );
    // };

    const renderSection = (title, data) => {
        if (!data || data.length === 0) return null;

        const updateStatus = async (id, status, reason) => {
            const res = await fetch(
                `${API_URL}/appointments/${id}/status/public?token=${token}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status,
                        reason,
                    }),
                }
            );

            if (!res.ok) {
                console.log(await res.text());
                throw new Error();
            }

            await fetch(
                `${API_URL}/appointments/${id}/seen?token=${token}`,
                {
                    method: "PATCH",
                }
            );

            await loadClient();
        };

        return (
            <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 10 }}>
                    {title}
                </h3>

                <div
                    style={{
                        overflowX: "auto",
                        border: "1px solid #ddd",
                        borderRadius: 8,
                    }}
                >
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            background: "#fff",
                        }}
                    >
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        padding: 10,
                                        textAlign: "left",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        background: "#f5f5f5",
                                        width: 150,
                                    }}
                                >
                                    Date
                                </th>
                                <th
                                    style={{
                                        padding: 10,
                                        textAlign: "left",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        background: "#f5f5f5",
                                    }}
                                >
                                    Time
                                </th>
                                <th
                                    style={{
                                        padding: 10,
                                        textAlign: "left",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        background: "#f5f5f5",
                                    }}
                                >
                                    Status
                                </th>
                                <th
                                    style={{
                                        padding: 10,
                                        textAlign: "left",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        background: "#f5f5f5",
                                    }}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {[...data]
                                .sort(
                                    (a, b) =>
                                        new Date(a.startTime) - new Date(b.startTime)
                                )
                                .map((a) => {
                                    const isNew =
                                        a.status !== "cancelled" &&
                                        !a.seenAt;

                                    return (
                                        <tr key={a.id}>
                                            <td
                                                style={{
                                                    padding: 10,
                                                    borderTop: "1px solid #eee",
                                                }}
                                            >
                                                {new Date(a.startTime).toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </td>

                                            <td
                                                style={{
                                                    padding: 10,
                                                    borderTop: "1px solid #eee",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {`${new Date(a.startTime).toLocaleTimeString("bg-BG", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })} - ${new Date(a.endTime).toLocaleTimeString("bg-BG", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}`}
                                            </td>

                                            <td
                                                style={{
                                                    padding: 10,
                                                    borderTop: "1px solid #eee",
                                                }}
                                            >
                                                {isNew && (
                                                    <span
                                                        style={{
                                                            display: "inline-block",
                                                            marginRight: 8,
                                                            padding: "3px 7px",
                                                            borderRadius: 5,
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            background: "#fff3e0",
                                                            color: "#ef6c00",
                                                        }}
                                                    >
                                                        NEW
                                                    </span>
                                                )}

                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "4px 8px",
                                                        borderRadius: 5,
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        background:
                                                            a.status === "confirmed"
                                                                ? "#e8f5e9"
                                                                : a.status === "cancelled"
                                                                    ? "#ffebee"
                                                                    : a.status === "completed"
                                                                        ? "#eeeeee"
                                                                        : a.status === "archived"
                                                                            ? "#e3f2fd"
                                                                            : "#fff3e0",
                                                        color:
                                                            a.status === "confirmed"
                                                                ? "#2e7d32"
                                                                : a.status === "cancelled"
                                                                    ? "#c62828"
                                                                    : a.status === "completed"
                                                                        ? "#616161"
                                                                        : a.status === "archived"
                                                                            ? "#1565c0"
                                                                            : "#ef6c00",
                                                    }}
                                                >
                                                    {a.status}
                                                </span>
                                            </td>

                                            <td
                                                style={{
                                                    padding: 10,
                                                    borderTop: "1px solid #eee",
                                                }}
                                            >
                                                {!["cancelled", "completed", "archived"].includes(a.status) && (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: 8,
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        <button
                                                            // style={{
                                                            //     background: "#4caf50",
                                                            //     color: "#fff",
                                                            //     border: "none",
                                                            //     borderRadius: 5,
                                                            //     padding: "6px 12px",
                                                            //     cursor: "pointer",
                                                            //     width: 90,
                                                            //     textAlign: "center",
                                                            // }}
                                                            style={{
                                                                ...actionButtonStyle,
                                                                background: "#4caf50",
                                                            }}
                                                            className="client-access-action-button"
                                                            onClick={async () => {
                                                                try {
                                                                    await updateStatus(a.id, "confirmed");
                                                                } catch {
                                                                    alert("Error");
                                                                }
                                                            }}
                                                        >
                                                            Confirm
                                                        </button>

                                                        <button
                                                            // style={{
                                                            //     background: "#f44336",
                                                            //     color: "#fff",
                                                            //     border: "none",
                                                            //     borderRadius: 5,
                                                            //     padding: "6px 12px",
                                                            //     cursor: "pointer",
                                                            //     width: 90,
                                                            //     textAlign: "center",
                                                            // }}
                                                            style={{
                                                                ...actionButtonStyle,
                                                                background: "#f44336",
                                                            }}
                                                            className="client-access-action-button"
                                                            onClick={async () => {
                                                                const reason = prompt("Reason for cancellation:");

                                                                if (reason === null) return;

                                                                if (reason.trim() === "") {
                                                                    alert("Please enter a reason");
                                                                    return;
                                                                }

                                                                try {
                                                                    await updateStatus(
                                                                        a.id,
                                                                        "cancelled",
                                                                        reason
                                                                    );
                                                                } catch {
                                                                    alert("Error");
                                                                }
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}

                                                {a.status === "cancelled" && a.cancelReason && (
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            color: "#666",
                                                        }}
                                                    >
                                                        <strong>Reason:</strong> {a.cancelReason}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    console.log("CLIENT INFO:", clientInfo);
    return (
        <div style={{
            padding: 20,
            maxWidth: 500,
            margin: "0 auto",
            background: "#f3f4f6",
            minHeight: "100vh"
        }}>

            <div style={{
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 20
            }}>
                TherapistDesk
            </div>

            {/* <h2 style={{ marginBottom: 20 }}>{client.name}</h2> */}
            <h2 style={{ marginBottom: 20 }}>
                Hello, {clientInfo?.name}
            </h2>
            {appointments.length === 0 && <div>No meetings</div>}

            {renderSection("Today", today)}
            {renderSection("Tomorrow", tomorrow)}
            {renderSection("Upcoming", upcoming)}
            {renderSection("Past", past)}
        </div>
    );
}