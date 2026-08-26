import { SERVICE_COLORS } from "../../register/RegisterHelpers";

export default function ServiceColorBadge({ color, size = 16 }) {
    const selected = SERVICE_COLORS.find(c => c.id === color);

    return (
        <span
            title={selected?.id}
            style={{
                display: "inline-block",
                width: size,
                height: size,
                borderRadius: "50%",
                background: selected?.color ?? "#ccc",
                border: "1px solid #999",
                flexShrink: 0,
            }}
        />
    );
}