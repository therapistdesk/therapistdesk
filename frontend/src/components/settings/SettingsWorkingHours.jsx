import { useEffect, useRef, useState } from "react";

import Button from "../common/Button";
import SaveStatus from "../common/SaveStatus";
import WorkingDayCard from "../../register/WorkingDayCard";
import { WEEK_DAY_LABELS } from "../../register/RegisterHelpers";
import {
    timeToMinutes,
    minutesToTime,
    sortWorkingIntervals,
} from "../../register/RegisterHelpers";

const WEEK_DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

function buildWorkingHours(location) {
    const workingHours = {};

    WEEK_DAYS.forEach((day) => {
        workingHours[day] = [];
    });

    if (!location?.workingIntervals) {
        return workingHours;
    }

    location.workingIntervals.forEach((interval) => {
        workingHours[interval.day].push({
            id: interval.id,
            start: minutesToTime(interval.startMinutes),
            end: minutesToTime(interval.endMinutes),
            type: interval.type,
        });
    });

    WEEK_DAYS.forEach((day) => {
        workingHours[day].sort((a, b) =>
            a.start.localeCompare(b.start)
        );
    });

    return workingHours;
}

export default function SettingsWorkingHours({
    settings,
    loadSettings,
}) {
    const [editedLocations, setEditedLocations] = useState([]);
    const [workingHours, setWorkingHours] = useState({});

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [selectedLocationId, setSelectedLocationId] = useState("");
    const selectedLocationIdRef = useRef("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!settings?.practiceLocations) return;

        setEditedLocations(settings.practiceLocations);

        const hours = {};

        settings.practiceLocations.forEach((location) => {
            hours[location.id] = buildWorkingHours(location);
        });

        setWorkingHours(hours);

        if (settings.practiceLocations.length > 0) {
            const currentId = selectedLocationIdRef.current;

            const exists = settings.practiceLocations.some(
                (location) =>
                    String(location.id) === String(currentId)
            );

            const nextId = exists
                ? currentId
                : settings.practiceLocations[0].id;

            selectedLocationIdRef.current = nextId;
            setSelectedLocationId(nextId);
        }
    }, [settings]);



    const selectedLocation =
        editedLocations.find(
            (location) => String(location.id) === String(selectedLocationId)
        ) || null;

    const workingLocation = selectedLocation
        ? {
            ...selectedLocation,
            workingHours: workingHours[selectedLocation.id] || {},
        }
        : null;

    function handleAddInterval(locationId, day) {
        setWorkingHours((current) => {
            const locationWorkingHours = current[locationId] || {};
            const intervals = locationWorkingHours[day] || [];

            let start = "09:00";

            if (intervals.length > 0) {
                const lastInterval = intervals[intervals.length - 1];

                const nextStart =
                    timeToMinutes(lastInterval.end) + 60;

                if (nextStart > 23 * 60) {
                    if (lastInterval.end === "23:00") {
                        start = "23:00";
                    } else {
                        return current;
                    }
                } else {
                    start = minutesToTime(nextStart);
                }
            }

            const endMinutes = Math.min(
                timeToMinutes(start) + 60,
                23 * 60 + 59
            );

            const end = minutesToTime(endMinutes);

            return {
                ...current,
                [locationId]: {
                    ...locationWorkingHours,
                    [day]: sortWorkingIntervals([
                        ...intervals,
                        {
                            id: `new-${Date.now()}`,
                            start,
                            end,
                            type: "work",
                        },
                    ]),
                },
            };
        });
    }

    function handleUpdateInterval(
        locationId,
        day,
        index,
        field,
        value
    ) {
        setWorkingHours((current) => {
            const locationWorkingHours = current[locationId] || {};
            const intervals = locationWorkingHours[day] || [];

            const updatedIntervals = intervals.map((interval, i) =>
                i === index
                    ? {
                        ...interval,
                        [field]: value,
                    }
                    : interval
            );

            return {
                ...current,
                [locationId]: {
                    ...locationWorkingHours,
                    [day]: sortWorkingIntervals(updatedIntervals),
                },
            };
        });
    }

    function handleRemoveInterval(locationId, day, index) {
        setWorkingHours((current) => {
            const locationWorkingHours = current[locationId] || {};
            const intervals = locationWorkingHours[day] || [];

            return {
                ...current,
                [locationId]: {
                    ...locationWorkingHours,
                    [day]: intervals.filter((_, i) => i !== index),
                },
            };
        });
    }

    function handleClearDay(locationId, day) {
        setWorkingHours((current) => {
            const locationWorkingHours = current[locationId] || {};

            return {
                ...current,
                [locationId]: {
                    ...locationWorkingHours,
                    [day]: [],
                },
            };
        });
    }

    function handleCopyDay(locationId, sourceDay, targetDays) {
        setWorkingHours((current) => {
            const locationWorkingHours = current[locationId] || {};
            const sourceIntervals = locationWorkingHours[sourceDay] || [];

            const copiedIntervals = sourceIntervals.map((interval) => ({
                ...interval,
                id: `new-${Date.now()}-${Math.random()}`,
            }));

            const updatedLocationHours = {
                ...locationWorkingHours,
            };

            targetDays.forEach((day) => {
                updatedLocationHours[day] = copiedIntervals.map((interval) => ({
                    ...interval,
                    id: `new-${Date.now()}-${Math.random()}`,
                }));
            });

            return {
                ...current,
                [locationId]: updatedLocationHours,
            };
        });
    }

    const isDirty = () => {
        if (!selectedLocationId) return false;

        const originalLocation = settings?.practiceLocations?.find(
            (location) =>
                String(location.id) === String(selectedLocationId)
        );

        if (!originalLocation) return false;

        const originalHours = buildWorkingHours(originalLocation);
        const currentHours = workingHours[selectedLocationId];

        return (
            JSON.stringify(currentHours) !==
            JSON.stringify(originalHours)
        );
    };

    const handleCancel = () => {
        if (!selectedLocationId) return;

        const originalLocation = settings?.practiceLocations?.find(
            (location) =>
                String(location.id) === String(selectedLocationId)
        );

        if (!originalLocation) return;

        setWorkingHours((current) => ({
            ...current,
            [selectedLocationId]: buildWorkingHours(originalLocation),
        }));

        setMessage("");
        setError("");
    };

    async function handleSave() {
        if (!selectedLocation) return;
        // const savedLocationId = selectedLocation.id;

        setIsSaving(true);
        setMessage("");
        setError("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/settings/working-hours`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        locationId: selectedLocation.id,
                        workingHours: Object.fromEntries(
                            Object.entries(workingHours[selectedLocation.id]).map(
                                ([day, intervals]) => [
                                    day,
                                    intervals.map(({ start, end, type }) => ({
                                        start,
                                        end,
                                        type,
                                    })),
                                ]
                            )
                        ),
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Unable to save working hours."
                );
            }

            setMessage("Working hours saved.");

            await loadSettings();
            // setSelectedLocationId(savedLocationId);

            setTimeout(() => {
                setMessage("");
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                }}
            >
                <h3 style={{ margin: 0 }}>
                    🕒 Working Hours
                </h3>

                <div
                    style={{
                        minWidth: 220,
                        textAlign: "right",
                    }}
                >
                    <SaveStatus
                        message={message}
                        error={error}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">
                    Practice Location: 
                </label>

                <select
                    className="w-full border rounded-lg p-2"
                    value={selectedLocationId}
                    onChange={(e) => {
                        const value = e.target.value;

                        selectedLocationIdRef.current = value;
                        setSelectedLocationId(value);
                    }}
                >
                    {editedLocations.map((location) => (
                        <option
                            key={location.id}
                            value={location.id}
                        >
                            {location.number}. {location.name}
                        </option>
                    ))}
                </select>
            </div>


            {workingLocation && (
                <div className="space-y-4">
                    {Object.keys(WEEK_DAY_LABELS).map((day) => (
                        <WorkingDayCard
                            key={day}
                            day={day}
                            selectedLocation={workingLocation}
                            WEEK_DAY_LABELS={WEEK_DAY_LABELS}
                            onAddInterval={handleAddInterval}
                            onUpdateInterval={handleUpdateInterval}
                            onRemoveInterval={handleRemoveInterval}
                            onCopyDay={handleCopyDay}
                            onClearDay={handleClearDay}
                        />
                    ))}
                </div>
            )}

            <div className="flex justify-end gap-2">
                <Button
                    onClick={handleSave}
                    disabled={!isDirty() || isSaving}
                >
                    💾 Save
                </Button>

                <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={!isDirty() || isSaving}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}