import { useEffect, useRef } from "react";

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
    setDragged,
    handleDragStart,
    handleDrop,
    day,
    weekDays,
    snap,
    PX_PER_MINUTE,
    setHoverY,
    setHoverDayIndex,
    setPreview,
    handleAddNote,
    deleteAppointment,
    reloadAppointments,
    token,
    t,
    lang,
    canDrag,
    acquireCalendarEventLock,
    releaseCalendarEventLock,
}) {
    const touchStartRef = useRef(null);
    const touchDraggingRef = useRef(false);
    const touchMovedRef = useRef(false);
    const touchDayIndexRef = useRef(null);
    const touchYRef = useRef(null);

    /*
     * Почистване на touch listener-и при unmount.
     */
    useEffect(() => {
        return () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
            }
        };
    }, [pressTimer]);

    /*
     * Намира календарната колона под пръста.
     */
    const getTouchPosition = (touch) => {
        const elements = document.elementsFromPoint(
            touch.clientX,
            touch.clientY
        );

        if (!elements?.length) return null;

        for (const element of elements) {
            const column =
                element.closest("[data-dayindex]");

            if (!column) continue;

            const dayIndex =
                Number(column.dataset.dayindex);

            if (!Number.isInteger(dayIndex)) {
                continue;
            }

            const rect =
                column.getBoundingClientRect();

            const y =
                touch.clientY - rect.top;

            return {
                column,
                dayIndex,
                y,
            };
        }

        return null;
    };

    /*
     * Спира touch drag listener-ите.
     */
    const cleanupTouchDrag = () => {
        if (touchMoveHandlerRef.current) {
            document.removeEventListener(
                "touchmove",
                touchMoveHandlerRef.current
            );
        }

        if (touchEndHandlerRef.current) {
            document.removeEventListener(
                "touchend",
                touchEndHandlerRef.current
            );
        }

        touchMoveHandlerRef.current = null;
        touchEndHandlerRef.current = null;
    };

    const touchMoveHandlerRef = useRef(null);
    const touchEndHandlerRef = useRef(null);

    /*
     * Започване на touch.
     */
    const handleTouchStart = (e) => {
        if (isCancelled) return;

        if (!acquireCalendarEventLock()) return;
        const touch = e.touches[0];

        if (!touch) return;

        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
        };

        touchDraggingRef.current = false;
        touchMovedRef.current = false;
        touchDayIndexRef.current = null;
        touchYRef.current = null;

        setLongPressTriggered(false);

        /*
         * Следим за движението на пръста върху целия документ.
         * Това позволява срещата да бъде влачена и между различни
         * дневни колони.
         */
        const moveHandler = (moveEvent) => {
            if (!touchStartRef.current) return;

            const currentTouch = moveEvent.touches[0];

            if (!currentTouch) return;

            const dx =
                currentTouch.clientX - touchStartRef.current.x;

            const dy =
                currentTouch.clientY - touchStartRef.current.y;

            const distance = Math.sqrt(dx * dx + dy * dy);

            touchMovedRef.current = true;

            setAppointmentMenu(null);
            setLongPressTriggered(false);

            clearTimeout(pressTimer);
            setLongPressTriggered(false);

            if (!canDrag) return;

            touchDraggingRef.current = true;
            setDragged(a);

            const position = getTouchPosition(currentTouch);

            let dayIndex;
            let y;

            if (position) {
                dayIndex = position.dayIndex;
                y = position.y;
            } else {
                // При same-day drag пръстът може да е върху самата среща.
                // В такъв случай използваме деня на срещата директно.
                dayIndex = weekDays.findIndex((d) => {
                    const appointmentDay = new Date(a.startTime);

                    return (
                        d.getFullYear() === appointmentDay.getFullYear() &&
                        d.getMonth() === appointmentDay.getMonth() &&
                        d.getDate() === appointmentDay.getDate()
                    );
                });

                if (dayIndex === -1) return;

                const columns =
                    document.querySelectorAll("[data-dayindex]");

                const column = columns[dayIndex];

                if (!column) return;

                const rect = column.getBoundingClientRect();

                y = currentTouch.clientY - rect.top;
            }
            // ---

            touchDayIndexRef.current = dayIndex;
            touchYRef.current = y;

            const snapped =
                snap(y / PX_PER_MINUTE);

            setHoverY(
                snapped * PX_PER_MINUTE
            );

            setHoverDayIndex(dayIndex);

            setPreview(y);

            moveEvent.preventDefault();
        };

        /*
         * Завършване на touch drag.
         */
        const endHandler = async () => {
            try {
                releaseCalendarEventLock();
                clearTimeout(pressTimer);

                cleanupTouchDrag();

                if (!touchMovedRef.current) {
                    touchStartRef.current = null;
                    return;
                }

                if (!touchDraggingRef.current) {
                    touchStartRef.current = null;
                    return;
                }

                const dayIndex = touchDayIndexRef.current;
                const y = touchYRef.current;

                if (
                    dayIndex === null ||
                    y === null ||
                    !weekDays?.[dayIndex]
                ) {
                    touchStartRef.current = null;
                    touchDraggingRef.current = false;
                    return;
                }

                /*
                 * Оставяме touchMovedRef = true до следващия click,
                 * за да не се интерпретира отпускането като обикновен tap.
                 */
                touchDraggingRef.current = false;

                await handleDrop(
                    weekDays[dayIndex],
                    y
                );

                touchStartRef.current = null;
                touchDayIndexRef.current = null;
                touchYRef.current = null;

            } finally {
                releaseCalendarEventLock();
            }
        };

        touchMoveHandlerRef.current = moveHandler;
        touchEndHandlerRef.current = endHandler;

        document.addEventListener(
            "touchmove",
            moveHandler,
            { passive: false }
        );

        document.addEventListener(
            "touchend",
            endHandler
        );
    };

    return (
        <div
            key={a.id}
            className="event-card"
            draggable={canDrag}

            onClick={(e) => {
                e.stopPropagation();

                if (!acquireCalendarEventLock()) {
                    return;
                }

                try {
                    if (touchMovedRef.current) {
                        touchMovedRef.current = false;
                        return;
                    }

                    if (isCancelled) {
                        return;
                    }

                    if (longPressTriggered) {
                        setLongPressTriggered(false);
                        return;
                    }

                    const rect = e.currentTarget.getBoundingClientRect();

                    setHoverPosition({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                    });

                    setAppointmentMenu(null);
                    setActiveAppointment(a);
                } finally {
                    releaseCalendarEventLock();
                }
            }}

            onDoubleClick={(e) => {
                e.stopPropagation();

                if (isCancelled) return;

                setAppointmentMenu({
                    x: e.clientX,
                    y: e.clientY,
                    appointment: a,
                });
            }}

            onMouseMove={(e) => {
                clearTimeout(pressTimer);
                e.stopPropagation();
            }}

            onMouseDown={(e) => {
                if (e.nativeEvent?.sourceCapabilities?.firesTouchEvents) {
                    return;
                }
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

            onTouchStart={handleTouchStart}

            onMouseEnter={(e) => {
                if (dragged) return;

                const rect =
                    e.currentTarget.getBoundingClientRect();

                setHoverPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                });

                setActiveAppointment(a);
            }}

            onMouseUp={() => {
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
                textDecoration: isCancelled
                    ? "line-through"
                    : "none",

                boxSizing: "border-box",

                background: "#fff",

                borderLeft:
                    `4px solid ${borderColor}`,

                borderRadius: 6,

                padding:
                    "4px 4px 4px 6px",

                fontSize: 12,

                overflow: "hidden",

                cursor: isCancelled
                    ? "default"
                    : dragged
                        ? "grabbing"
                        : "grab",

                transition:
                    "all 0.15s ease",

                /*
                 * Важно за touch drag:
                 * браузърът няма да интерпретира движението
                 * като page scroll върху самата среща.
                 */
                touchAction: "none",

                transform:
                    activeAppointment?.id === a.id
                        ? "scale(1.02)"
                        : "scale(1)",

                zIndex:
                    activeAppointment?.id === a.id
                        ? 20
                        : 10,

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
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: 13,
                        }}
                    >
                        {a.client?.name}

                        {isCancelled && (
                            <div
                                style={{
                                    fontSize: 10,
                                    color: "red",
                                }}
                            >
                                {a.cancelReason === "Преместена"
                                    ? "↪ Преместена"
                                    : "Отменена"}

                                {a.cancelReason &&
                                    a.cancelReason !== "Преместена" &&
                                    ` • ${a.cancelReason}`}
                            </div>
                        )}
                    </div>

                    <div>
                        {!isSeen && "🔔"}
                        {isSeen &&
                            !isClientCancelled &&
                            "✅"}
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

            <div
                style={{
                    fontSize: 11,
                    color: "#555",
                }}
            >
                {start.toLocaleTimeString(
                    undefined,
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                )}

                {" – "}

                {end.toLocaleTimeString(
                    undefined,
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                )}

                {" • "}

                {Math.round(
                    (end - start) / 1000 / 60
                )}m
            </div>
        </div>
    );
}