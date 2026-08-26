export default function AppointmentContextMenu({
  appointmentMenu,
  setAppointmentMenu,
  t,
  lang,
  token,
  deleteAppointment,
  reloadAppointments,
  handleAddNote,
  setMoveMode,
}) {
  if (!appointmentMenu) return null;

  return (
    <>
      {/* BACKDROP */}
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
        onTouchStart={(e) => {
          e.stopPropagation();
          setAppointmentMenu(null);
        }}
      />

      {/* MENU */}
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
            const confirmDelete = window.confirm(
              t("deleteAppointment", lang)
            );
            if (!confirmDelete) return;

            await deleteAppointment(
              token,
              appointmentMenu.appointment.id
            );

            setAppointmentMenu(null);
            await reloadAppointments();
          }}
        >
          Cancel
        </div>

        {/* ADD / EDIT NOTE */}
        <div
          style={{ cursor: "pointer", marginTop: 5 }}
          onClick={() =>
            handleAddNote(appointmentMenu.appointment)
          }
        >
          {appointmentMenu.appointment.notes
            ? "Edit note"
            : "Add note"}
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
  );
}