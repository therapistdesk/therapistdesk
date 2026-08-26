import ServiceColorPicker from "../common/ServiceColorPicker";
import Button from "../common/Button";

export default function ServiceForm({
    service,
    categoryId,
    onChange,
    onRemove,
    usedColors,
}) {
    return (
        <div
            style={{
                borderTop: '1px solid #eee',
                padding: '10px 0',
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <input
                    type="text"
                    value={service.name ?? ""}
                    onChange={(e) =>
                        onChange(
                            categoryId,
                            service.id,
                            "name",
                            e.target.value
                        )
                    }
                    style={{
                        flex: 1,
                        fontWeight: "bold",
                        fontSize: "1rem",
                        padding: "4px 6px",
                        boxSizing: "border-box",
                    }}
                />

                <Button
                    variant="danger"
                    onClick={() => onRemove(categoryId, service.id)}
                >
                    Delete
                </Button>
            </div>

            <div style={{ marginTop: 8 }}>
                <input
                    type="number"
                    min={1}
                    value={service.defaultDurationMinutes ?? ""}
                    onChange={(e) =>
                        onChange(
                            categoryId,
                            service.id,
                            "defaultDurationMinutes",
                            Number(e.target.value)
                        )
                    }
                    style={{
                        width: 80,
                    }}
                />
                <span style={{ marginLeft: 6 }}>min</span>
            </div>

            <div style={{ marginTop: 8 }}>
                <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={service.defaultPrice ?? ""}
                    onChange={(e) =>
                        onChange(
                            categoryId,
                            service.id,
                            "defaultPrice",
                            Number(e.target.value)
                        )
                    }
                    style={{
                        width: 100,
                    }}
                />

                <span style={{ marginLeft: 6 }}>
                    {service.currency}
                </span>
            </div>

            <div style={{ marginTop: 8 }}>
                <textarea
                    rows={2}
                    value={service.description ?? ""}
                    onChange={(e) =>
                        onChange(
                            categoryId,
                            service.id,
                            "description",
                            e.target.value
                        )
                    }
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        resize: "vertical",
                    }}
                />
            </div>

            <ServiceColorPicker
                selectedColor={service.color}
                usedColors={usedColors}
                onChange={(color) =>
                    onChange(
                        categoryId,
                        service.id,
                        "color",
                        color
                    )
                }
            />

        </div>
    );
}