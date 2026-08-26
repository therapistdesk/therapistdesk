import { useEffect, useState } from "react";
import Button from "../common/Button";
import LocationForm from "./LocationForm";
import SaveStatus from "../common/SaveStatus";
import { validateLocation } from "../../register/RegisterHelpers";

export default function SettingsLocations({
    settings,
    loadSettings,
}) {
    const locations = settings?.practiceLocations;
    const [editedLocations, setEditedLocations] = useState([]);

    useEffect(() => {
        if (locations) {
            setEditedLocations(locations);
        }
    }, [locations]);

    const [editingId, setEditingId] = useState(null);
    const [savingId, setSavingId] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState([]);

    async function handleSave(locationId) {
        const location = editedLocations.find(
            (l) => l.id === locationId
        );

        const errors = validateLocation(location);

        if (errors.length > 0) {
            setValidationErrors(errors);
            setMessage("");
            setError("");
            return;
        }

        setValidationErrors([]);

        // if (!validation.valid) {
        //     setValidationErrors(validation.errors);
        //     setMessage("");
        //     setError("");
        //     return;
        // }

        // setValidationErrors([]);

        // const validation = validateLocations([location]);

        // if (!validation.isValid) {
        //     setMessage("");
        //     setError("Please fill in all required location fields.");
        //     return;
        // }

        const token = localStorage.getItem("token");

        setMessage("");
        setError("");
        setSavingId(locationId);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/settings/locations/${locationId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: location.name,
                        country: location.country,
                        city: location.city,
                        address: location.address,
                        notes: location.notes,
                        isActive: location.isActive,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to save location."
                );
            }

            await loadSettings(false);
            setValidationErrors([]);

            setMessage("Locations saved successfully.");
            setEditingId(null);
        } catch (err) {
            setMessage("");
            setError(err.message);
        } finally {
            setSavingId(null);
        }
    }

    async function handleAddLocation() {
        const token = localStorage.getItem("token");

        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/settings/locations`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to add location."
                );
            }

            await loadSettings(false);

            setMessage("Location added successfully.");
        } catch (err) {
            setMessage("");
            setError(err.message);
        }
    }

    function hasChanges(locationId) {
        const original = settings.practiceLocations.find(
            (l) => l.id === locationId
        );

        const edited = editedLocations.find(
            (l) => l.id === locationId
        );

        if (!original || !edited) {
            return false;
        }

        return (
            original.name !== edited.name ||
            original.country !== edited.country ||
            original.city !== edited.city ||
            original.address !== edited.address ||
            (original.notes ?? "") !== (edited.notes ?? "") ||
            original.isActive !== edited.isActive
        );
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
                    📍 Practice Locations
                </h3>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <SaveStatus
                        message={message}
                        error={error}
                    />

                    <Button
                        variant="primary"
                        onClick={handleAddLocation}
                    >
                        + Add
                    </Button>
                </div>
            </div>

            {!locations || locations.length === 0 ? (
                <p>No practice locations.</p>
            ) : (
                locations.map((location) => (
                    <div
                        key={location.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 12,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <strong>
                                #{location.number} {location.name}
                            </strong>

                            <span
                                style={{
                                    color: location.isActive ? "#2e7d32" : "#777",
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                {location.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>

                        <div>{location.address}</div>

                        {location.city && (
                            <div>{location.city}</div>
                        )}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 8,
                                marginTop: 12,
                            }}
                        >
                            {editingId !== location.id ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setValidationErrors([]);
                                        setEditingId(location.id);
                                    }}
                                >
                                    Edit
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="primary"
                                        disabled={!hasChanges(location.id)}
                                        loading={savingId === location.id}
                                        onClick={() => handleSave(location.id)}
                                    >
                                        💾 Save
                                    </Button>

                                    <Button
                                        variant="secondary"
                                            onClick={() => {
                                            setEditedLocations(settings.practiceLocations);
                                            setEditingId(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </div>

                        {editingId === location.id && (
                            <div style={{ marginTop: 16 }}>
                                <LocationForm
                                    location={
                                        editedLocations.find((l) => l.id === location.id) ?? location
                                    }
                                    onChange={(field, value) => {
                                        setMessage("");
                                        setError("");
                                        setEditedLocations((prev) =>
                                            prev.map((l) =>
                                                l.id === location.id
                                                    ? { ...l, [field]: value }
                                                    : l
                                            )
                                        );
                                    }}
                                    validationErrors={validationErrors}
                                />
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}