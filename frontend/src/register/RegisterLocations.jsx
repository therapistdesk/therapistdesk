export default function RegisterLocations({
    form,
    handleAddLocation,
    handleRemoveLocation,
    handleUpdateLocation,
    validateLocations,
    back,
    next,
}) {
    return (
        // Постави тук 1:1 целия JSX от Step 4
        <>
            <h3>Practice Locations</h3>

            {form.practice.locations.length > 0 && (
                <div className="info-message">
                    <strong>Note:</strong> After adding your practice locations, return to
                    <strong> Step 3 – Categories &amp; Services</strong> to assign each
                    service to the locations where it is offered.
                </div>
            )}

            <p
                style={{
                    color: "#666",
                    marginBottom: 20,
                }}
            >
                Add all places where you provide your services.
            </p>

            <button
                type="button"
                onClick={handleAddLocation}
                style={{
                    marginBottom: 20,
                }}
            >
                + Add Location
            </button>

            {form.practice.locations.length === 0 && (
                <div
                    style={{
                        padding: 15,
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        background: "#f8f8f8",
                        marginBottom: 20,
                    }}
                >
                    No locations added yet.
                </div>
            )}

            {form.practice.locations.map((location, index) => (
                <div
                    key={index}
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 10,
                        padding: 20,
                        marginBottom: 25,
                        background: "#fff",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 20,
                        }}
                    >
                        <strong>
                            📍{location.number} {location.name || "New location"}
                        </strong>

                        <button
                            type="button"
                            onClick={() =>
                                handleRemoveLocation(location.id)
                            }
                            style={{
                                background: "#d32f2f",
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: 4,
                                cursor: "pointer",
                            }}
                        >
                            Delete
                        </button>
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label>Location Type</label>

                        <select
                            value={location.type}
                            onChange={(e) =>
                                handleUpdateLocation(
                                    location.id,
                                    "type",
                                    e.target.value
                                )
                            }
                            style={{
                                width: "100%",
                                marginTop: 5,
                            }}
                        >
                            <option value="office">
                                Office
                            </option>

                            <option value="online">
                                Online
                            </option>

                            <option value="home_visit">
                                Home Visit
                            </option>

                            <option value="mobile">
                                Mobile
                            </option>
                        </select>
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label>Location Name *</label>

                        <input
                            value={location.name}
                            onChange={(e) =>
                                handleUpdateLocation(
                                    location.id,
                                    "name",
                                    e.target.value
                                )
                            }
                            placeholder="Central Office"
                            style={{
                                width: "100%",
                                marginTop: 5,
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label>Country *</label>

                        <input
                            value={location.country}
                            onChange={(e) =>
                                handleUpdateLocation(
                                    location.id,
                                    "country",
                                    e.target.value
                                )
                            }
                            style={{
                                width: "100%",
                                marginTop: 5,
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label>City *</label>

                        <input
                            value={location.city}
                            onChange={(e) =>
                                handleUpdateLocation(
                                    location.id,
                                    "city",
                                    e.target.value
                                )
                            }
                            style={{
                                width: "100%",
                                marginTop: 5,
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label>Address *</label>

                        <input
                            value={location.address}
                            onChange={(e) =>
                                handleUpdateLocation(
                                    location.id,
                                    "address",
                                    e.target.value
                                )
                            }
                            style={{
                                width: "100%",
                                marginTop: 5,
                            }}
                        />
                    </div>

                    {/*  */}
                    <div style={{ marginBottom: 15 }}>
                        <label>Notes</label>

                        <textarea
                            value={location.notes}
                            onChange={(e) =>
                                handleUpdateLocation(
                                    location.id,
                                    "notes",
                                    e.target.value
                                )
                            }
                            rows={3}
                            style={{
                                width: "100%",
                                marginTop: 5,
                                resize: "vertical",
                            }}
                        />
                    </div>

                </div>
            ))}

            <button onClick={back}>
                Back
            </button>

            <button
                type="button"
                onClick={() => {
                    const result = validateLocations(
                        form.practice.locations
                    );

                    if (!result.valid) {
                        alert(result.errors[0].message);
                        return;
                    }

                    next();
                }}
                style={{
                    marginLeft: 10,
                }}
            >
                Next
            </button>
        </>
    );
}