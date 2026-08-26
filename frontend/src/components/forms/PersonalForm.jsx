import TextField from "../common/TextField";

export default function PersonalForm({
    form,
    handleChange,
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

            <TextField
                placeholder="Country *"
                value={form.profile.country}
                error={form.errors.country}
                onChange={(e) =>
                    handleChange("profile", "country", e.target.value)
                }
            />

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
        </>
    );
}