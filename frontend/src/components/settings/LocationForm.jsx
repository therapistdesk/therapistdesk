import FieldError from "../common/FieldError";
import TextField from "../common/TextField";

export default function LocationForm({
    location,
    onChange,
    validationErrors = [],
}) {
    const getError = (field) =>
        validationErrors.find(
            (e) => e.field === `practice.locations[0].${field}`
        )?.message;

    const nameError = getError("name");
    const countryError = getError("country");
    const cityError = getError("city");
    const addressError = getError("address");

    return (
        <>
            <div style={{ marginBottom: 15 }}>
                <label>Location Name *</label>

                <input
                    value={location.name}
                    onChange={(e) =>
                        onChange("name", e.target.value)
                    }
                    placeholder="Central Office"
                    style={{
                        width: "100%",
                        marginTop: 5,
                    }}
                />
                <FieldError message={nameError} />
                <div style={{ marginBottom: 15 }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={location.isActive}
                            onChange={(e) =>
                                onChange("isActive", e.target.checked)
                            }
                            style={{ marginRight: 8 }}
                        />
                        Active location
                    </label>
                </div>
            </div>

            <div style={{ marginBottom: 15 }}>
                <label>Country *</label>

                <input
                    value={location.country}
                    onChange={(e) =>
                        onChange("country", e.target.value)
                    }
                    style={{
                        width: "100%",
                        marginTop: 5,
                    }}
                />
                <FieldError message={countryError} />
            </div>

            <div style={{ marginBottom: 15 }}>
                <label>City *</label>

                <input
                    value={location.city}
                    onChange={(e) =>
                        onChange("city", e.target.value)
                    }
                    style={{
                        width: "100%",
                        marginTop: 5,
                    }}
                />
                <FieldError message={cityError} />
            </div>

            <div style={{ marginBottom: 15 }}>
                <label>Address *</label>

                <input
                    value={location.address}
                    onChange={(e) =>
                        onChange("address", e.target.value)
                    }
                    style={{
                        width: "100%",
                        marginTop: 5,
                    }}
                />
                <FieldError message={addressError} />
            </div>

            <div style={{ marginBottom: 15 }}>
                <label>Notes</label>

                <textarea
                    value={location.notes ?? ""}
                    onChange={(e) =>
                        onChange("notes", e.target.value)
                    }
                    rows={3}
                    style={{
                        width: "100%",
                        marginTop: 5,
                        resize: "vertical",
                    }}
                />
            </div>
        </>
    );
}