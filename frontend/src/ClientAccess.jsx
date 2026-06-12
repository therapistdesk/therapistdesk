import { useEffect, useState } from "react";

export default function ClientAccess() {
    const [messages, setMessages] = useState([]);

    const path = window.location.pathname;
    const token = path.split("/client-access/")[1];
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        if (!token) return;

        fetch(`${API_URL}/messages/access/${token}`)
            .then((res) => res.json())
            .then((data) => {
                setMessages(data);
            });
    }, [token]);

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

    const getStart = (m) => new Date(m.appointment?.startTime);

    const today = messages.filter((m) => isToday(getStart(m)));
    const tomorrow = messages.filter((m) => isTomorrow(getStart(m)));
    const upcoming = messages.filter(
        (m) =>
            getStart(m) > now &&
            !isToday(getStart(m)) &&
            !isTomorrow(getStart(m))
    );
    const past = messages.filter((m) => getStart(m) < now);

    const renderSection = (title, data) => {
        if (data.length === 0) return null;

        return (
            <div style={{ marginBottom: 20 }}>
                <h3>{title}</h3>

                {data
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                    .map((m) => (
                        <div
                            key={m.id}
                            onClick={async () => {
                                await fetch(
                                    `${API_URL}/messages/access/${token}/${m.id}/read`,
                                    { method: "PATCH" }
                                );

                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === m.id
                                            ? {
                                                  ...msg,
                                                  readAt: new Date().toISOString(),
                                              }
                                            : msg
                                    )
                                );
                            }}
                            style={{
                                border: "1px solid #ccc",
                                padding: 10,
                                marginBottom: 10,
                                cursor: "pointer",
                                opacity: m.readAt ? 0.6 : 1,
                            }}
                        >
                            <div>{m.content}</div>

                            <div style={{ fontSize: 12, opacity: 0.7 }}>
                                {m.readAt
                                    ? "✔ прочетено"
                                    : "❗ непрочетено"}
                            </div>
                        </div>
                    ))}
            </div>
        );
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Вашите срещи</h2>

            {messages.length === 0 && <div>Няма съобщения</div>}

            {renderSection("Днес", today)}
            {renderSection("Утре", tomorrow)}
            {renderSection("Предстоящи", upcoming)}
            {renderSection("Минали", past)}
        </div>
    );
}