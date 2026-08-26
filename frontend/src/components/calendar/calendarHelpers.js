import { getServiceColor } from "../../register/RegisterHelpers";

export function isPastDateTime(day, minutes) {
    const now = new Date();

    const slot = new Date(day);

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    slot.setHours(hours, mins, 0, 0);

    return slot < now;
}

export function isOverlapping(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
}

export function layoutEvents(events) {
    const sorted = [...events].sort((a, b) => a.start - b.start);

    const groups = [];

    // 🔵 1. групиране по overlap
    sorted.forEach((event) => {
        let placed = false;

        for (const group of groups) {
            const overlaps = group.some((e) => {
                return event.start < e.end && event.end > e.start;
            });

            if (overlaps) {
                group.push(event);
                placed = true;
                break;
            }
        }

        if (!placed) {
            groups.push([event]);
        }
    });

    // 🔵 2. layout вътре във всяка група
    const result = [];

    let globalColumnOffset = 0;

    groups.forEach((group) => {
        const columns = [];

        group.forEach((event) => {
            let placed = false;

            for (let i = 0; i < columns.length; i++) {
                const last = columns[i][columns[i].length - 1];

                if (!(event.start < last.end && event.end > last.start)) {
                    columns[i].push(event);
                    event._column = i;
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                event._column = columns.length;
                columns.push([event]);
            }
        });

        const totalColumns = columns.length;

        group.forEach((e) => {
            result.push({
                ...e,
                column: e._column, // 🔥 FIX
                totalColumns,
            });
        });

        // globalColumnOffset += totalColumns; // 🔥 FIX
    });

    return result;
}

export function toMinutes(date) {
    const d = new Date(date);
    return d.getHours() * 60 + d.getMinutes();
}

export function snap(min) {
    return Math.floor(min / 15) * 15;
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function darkenColor(hex, amount = 0.2) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgb(${Math.floor(r * (1 - amount))}, ${Math.floor(
        g * (1 - amount)
    )}, ${Math.floor(b * (1 - amount))})`;
}

export function getBlockColor(type) {
    if (type === "green") return "#c8e6c9";
    if (type === "yellow") return "#fff3cd";
    if (type === "red") return "#ffcdd2";
    return "#eee";
}

export const COLORS = [
    "#E3F2FD",
    "#E8F5E9",
    "#FFF3E0",
    "#F3E5F5",
    "#E0F7FA",
    "#FCE4EC",
];

export function getClientColor(clientId) {
    return COLORS[(Number(clientId) || 0) % COLORS.length];
}

export function getAppointmentLayout(
    appointment,
    {
        DAY_START,
        PX_PER_MINUTE,
    }
) {
    const color = getClientColor(appointment.client?.id || 0);

    const serviceColor = appointment.service?.color
        ? getServiceColor(appointment.service.color).color
        : null;

    const borderColor = serviceColor
        ? serviceColor
        : darkenColor(color, 0.25);

    const start = new Date(appointment.startTime);

    const minutes =
        start.getHours() * 60 +
        start.getMinutes() -
        DAY_START;

    const top = Math.max(
        0,
        minutes * PX_PER_MINUTE
    );

    const end = new Date(appointment.endTime);

    const durationMinutes =
        (end.getTime() - start.getTime()) / 1000 / 60;

    const height =
        durationMinutes * PX_PER_MINUTE;

    const totalColumns =
        appointment.totalColumns || 1;

    const column =
        appointment.column || 0;

    const width =
        100 / totalColumns;

    const left =
        column * width;

    const isSeen =
        !!appointment.seenAt;

    const isCancelled =
        appointment.status === "cancelled";

    const isConfirmed =
        appointment.status === "confirmed";

    const isClientCancelled =
        isCancelled &&
        appointment.cancelledBy === "client";

    return {
        start,
        end,
        top,
        height,
        width,
        left,
        borderColor,
        isSeen,
        isCancelled,
        isConfirmed,
        isClientCancelled,
    };
}

export function handleAppointmentDragStart(
    e,
    appointment,
    {
        setHoverY,
        setHoverDayIndex,
        setDragged,
    }
) {
    setHoverY(null);
    setHoverDayIndex(null);
    setDragged(appointment);

    e.dataTransfer.setData("text/plain", "dragging");
}