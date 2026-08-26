export default function AppointmentCard({
  a,
  start,
  end,
  top,
  height,
  width,
  left,
  borderColor,
  isSeen,
  isCancelled,
  isClientCancelled,
  activeAppointment,
  dragged,
  hoverY,
  longPressTriggered,
  pressTimer,
  setLongPressTriggered,
  setAppointmentMenu,
  setPressTimer,
  setHoverPosition,
  setActiveAppointment,
  handleDragStart,
  handleAddNote,
  deleteAppointment,
  reloadAppointments,
  token,
  t,
  lang,
  canDrag,
}) {
  return (
    <div
      key={a.id}
      className="event-card"
      draggable={canDrag}
      // title={a.cancelReason || ""}
      onClick={(e) => {
        e.stopPropagation();
      }}

      onMouseMove={(e) => {
        // clearTimeout(pressTimer);
        e.stopPropagation();
      }}

      onMouseDown={(e) => {
        if (isCancelled) return;
        if (dragged) return;

        setLongPressTriggered(false);

        if (dragged && hoverY !== null) return;

        const timer = setTimeout(() => {
          setLongPressTriggered(true);

          setAppointmentMenu({
            x: e.clientX,
            y: e.clientY,
            appointment: a,
          });
        }, 600);

        setPressTimer(timer);
      }}

      onTouchStart={(e) => {
        setLongPressTriggered(false);

        const touch = e.touches[0];

        const timer = setTimeout(() => {
          setLongPressTriggered(true);

          setAppointmentMenu({
            x: touch.clientX,
            y: touch.clientY,
            appointment: a,
          });
        }, 500);

        setPressTimer(timer);
      }}

      onMouseEnter={(e) => {
        if (dragged) return;

        const rect = e.currentTarget.getBoundingClientRect();

        setHoverPosition({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });

        setActiveAppointment(a);
      }}

      onMouseUp={() => {
        clearTimeout(pressTimer);
      }}

      onTouchEnd={() => {
        clearTimeout(pressTimer);
      }}

      onMouseLeave={() => {
        clearTimeout(pressTimer);
      }}

      onClick={(e) => {
        e.stopPropagation();

        if (isCancelled) {
          return;
        }

        if (longPressTriggered) {
          setLongPressTriggered(false);
          return;
        }

        setAppointmentMenu(null);
        setActiveAppointment(a);
      }}

      onMouseMove={(e) => {
        clearTimeout(pressTimer);
        e.stopPropagation();
      }}

      onMouseDown={(e) => {
        if (isCancelled) return;
        if (dragged) return;

        setLongPressTriggered(false);

        const timer = setTimeout(() => {
          setLongPressTriggered(true);

          setAppointmentMenu({
            x: e.clientX,
            y: e.clientY,
            appointment: a,
          });
        }, 600);

        setPressTimer(timer);
      }}

      onTouchStart={(e) => {
        if (isCancelled) return;

        setLongPressTriggered(false);

        const touch = e.touches[0];

        const timer = setTimeout(() => {
          setLongPressTriggered(true);

          setAppointmentMenu({
            x: touch.clientX,
            y: touch.clientY,
            appointment: a,
          });
        }, 500);

        setPressTimer(timer);
      }}

      onMouseEnter={(e) => {
        if (dragged) return;

        const rect = e.currentTarget.getBoundingClientRect();

        setHoverPosition({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });

        setActiveAppointment(a);
      }}

      onMouseUp={() => {
        clearTimeout(pressTimer);
      }}

      onTouchEnd={() => {
        clearTimeout(pressTimer);
      }}

      onMouseLeave={() => {
        clearTimeout(pressTimer);

        if (dragged) return;
        setActiveAppointment(null);
      }}

      onDragStart={(e) => {
        if (isCancelled) {
          e.preventDefault();
          return;
        }

        handleDragStart(e, a);
      }}

      onContextMenu={(e) => {
        e.preventDefault();

        if (isCancelled) return;

        const confirmDelete = window.confirm(
          t("deleteAppointment", lang)
        );

        if (!confirmDelete) return;

        deleteAppointment(token, a.id).then(() => {
          reloadAppointments();
        });
      }}

      style={{
        position: "absolute",
        top: top + 2,
        height: height - 4,

        left: `${left}%`,
        width: `${width}%`,

        opacity: isCancelled ? 0.5 : 1,
        textDecoration: isCancelled ? "line-through" : "none",

        boxSizing: "border-box",
        background: "#fff",
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: 6,
        padding: "4px 4px 4px 6px",
        fontSize: 12,
        overflow: "hidden",
        cursor: isCancelled
          ? "default"
          : dragged
            ? "grabbing"
            : "grab",
        transition: "all 0.15s ease",

        transform:
          activeAppointment?.id === a.id
            ? "scale(1.02)"
            : "scale(1)",

        zIndex:
          activeAppointment?.id === a.id ? 20 : 10,

        boxShadow:
          activeAppointment?.id === a.id
            ? "0 6px 16px rgba(0,0,0,0.15)"
            : "0 2px 6px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {a.client?.name}

            {isCancelled && (
              <div style={{ fontSize: 10, color: "red" }}>
                {a.cancelReason === "Преместена"
                  ? "↪ Преместена"
                  : "Отменена"}

                {a.cancelReason && a.cancelReason !== "Преместена" &&
                  ` • ${a.cancelReason}`}
              </div>
            )}
          </div>

          <div>
            {!isSeen && "🔔"}
            {isSeen && !isClientCancelled && "✅"}
            {isClientCancelled && "❌"}
          </div>

          <span
            style={{
              fontSize: 11,
              opacity: a.notes ? 1 : 0.35,
              cursor: "pointer",
              marginLeft: 6,
            }}
            title={
              a.notes
                ? "Редактирай бележката"
                : "Добави бележка"
            }
            onClick={(e) => {
              e.stopPropagation();
              handleAddNote(a);
            }}
          >
            📝
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "#555" }}>
        {start.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })}
        {" – "}
        {end.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })}

        {" • "}
        {Math.round((end - start) / 1000 / 60)}m
      </div>
    </div>
  );
}