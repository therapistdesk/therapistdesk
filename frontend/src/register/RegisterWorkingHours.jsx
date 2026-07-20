import WorkingDayCard from "./WorkingDayCard";

export default function RegisterWorkingHours({
    form,
    selectedLocation,
    selectedLocationId,
    setSelectedLocationId,
    WEEK_DAYS,
    WEEK_DAY_LABELS,

    handleAddWorkingInterval,
    handleUpdateWorkingInterval,
    handleRemoveWorkingInterval,
    handleCopyWorkingDay,
    handleClearWorkingDay,

    back,
    next,
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Working Hours</h2>

            <p className="text-sm text-gray-500">
                Configure the working schedule for each practice location.
            </p>

            <div className="space-y-2">
                <label className="block text-sm font-medium">
                    Practice Location
                </label>

                <select
                    className="w-full border rounded-lg p-2"
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                >
                    <option value="">Select location...</option>

                    {form.practice.locations.map((location) => (
                        <option key={location.id} value={location.id}>
                            {location.name || "Unnamed location"}
                        </option>
                    ))}
                </select>
            </div>

            {selectedLocation && (
                <div className="rounded-lg border p-4 space-y-4">
                    <h3 className="font-medium">{selectedLocation.name}</h3>

                    {WEEK_DAYS.map((day) => (
                        <WorkingDayCard
                            key={day}
                            day={day}
                            selectedLocation={selectedLocation}
                            WEEK_DAY_LABELS={WEEK_DAY_LABELS}

                            onAddInterval={handleAddWorkingInterval}
                            onUpdateInterval={handleUpdateWorkingInterval}
                            onRemoveInterval={handleRemoveWorkingInterval}
                            onCopyDay={handleCopyWorkingDay}
                            onClearDay={handleClearWorkingDay}
                        />
                    ))}
                </div>
            )}

            <div style={{ marginTop: 20 }}>
                <button type="button" onClick={back}>
                    Back
                </button>

                <button
                    type="button"
                    onClick={() => next()}
                    style={{ marginLeft: 10 }}
                >
                    Next
                </button>
            </div>

        </div>
    );
}