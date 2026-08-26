import { useEffect, useState } from "react";
import Button from "../common/Button";
import SaveStatus from "../common/SaveStatus";

export default function SettingsProfile({
    settings,
    loadSettings,
    onBack,
}) {
    const [form, setForm] = useState(null);
    const [originalForm, setOriginalForm] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!settings) return;

        const profile = {
            ...settings,
            birthDate: settings.birthDate
                ? settings.birthDate.substring(0, 10)
                : "",
        };

        setForm(profile);
        setOriginalForm(profile);
    }, [settings]);

    if (!form) {
        return null;
    }

    function updateField(field, value) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    function handleCancel() {
        setForm(originalForm);
        setMessage("");
        setError("");

        onBack();
    }

    function isDirty() {
        return JSON.stringify(form) !== JSON.stringify(originalForm);
    }

    async function handleSave() {
        setMessage("");
        setError("");
        setSaving(true);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/settings/me`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        firstName: form.firstName,
                        lastName: form.lastName,
                        phone: form.phone,
                        gender: form.gender,
                        birthDate: form.birthDate,
                        bio: form.bio,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Unable to save.");
            }

            await loadSettings(false);

            setOriginalForm({
                ...form,
            });

            setMessage("Profile saved successfully.");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                }}
            >
                <h3 style={{ margin: 0 }}>
                    👤 My Profile
                </h3>

                <SaveStatus
                    message={message}
                    error={error}
                />
            </div>

            <table
                style={{
                    borderSpacing: "12px",
                }}
            >
                <tbody>
                    <tr>
                        <td><b>First name</b></td>
                        <td>
                            <input
                                value={form.firstName || ""}
                                onChange={(e) =>
                                    updateField("firstName", e.target.value)
                                }
                            />
                        </td>
                    </tr>

                    <tr>
                        <td><b>Last name</b></td>
                        <td>
                            <input
                                value={form.lastName || ""}
                                onChange={(e) =>
                                    updateField("lastName", e.target.value)
                                }
                            />
                        </td>
                    </tr>

                    <tr>
                        <td><b>Email</b></td>
                        <td>
                            <input
                                value={form.user?.email || ""}
                                disabled
                            />
                        </td>
                    </tr>

                    <tr>
                        <td><b>Phone</b></td>
                        <td>
                            <input
                                value={form.phone || ""}
                                onChange={(e) =>
                                    updateField("phone", e.target.value)
                                }
                            />
                        </td>
                    </tr>

                    <tr>
                        <td><b>Gender</b></td>
                        <td>
                            <select
                                value={form.gender || ""}
                                onChange={(e) =>
                                    updateField("gender", e.target.value)
                                }
                            >
                                <option value="">-</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </td>
                    </tr>

                    <tr>
                        <td><b>Birth date</b></td>
                        <td>
                            <input
                                type="date"
                                value={form.birthDate || ""}
                                onChange={(e) =>
                                    updateField("birthDate", e.target.value)
                                }
                            />
                        </td>
                    </tr>

                    <tr>
                        <td
                            style={{
                                verticalAlign: "top",
                            }}
                        >
                            <b>About Me</b>
                        </td>

                        <td>
                            <textarea
                                rows={6}
                                style={{
                                    width: 400,
                                }}
                                value={form.bio || ""}
                                onChange={(e) =>
                                    updateField("bio", e.target.value)
                                }
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <div
                style={{
                    marginTop: 24,
                    display: "flex",
                    gap: 10,
                }}
            >
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={!isDirty()}
                    loading={saving}
                >
                    💾 Save
                </Button>

                <Button
                    variant="secondary"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}