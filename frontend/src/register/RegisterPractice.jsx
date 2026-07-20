import {
    SERVICE_COLORS,
    getServiceColor,
    getUsedServiceColors,
} from "./RegisterHelpers";

export default function RegisterPractice({
    form,
    handleAddCategory,
    handleRemoveCategory,
    handleUpdateCategory,
    handleAddService,
    handleRemoveService,
    handleUpdateService,
    validatePractice,
    next,
    back,
}) {
    const usedColors = getUsedServiceColors(form.practice);
    return (
        // Тук поставяш 1:1 съдържанието от Step 3
        <>
            <h3>Categories & Services</h3>

            {form.practice.locations.length === 0 && (
                <div className="info-message">
                    <strong>Note:</strong> No practice locations have been added yet.
                    Add your locations in <strong>Step 4 – Practice Locations</strong>,
                    then return here to assign each service to the locations where it is
                    offered.
                </div>
            )}

            <button
                type="button"
                onClick={handleAddCategory}
                style={{ marginBottom: 20 }}
            >
                + Add Category
            </button>

            {form.practice.categories.length === 0 && (
                <div
                    style={{
                        padding: 15,
                        background: "#f5f5f5",
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        marginBottom: 20,
                    }}
                >
                    No categories added yet.
                </div>
            )}

            {form.practice.categories.map((category, index) => (
                <div
                    key={index}
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: 15,
                        marginBottom: 20,
                    }}
                >
                    <div style={{ fontWeight: "bold", marginBottom: 10 }}>
                        Category {index + 1}
                    </div>

                    <div style={{ marginBottom: 10 }}>
                        <button
                            type="button"
                            onClick={() => handleRemoveCategory(index)}
                            style={{
                                background: "#d32f2f",
                                color: "white",
                                border: "none",
                                padding: "6px 12px",
                                cursor: "pointer",
                                borderRadius: 4,
                            }}
                        >
                            Delete Category
                        </button>
                    </div>

                    <input
                        placeholder="Category name"
                        value={category.name}
                        onChange={(e) =>
                            handleUpdateCategory(index, "name", e.target.value)
                        }
                        style={{
                            width: "100%",
                            marginBottom: 10,
                        }}
                    />

                    <textarea
                        placeholder="Description"
                        value={category.description}
                        onChange={(e) =>
                            handleUpdateCategory(index, "description", e.target.value)
                        }
                        rows={3}
                        style={{
                            width: "100%",
                            marginBottom: 10,
                        }}
                    />

                    <div
                        style={{
                            background: "#fafafa",
                            padding: 10,
                            borderRadius: 6,
                            border: "1px dashed #ccc",
                        }}
                    >
                        <div
                            style={{
                                fontWeight: "bold",
                                marginBottom: 10,
                            }}
                        >
                            Services
                        </div>

                        {category.services.map((service, serviceIndex) => (
                            <div
                                key={serviceIndex}
                                style={{
                                    padding: 10,
                                    marginBottom: 10,
                                    border: "1px solid #ddd",
                                    borderRadius: 6,
                                    background: "#fff",
                                }}
                            >
                                <>
                                    <div
                                        style={{
                                            fontWeight: "bold",
                                            marginBottom: 10,
                                        }}
                                    >
                                        Service {serviceIndex + 1}
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: "50%",
                                                border: "1px solid #ccc",
                                                background: getServiceColor(service.color).color,
                                            }}
                                        />

                                        <span>{service.color}</span>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 8,
                                            flexWrap: "wrap",
                                            marginBottom: 12,
                                        }}
                                    >
                                        {/* блока с палитрата */}
                                        {SERVICE_COLORS.map((color) => {
                                            const isSelected = service.color === color.id;

                                            const isUsed =
                                                usedColors.includes(color.id) && !isSelected;

                                            return (
                                                <button
                                                    key={color.id}
                                                    type="button"
                                                    disabled={isUsed}
                                                    onClick={() =>
                                                        handleUpdateService(
                                                            index,
                                                            serviceIndex,
                                                            "color",
                                                            color.id
                                                        )
                                                    }
                                                    title={
                                                        isUsed
                                                            ? `${color.id} (already used)`
                                                            : color.id
                                                    }
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: "50%",
                                                        border: isSelected
                                                            ? "3px solid #000"
                                                            : "1px solid #ccc",
                                                        background: color.color,
                                                        cursor: isUsed
                                                            ? "not-allowed"
                                                            : "pointer",
                                                        opacity: isUsed ? 0.25 : 1,
                                                        padding: 0,
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>

                                    <input
                                        placeholder="Service name"
                                        value={service.name}
                                        onChange={(e) =>
                                            handleUpdateService(
                                                index,
                                                serviceIndex,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            marginBottom: 10,
                                        }}
                                    />

                                    <input
                                        type="number"
                                        placeholder="Duration (minutes)"
                                        value={service.defaultDurationMinutes}
                                        onChange={(e) =>
                                            handleUpdateService(
                                                index,
                                                serviceIndex,
                                                "defaultDurationMinutes",
                                                e.target.value
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            marginBottom: 10,
                                        }}
                                    />

                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={service.defaultPrice}
                                        onChange={(e) =>
                                            handleUpdateService(
                                                index,
                                                serviceIndex,
                                                "defaultPrice",
                                                e.target.value
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            marginBottom: 10,
                                        }}
                                    />

                                    <div style={{ marginBottom: 12 }}>
                                        <strong>Available locations</strong>

                                        {form.practice.locations.map((location) => (
                                            <label
                                                key={location.id}
                                                style={{
                                                    display: "block",
                                                    marginTop: 6,
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={service.locations.includes(location.number)}
                                                    onChange={(e) => {
                                                        const locations = e.target.checked
                                                            ? [...service.locations, location.number]
                                                            : service.locations.filter((number) => number !== location.number)

                                                        handleUpdateService(
                                                            index,
                                                            serviceIndex,
                                                            "locations",
                                                            locations
                                                        );
                                                    }}
                                                />

                                                {" "}
                                                {location.number}. {location.name}
                                            </label>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: 10 }}>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveService(index, serviceIndex)}
                                            style={{
                                                background: "#d32f2f",
                                                color: "white",
                                                border: "none",
                                                padding: "6px 12px",
                                                cursor: "pointer",
                                                borderRadius: 4,
                                            }}
                                        >
                                            Delete Service
                                        </button>
                                    </div>

                                </>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => handleAddService(index)}
                        >
                            + Add Service
                        </button>
                    </div>
                </div>
            ))}

            <button onClick={back}>Back</button>

            <button
                type="button"
                onClick={() => {
                    const result = validatePractice(form.practice);

                    if (!result.valid) {
                        alert(result.errors[0].message);
                        return;
                    }

                    next();
                }}
                style={{ marginLeft: 10 }}
            >
                Next
            </button>
        </>

    );
}