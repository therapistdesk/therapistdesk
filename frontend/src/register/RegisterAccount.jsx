export default function RegisterAccount({
    form,
    handleChange,
    showPassword,
    setShowPassword,
    getPasswordStrength,
    TOTAL_STEPS,
    next,
    handleSubmit,
    errorMessage,
    successMessage,
}) {
    return (
        <>
            <div style={{ marginBottom: 18 }}>
                <input
                    placeholder="First name *"
                    value={form.basic.firstName}
                    onChange={(e) =>
                        handleChange("basic", "firstName", e.target.value)
                    }
                    style={{
                        width: "100%",
                        maxWidth: 320,
                        padding: "10px 12px",
                        fontSize: 15,
                        borderRadius: 8,
                        boxSizing: "border-box",
                        border: form.errors.firstName
                            ? "1px solid red"
                            : "1px solid #ccc",
                    }}
                />

                {form.errors.firstName && (
                    <div
                        style={{
                            color: "red",
                            fontSize: 12,
                            marginTop: 4,
                        }}
                    >
                        {form.errors.firstName}
                    </div>
                )}
            </div>

            <div style={{ marginBottom: 18 }}>
                <input
                    placeholder="Middle name"
                    value={form.basic.middleName}
                    onChange={(e) =>
                        handleChange("basic", "middleName", e.target.value)
                    }
                    style={{
                        width: "100%",
                        maxWidth: 320,
                        padding: "10px 12px",
                        fontSize: 15,
                        borderRadius: 8,
                        boxSizing: "border-box",
                        border: "1px solid #ccc",
                    }}
                />
            </div>

            <div style={{ marginBottom: 18 }}>
                <input
                    placeholder="Last name *"
                    value={form.basic.lastName}
                    onChange={(e) =>
                        handleChange("basic", "lastName", e.target.value)
                    }
                    style={{
                        width: "100%",
                        maxWidth: 320,
                        padding: "10px 12px",
                        fontSize: 15,
                        borderRadius: 8,
                        boxSizing: "border-box",
                        border: form.errors.lastName
                            ? "1px solid red"
                            : "1px solid #ccc",
                    }}
                />

                {form.errors.lastName && (
                    <div
                        style={{
                            color: "red",
                            fontSize: 12,
                            marginTop: 4,
                        }}
                    >
                        {form.errors.lastName}
                    </div>
                )}
            </div>

            <div style={{ marginBottom: 18 }}>
                <input
                    placeholder="Email *"
                    value={form.basic.email}
                    onChange={(e) =>
                        handleChange("basic", "email", e.target.value)
                    }
                    style={{
                        width: "100%",
                        maxWidth: 320,
                        padding: "10px 12px",
                        fontSize: 15,
                        borderRadius: 8,
                        boxSizing: "border-box",
                        border: form.errors.email
                            ? "1px solid red"
                            : "1px solid #ccc",
                    }}
                />

                {form.errors.email && (
                    <div
                        style={{
                            color: "red",
                            fontSize: 12,
                            marginTop: 4,
                        }}
                    >
                        {form.errors.email}
                    </div>
                )}
            </div>

            <div style={{ marginBottom: 18 }}>
                <input
                    placeholder="Phone *"
                    value={form.basic.phone}
                    onChange={(e) =>
                        handleChange("basic", "phone", e.target.value)
                    }
                    style={{
                        width: "100%",
                        maxWidth: 320,
                        padding: "10px 12px",
                        fontSize: 15,
                        borderRadius: 8,
                        boxSizing: "border-box",
                        border: form.errors.phone
                            ? "1px solid red"
                            : "1px solid #ccc",
                    }}
                />

                {form.errors.phone && (
                    <div
                        style={{
                            color: "red",
                            fontSize: 12,
                            marginTop: 4,
                        }}
                    >
                        {form.errors.phone}
                    </div>
                )}
            </div>

            <div style={{ marginBottom: 18 }}>
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password *"
                    value={form.basic.password}
                    onChange={(e) =>
                        handleChange("basic", "password", e.target.value)
                    }
                    style={{
                        width: "100%",
                        maxWidth: 320,
                        padding: "10px 12px",
                        fontSize: 15,
                        borderRadius: 8,
                        boxSizing: "border-box",
                        border: form.errors.password
                            ? "1px solid red"
                            : "1px solid #ccc",
                    }}
                />

                <div style={{ marginTop: 8 }}>
                    <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>

                <div
                    style={{
                        fontSize: 12,
                        color: "#666",
                        marginTop: 6,
                    }}
                >
                    Strength: {getPasswordStrength(form.basic.password)}
                </div>

                {form.errors.password && (
                    <div
                        style={{
                            color: "red",
                            fontSize: 12,
                            marginTop: 4,
                        }}
                    >
                        {form.errors.password}
                    </div>
                )}
            </div>

            <div style={{ marginBottom: 18 }}>
                <input
                    type="password"
                    placeholder="Confirm password *"
                    value={form.basic.confirmPassword}
                    onChange={(e) =>
                        handleChange("basic", "confirmPassword", e.target.value)
                    }
                    style={{
                        width: "100%",
                        maxWidth: 320,
                        padding: "10px 12px",
                        fontSize: 15,
                        borderRadius: 8,
                        boxSizing: "border-box",
                        border: form.errors.confirmPassword
                            ? "1px solid red"
                            : "1px solid #ccc",
                    }}
                />

                {form.errors.confirmPassword && (
                    <div
                        style={{
                            color: "red",
                            fontSize: 12,
                            marginTop: 4,
                        }}
                    >
                        {form.errors.confirmPassword}
                    </div>
                )}
            </div>

            <button
                onClick={() => {
                    if (TOTAL_STEPS === 1) {
                        handleSubmit();
                    } else {
                        next();
                    }
                }}
            >
                {TOTAL_STEPS === 1 ? "Create account" : "Next"}
            </button>

            {errorMessage && (
                <div
                    style={{
                        marginTop: 12,
                        color: "#dc2626",
                        fontSize: 14,
                        textAlign: "center",
                        maxWidth: 320,
                    }}
                >
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div
                    style={{
                        marginTop: 12,
                        color: "#16a34a",
                        fontSize: 14,
                        textAlign: "center",
                        maxWidth: 320,
                    }}
                >
                    {successMessage}
                </div>
            )}
        </>
    );
}