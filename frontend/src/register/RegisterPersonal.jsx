export default function RegisterPersonal({
    form,
    handleChange,
    back,
    next,
}) {
    return (
        <>
            <div>
                Gender *
            </div>

            <select
                value={form.profile.gender}
                onChange={(e) =>
                    handleChange("profile", "gender", e.target.value)
                }
            >
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>

            <br /><br />

            <input
                placeholder="Birth date"
                value={form.profile.birthDate}
                onChange={(e) =>
                    handleChange("profile", "birthDate", e.target.value)
                }
            />

            <br /><br />

            <input
                placeholder="Country *"
                value={form.profile.country}
                onChange={(e) =>
                    handleChange("profile", "country", e.target.value)
                }
                style={{
                    border:
                        form.errors.country ? "1px solid red" : "1px solid #ccc",
                }}
            />

            {form.errors.country && (
                <div style={{ color: "red", fontSize: 12 }}>
                    {form.errors.country}
                </div>
            )}

            <br />

            <input
                placeholder="City *"
                value={form.profile.city}
                onChange={(e) =>
                    handleChange("profile", "city", e.target.value)
                }
                style={{
                    border:
                        form.errors.city ? "1px solid red" : "1px solid #ccc",
                }}
            />

            {form.errors.city && (
                <div style={{ color: "red", fontSize: 12 }}>
                    {form.errors.city}
                </div>
            )}

            <br /><br />

            <input
                placeholder="Address"
                value={form.profile.address}
                onChange={(e) =>
                    handleChange("profile", "address", e.target.value)
                }
            />

            <br /><br />

            <button onClick={back}>Back</button>
            <button onClick={next}>Next</button>
        </>
    );
}