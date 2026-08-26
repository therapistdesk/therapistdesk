import { useState } from "react";

export default function Button({
    children,
    variant = "primary",
    disabled = false,
    loading = false,
    onClick,
    type = "button",
}) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    const colors = {
        primary: {
            background: "#1976d2",
            color: "#fff",
        },
        secondary: {
            background: "#f3f4f6",
            color: "#333",
        },
        danger: {
            background: "#d32f2f",
            color: "#fff",
        },
        success: {
            background: "#2e7d32",
            color: "#fff",
        },
    };

    const style = colors[variant] || colors.primary;

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
                setHovered(false);
                setPressed(false);
            }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                minWidth: 110,
                height: 40,
                padding: "0 18px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.15)",
                background: disabled || loading ? "#e5e7eb" : style.background,
                color: disabled || loading ? "#888" : style.color,
                fontSize: 14,
                fontWeight: 600,
                cursor: disabled || loading ? "not-allowed" : "pointer",
                boxShadow: disabled || loading
                    ? "none"
                    : pressed
                        ? "0 1px 3px rgba(0,0,0,0.25)"
                        : hovered
                            ? "0 6px 12px rgba(0,0,0,0.22)"
                            : "0 2px 6px rgba(0,0,0,0.18)",
                transform: disabled || loading
                    ? "none"
                    : pressed
                        ? "translateY(2px)"
                        : hovered
                            ? "translateY(-1px)"
                            : "translateY(0)",
                transition: "all 0.15s ease",
            }}
        >
            {children}
        </button>
    );
}