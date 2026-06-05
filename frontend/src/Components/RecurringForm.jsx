import { useState } from "react";

export default function RecurringForm({
    onClose,
    selectedClient,
    therapist,
    duration,
    WORK_START,
    WORK_END,
    WORK_END_MINUTE
}) {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [count, setCount] = useState(1);
    const [loading, setLoading] = useState(false);

    const [date, setDate] = useState("");
    const [startHour, setStartHour] = useState("08");
    const [startMinute, setStartMinute] = useState("00");
    const API_URL = import.meta.env.VITE_API_URL;

    // function roundTo30(dateString) {
    //     const d = new Date(dateString);
    //     const minutes = d.getMinutes();
    //     const rounded = Math.round(minutes / 30) * 30;
    //     d.setMinutes(rounded, 0, 0);
    //     return d;
    // }

    function normalize(dateString) {
        const d = new Date(dateString);
        const minutes = d.getMinutes();

        // закръгляме до 00 или 30
        const rounded = Math.round(minutes / 30) * 30;

        d.setMinutes(rounded, 0, 0);
        return d;
    }

    async function createRecurring() {
        // if (!selectedClient?.id) {
        //     alert("Select client first");
        //     return;
        // }
        // if (!selectedClient?.id) {
        //     alert("Select client first");
        //     return;
        // }
        console.log("FORM RENDERED");
        if (!count || count < 1) {
            alert("Invalid count");
            return;
        }

        if (!date) {
            alert("Select date");
            return;
        }

        if (count > 20) {
            alert("Maximum is 20");
            return;
        }

        if (startHour === "19" && startMinute > "30") {
            alert("Latest possible time is 19:30");
            return;
        }

        // if (!selectedClient || !selectedClient.id) {
        //     alert("Select client first");
        //     return;
        // }

        console.log({
            clientId: selectedClient.id,
            therapistId: therapist?.id,
            start,
            end,
            count
        });

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const startTime = new Date(`${date}T${startHour}:${startMinute || "00"}:00`);
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + duration);

            const now = new Date();

            if (startTime < now) {
                alert("Cannot select past time");
                return;
            }

            setLoading(false);

            console.log("SENDING:", {
                clientId: selectedClient?.id,
                therapistId: therapist?.id,
                startTime,
                endTime,
                count
            });
            console.log("CLIENT:", selectedClient);

            const res = await fetch(`${API_URL}/appointments/recurring`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    clientId: selectedClient.id,
                    therapistId: therapist?.id || 1,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    count: Number(count),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Error");
                setLoading(false);
                return;
            }

            onClose();
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Request failed");
            //setLoading(false);
        } finally {
            setLoading(false); // 🔥 винаги се изпълнява
        }
    }

    return (
        <div>
            <h3>Recurring</h3>

            {selectedClient ? (
                <div style={{ marginBottom: 10, fontWeight: "bold" }}>
                    Client: {selectedClient.name}
                </div>
            ) : (
                <div style={{ marginBottom: 10, color: "red" }}>
                    Select client first
                </div>
            )}

            <h3>
                Recurring
                {selectedClient && ` - ${selectedClient.name}`}
            </h3>

            <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
                This will create {count} weekly appointments starting from selected date.
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
                Working hours: 08:00 – 19:30
            </div>

            {/* {!selectedClient && (
                <div style={{ color: "red", marginBottom: 10 }}>
                    No client selected
                </div>
            )} */}

            <div>
                <label>Date:</label>
                <br />
                <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>

            <br />

            <div>
                <label>
                    Start ({WORK_START}:00 – {WORK_END}:{String(WORK_END_MINUTE).padStart(2, "0")})
                </label>
                <select
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                >
                    {[...Array(WORK_END - WORK_START + 1)].map((_, i) => {
                        const hour = i + WORK_START;
                        return (
                            <option key={hour} value={String(hour).padStart(2, "0")}>
                                {String(hour).padStart(2, "0")}
                            </option>
                        );
                    })}
                </select>
                {/* </div>

              <br /> 

            <div> */}
                <label> Minutes: </label>
                <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(e.target.value)}
                >
                    {[...Array(12)].map((_, i) => {
                        const val = String(i * 5).padStart(2, "0");

                        // ако е 19-ти час → максимум 30 мин
                        if (startHour === String(WORK_END) && Number(val) > WORK_END_MINUTE) return null;

                        return (
                            <option key={val} value={val}>
                                {val}
                            </option>
                        );
                    })}
                </select>
            </div>

            <br />

            <div style={{ marginTop: 10 }}>
                Duration: {duration} min
            </div>

            <br />

            <div>
                <label>Count (max 20):</label>
                <br />
                <input
                    type="number"
                    value={count}
                    min={1}
                    max={20}
                    style={{ width: 60, textAlign: "center" }}
                    onChange={(e) => setCount(e.target.value)}
                />
            </div>
            {/* <div style={{ fontSize: 12, color: "#666" }}>
                Max 20 appointments
            </div> */}

            <br />

            <button
                onClick={() => {
                    console.log("CREATE CLICK");
                    createRecurring();
                }}
                disabled={loading}
            >
                {loading ? "Creating..." : "Create"}
            </button>

            <button
                onClick={() => {
                    console.log("CLOSE CLICK");
                    onClose();
                }}
                style={{ marginLeft: 10 }}
            >
                Close
            </button>
        </div>
    );
}