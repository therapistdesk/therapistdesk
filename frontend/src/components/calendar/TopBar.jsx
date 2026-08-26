export default function TopBar({
    therapist,
    moveMode,
    clients,
    selectedClient,
    setMode,
}) {
    return (
        <>
            <h2>TherapistDesk</h2>

            <div>
                Добре дошъл, {therapist?.firstName} {therapist?.lastName}
            </div>

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

            <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setMode("settings-home")}>
                    ⚙️ Settings
                </button>

                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.reload();
                    }}
                >
                    Logout
                </button>
            </div>

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
        </>
    );
}