import FieldError from "./FieldError";

export default function TextField({
    label,
    value,
    onChange,
    name,
    placeholder = "",
    required = false,
    disabled = false,
    error,
    autoFocus = false,
}) {
    return (
        <div style={{ marginBottom: 16 }}>
            {label && (
                <label
                    style={{
                        display: "block",
                        marginBottom: 6,
                        fontWeight: 600,
                    }}
                >
                    {label}
                    {required && (
                        <span style={{ color: "red" }}> *</span>
                    )}
                </label>
            )}

            <input
                type="text"
                name={name}
                value={value ?? ""}
                placeholder={placeholder}
                disabled={disabled}
                autoFocus={autoFocus}
                onChange={onChange}
                style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: error
                        ? "1px solid red"
                        : "1px solid #ccc",
                    borderRadius: 6,
                    boxSizing: "border-box",
                    fontSize: "1rem",
                }}
            />

            <FieldError message={error} />
        </div>
    );
}