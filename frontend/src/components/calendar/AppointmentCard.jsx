import { useEffect, useRef, useState } from "react";

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
}) {
    const touchStartRef = useRef(null);
    const touchDraggingRef = useRef(false);
    const touchMovedRef = useRef(false);

    const touchDayIndexRef = useRef(null);
    const touchYRef = useRef(null);

    const touchMoveHandlerRef = useRef(null);
    const touchEndHandlerRef = useRef(null);

    const [touchDragActive, setTouchDragActive] =
        useState(false);

    /*
     * --------------------------------------------------
     * CLEANUP
     * --------------------------------------------------
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

    useEffect(() => {
        return () => {
            cleanupTouchDrag();
        };
    }, []);

    /*
     * --------------------------------------------------
     * FIND CALENDAR COLUMN UNDER FINGER
     * --------------------------------------------------
     */

    const getTouchPosition = (touch) => {
        const elements = document.elementsFromPoint(
            touch.clientX,
            touch.clientY
        );

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
     * --------------------------------------------------
     * TOUCH START
     * --------------------------------------------------
     */

    const handleTouchStart = (e) => {
        if (isCancelled) return;

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
         * Long press → context menu.
         */

        const timer = setTimeout(() => {
            if (touchMovedRef.current) return;

            setLongPressTriggered(true);

            setAppointmentMenu({
                x: touch.clientX,
                y: touch.clientY,
                appointment: a,
            });
        }, 500);

        setPressTimer(timer);

        /*
         * ------------------------------------------------
         * TOUCH MOVE
         * ------------------------------------------------
         */

        const moveHandler = (moveEvent) => {
            if (!touchStartRef.current) return;

            const currentTouch =
                moveEvent.touches[0];

            if (!currentTouch) return;

            const dx =
                currentTouch.clientX -
                touchStartRef.current.x;

            const dy =
                currentTouch.clientY -
                touchStartRef.current.y;

            const distance =
                Math.sqrt(
                    dx * dx + dy * dy
                );

            /*
             * Ignore tiny finger movements.
             */

            if (distance < 8) {
                return;
            }

            touchMovedRef.current = true;

            clearTimeout(timer);

            if (!canDrag) {
                return;
            }

            /*
             * We have now switched from
             * long-press detection to dragging.
             */

            touchDraggingRef.current = true;

            setTouchDragActive(true);

            setLongPressTriggered(false);

            /*
             * IMPORTANT:
             * Make the appointment transparent to
             * hit-testing while dragging.
             *
             * This allows the calendar column underneath
             * to be detected even when the finger remains
             * inside the original appointment.
             */

            const position =
                getTouchPosition(currentTouch);

            if (!position) {
                return;
            }

            const {
                dayIndex,
                y,
            } = position;

            touchDayIndexRef.current =
                dayIndex;

            touchYRef.current =
                y;

            const snapped =
                snap(
                    y / PX_PER_MINUTE
                );

            setHoverY(
                snapped * PX_PER_MINUTE
            );

            setHoverDayIndex(dayIndex);

            setPreview(y);

            moveEvent.preventDefault();
        };

        /*
         * ------------------------------------------------
         * TOUCH END
         * ------------------------------------------------
         */

        const endHandler = async () => {
            clearTimeout(timer);

            cleanupTouchDrag();

            /*
             * Normal tap.
             *
             * Do not drop anything.
             */

            if (!touchMovedRef.current) {
                touchStartRef.current = null;
                return;
            }

            /*
             * Movement happened, but drag wasn't enabled.
             */

            if (!touchDraggingRef.current) {
                touchStartRef.current = null;
                return;
            }

            const dayIndex =
                touchDayIndexRef.current;

            const y =
                touchYRef.current;

            /*
             * Nothing valid underneath finger.
             */

            if (
                dayIndex === null ||
                y === null ||
                !weekDays?.[dayIndex]
            ) {
                setTouchDragActive(false);

                setHoverY(null);
                setHoverDayIndex(null);
                setPreview(null);

                touchStartRef.current = null;

                return;
            }

            /*
             * Perform the SAME drop operation
             * used by desktop drag & drop.
             */

            await handleDrop(
                weekDays[dayIndex],
                y
            );

            setTouchDragActive(false);

            touchStartRef.current = null;
            touchDayIndexRef.current = null;
            touchYRef.current = null;
        };

        touchMoveHandlerRef.current =
            moveHandler;

        touchEndHandlerRef.current =
            endHandler;

        document.addEventListener(
            "touchmove",
            moveHandler,
            {
                passive: false,
            }
        );

        document.addEventListener(
            "touchend",
            endHandler
        );
    };

    /*
     * --------------------------------------------------
     * CLICK
     * --------------------------------------------------
     */

    const handleClick = (e) => {
        e.stopPropagation();

        if (isCancelled) {
            return;
        }

        /*
         * A touch drag ends with a click event too.
         * Ignore that synthetic click.
         */

        if (touchMovedRef.current) {
            touchMovedRef.current = false;
            return;
        }

        /*
         * Long press already opened the menu.
         */

        if (longPressTriggered) {
            setLongPressTriggered(false);
            return;
        }

        /*
         * Normal click/tap.
         */

        setAppointmentMenu(null);
        setActiveAppointment(a);
    };

    /*
     * --------------------------------------------------
     * RENDER
     * --------------------------------------------------
     */

    return (
        <div
            key={a.id}
            className="event-card"

            draggable={canDrag}

            onClick={handleClick}

            onMouseMove={(e) => {
                clearTimeout(pressTimer);
                e.stopPropagation();
            }}

            onMouseDown={(e) => {
                if (isCancelled) return;
                if (dragged) return;

                setLongPressTriggered(false);

                const timer =
                    setTimeout(() => {
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
                    x:
                        rect.left +
                        rect.width / 2,

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

                const confirmDelete =
                    window.confirm(
                        t(
                            "deleteAppointment",
                            lang
                        )
                    );

                if (!confirmDelete) return;

                deleteAppointment(
                    token,
                    a.id
                ).then(() => {
                    reloadAppointments();
                });
            }}

            style={{
                position: "absolute",

                top: top + 2,

                height: height - 4,

                left: `${left}%`,

                width: `${width}%`,

                opacity:
                    isCancelled ? 0.5 : 1,

                textDecoration:
                    isCancelled
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

                cursor:
                    isCancelled
                        ? "default"
                        : dragged ||
                            touchDragActive
                            ? "grabbing"
                            : "grab",

                transition:
                    "all 0.15s ease",

                /*
                 * Critical for mobile drag.
                 */

                touchAction: "none",

                /*
                 * While touch dragging, don't let this
                 * card block hit-testing of the column
                 * underneath it.
                 */

                pointerEvents:
                    touchDragActive
                        ? "none"
                        : "auto",

                transform:
                    activeAppointment?.id ===
                        a.id
                        ? "scale(1.02)"
                        : "scale(1)",

                zIndex:
                    activeAppointment?.id ===
                        a.id
                        ? 20
                        : 10,

                boxShadow:
                    activeAppointment?.id ===
                        a.id
                        ? "0 6px 16px rgba(0,0,0,0.15)"
                        : "0 2px 6px rgba(0,0,0,0.08)",
            }}
        >
            <div
                style={{
                    pointerEvents: "auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
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
                                {a.cancelReason ===
                                    "Преместена"
                                    ? "↪ Преместена"
                                    : "Отменена"}

                                {a.cancelReason &&
                                    a.cancelReason !==
                                    "Преместена" &&
                                    ` • ${a.cancelReason}`}
                            </div>
                        )}
                    </div>

                    <div>
                        {!isSeen && "🔔"}

                        {isSeen &&
                            !isClientCancelled &&
                            "✅"}

                        {isClientCancelled &&
                            "❌"}
                    </div>

                    <span
                        style={{
                            fontSize: 11,

                            opacity:
                                a.notes ? 1 : 0.35,

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
                    (end - start) /
                    1000 /
                    60
                )}

                m
            </div>
        </div>
    );
}