export default function AppointmentPreview({
    activeAppointment,
    hoverPosition,
}) {
    if (!activeAppointment) return null;

    const isCancelled = activeAppointment.status === "cancelled";

    return (
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
                {(activeAppointment.start % 60)
                    .toString()
                    .padStart(2, "0")}
                {" – "}
                {Math.floor(activeAppointment.end / 60)
                    .toString()
                    .padStart(2, "0")}
                :
                {(activeAppointment.end % 60)
                    .toString()
                    .padStart(2, "0")}

                {" • "}
                {Math.round(
                    activeAppointment.end - activeAppointment.start
                )}m
            </div>

            {isCancelled && activeAppointment.cancelReason && (
                <div
                    style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#b91c1c",
                        borderTop: "1px solid #eee",
                        paddingTop: 5,
                    }}
                >
                    <strong>Причина за отмяна:</strong>{" "}
                    {activeAppointment.cancelReason}
                </div>
            )}

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
    );
}