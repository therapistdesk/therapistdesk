import { SERVICE_COLORS } from "../../register/RegisterHelpers";
import ServiceColorBadge from "./ServiceColorBadge";

export default function ServiceColorPicker({
    selectedColor,
    usedColors = [],
    onChange,
}) {
    return (
        <div
            style={{
                display: "flex",
                gap: 8,
                marginTop: 8,
            }}
        >
            {SERVICE_COLORS.map((color) => {
                const isSelected = selectedColor === color.id;
                const isUsed =
                    usedColors.includes(color.id) && !isSelected;

                return (
                    <button
                        key={color.id}
                        type="button"
                        disabled={isUsed}
                        onClick={() => onChange(color.id)}
                        title={
                            isUsed
                                ? `${color.id} (already used)`
                                : color.id
                        }
                        style={{
                            border: isSelected
                                ? "2px solid #000"
                                : "1px solid transparent",
                            borderRadius: "50%",
                            padding: 2,
                            background: "transparent",
                            cursor: isUsed
                                ? "not-allowed"
                                : "pointer",
                            opacity: isUsed ? 0.25 : 1,
                        }}
                    >
                        <ServiceColorBadge
                            color={color.id}
                            size={20}
                        />
                    </button>
                );
            })}
        </div>
    );
}