import {
    WEEK_DAYS,
    WEEK_DAY_LABELS,
    minutesToTime,
} from "./RegisterHelpers";

function ReviewSection({ title, children }) {
    return (
        <div style={{ marginBottom: 24 }}>
            <div
                style={{
                    fontWeight: 600,
                    marginBottom: 10,
                    borderBottom: "1px solid #eee",
                    paddingBottom: 6,
                }}
            >
                {title}
            </div>

            {children}
        </div>
    );
}

export default function RegisterReview({
    form,
    back,
    handleSubmit,
}) {

    return (
        <>
            {/* <h4>Review</h4>
      <pre>{JSON.stringify(form, null, 2)}</pre> */}

            <div
                style={{
                    width: "100%",
                    maxWidth: 420,
                    margin: "0 auto",
                    textAlign: "left",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 20,
                    marginBottom: 20,
                }}
            >
                <h3 style={{ marginTop: 0 }}>Review your information</h3>

                <ReviewSection title="Basic information">
                    <div><strong>First name:</strong> {form.basic.firstName}</div>
                    <div><strong>Middle name:</strong> {form.basic.middleName || "-"}</div>
                    <div><strong>Last name:</strong> {form.basic.lastName}</div>
                    <div><strong>Email:</strong> {form.basic.email}</div>
                    <div><strong>Phone:</strong> {form.basic.phone}</div>
                </ReviewSection>

                <ReviewSection title="Profile">
                    <div><strong>Gender:</strong> {form.profile.gender || "-"}</div>
                    <div><strong>Birth date:</strong> {form.profile.birthDate || "-"}</div>
                    <div><strong>Country:</strong> {form.profile.country || "-"}</div>
                    <div><strong>City:</strong> {form.profile.city || "-"}</div>
                    <div><strong>Address:</strong> {form.profile.address || "-"}</div>
                </ReviewSection>

                <ReviewSection title="Categories">
                    <div>
                        <strong>Total:</strong> {form.practice.categories.length}
                    </div>

                    {form.practice.categories.map((category, index) => (
                        <div
                            key={index}
                            style={{
                                marginTop: 10,
                                padding: 10,
                                border: "1px solid #e5e7eb",
                                borderLeft: `6px solid ${category.color}`,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                borderRadius: 6,
                                background: "#fafafa",
                            }}
                        >
                            <div style={{ fontWeight: 600 }}>
                                {category.name || "(Unnamed category)"}
                            </div>

                            {category.description && (
                                <div style={{ marginTop: 4 }}>
                                    {category.description}
                                </div>
                            )}

                            <div
                                style={{
                                    marginTop: 10,
                                    paddingTop: 8,
                                    borderTop: "1px solid #eee",
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        marginBottom: 6,
                                        fontSize: 13,
                                    }}
                                >
                                    Services
                                </div>

                                {category.services.map((service, serviceIndex) => (
                                    <div
                                        key={serviceIndex}
                                        style={{
                                            marginBottom: 6,
                                            paddingLeft: 12,
                                        }}
                                    >

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: 12,
                                                padding: "6px 0",
                                            }}
                                        >
                                            <div>
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        width: 14,
                                                        height: 14,
                                                        borderRadius: "50%",
                                                        background: service.color,
                                                        marginRight: 10,
                                                        verticalAlign: "middle",
                                                        border: "1px solid rgba(0,0,0,0.12)",
                                                        boxShadow:
                                                            "inset 0 2px 2px rgba(255,255,255,0.45), 0 1px 3px rgba(0,0,0,0.25)",
                                                    }}
                                                />

                                                <strong
                                                    style={{
                                                        fontSize: 15,
                                                    }}
                                                >
                                                    {service.name || "(Unnamed service)"}
                                                </strong>
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: "#666",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {service.defaultDurationMinutes} min
                                                {" • "}
                                                {service.defaultPrice || "-"} {service.currency}
                                                {" • "}
                                                📍{service.locations.join(", ")}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </ReviewSection>

                <ReviewSection title="Locations">
                    {form.practice.locations.map((location) => (
                        <div
                            key={location.id}
                            style={{
                                marginBottom: 12,
                                padding: 12,
                                border: "1px solid #e5e7eb",
                                borderRadius: 6,
                                background: "#fafafa",
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: 600,
                                    marginBottom: 8,
                                }}
                            >
                                📍{location.number} {location.name}
                            </div>

                            <div>
                                <strong>Type:</strong> {location.type}
                            </div>

                            <div>
                                <strong>Country:</strong> {location.country}
                            </div>

                            <div>
                                <strong>City:</strong> {location.city}
                            </div>

                            <div>
                                <strong>Address:</strong> {location.address}
                            </div>

                            {location.notes && (
                                <div>
                                    <strong>Notes:</strong> {location.notes}
                                </div>
                            )}
                        </div>
                    ))}
                </ReviewSection>

                <ReviewSection title="🕒 Working Hours">
                    <div
                        style={{
                            overflowX: "auto",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 13,
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        background: "#f8f9fa",
                                    }}
                                >
                                    <th
                                        style={{
                                            textAlign: "left",
                                            padding: 8,
                                            border: "1px solid #e5e7eb",
                                            minWidth: 150,
                                        }}
                                    >
                                        Location
                                    </th>

                                    {WEEK_DAYS.map((day) => (
                                        <th
                                            key={day}
                                            style={{
                                                padding: 8,
                                                border: "1px solid #e5e7eb",
                                                minWidth: 90,
                                            }}
                                        >
                                            {WEEK_DAY_LABELS[day]}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {form.practice.locations.map((location) => (
                                    <tr key={location.id}>
                                        <td
                                            style={{
                                                padding: 8,
                                                border: "1px solid #e5e7eb",
                                                verticalAlign: "top",
                                                fontWeight: 600,
                                            }}
                                        >
                                            📍{location.number} {location.name}
                                        </td>

                                        {WEEK_DAYS.map((day) => (
                                            <td
                                                key={day}
                                                style={{
                                                    padding: 8,
                                                    border: "1px solid #e5e7eb",
                                                    verticalAlign: "top",
                                                    fontSize: 12,
                                                }}
                                            >
                                                {location.workingHours[day].length === 0 ? (
                                                    <span style={{ color: "#999" }}>—</span>
                                                ) : (
                                                    location.workingHours[day].map(
                                                        (interval, index) => (
                                                            <div
                                                                key={index}
                                                                style={{
                                                                    marginBottom: 4,
                                                                }}
                                                            >
                                                                {interval.start}–{interval.end}
                                                            </div>
                                                        )
                                                    )
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ReviewSection>
            </div>

            <button onClick={back}>Back</button>

            <button
                onClick={() => {
                    handleSubmit();
                }}
                style={{
                    marginLeft: 10,
                    padding: "10px 20px",
                    background: "green",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                Complete Registration
            </button>
        </>
    );
}