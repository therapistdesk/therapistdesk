import {
    WEEK_DAYS,
} from "./RegisterHelpers";

export default function WorkingDayCard({
    day,
    selectedLocation,
    WEEK_DAY_LABELS,

    onAddInterval,
    onUpdateInterval,
    onRemoveInterval,
    onCopyDay,
    onClearDay,
}) {
    return (
        <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
                <strong>{WEEK_DAY_LABELS[day]}</strong>

                <div className="flex gap-2">
                    <button
                        type="button"
                        className="text-sm px-2 py-1 border rounded"
                        onClick={() =>
                            onCopyDay(
                                selectedLocation.id,
                                day,
                                WEEK_DAYS.filter((d) => d !== day)
                            )
                        }
                    >
                        Apply to all days
                    </button>

                    <button
                        type="button"
                        className="text-sm px-2 py-1 border rounded"
                        onClick={() =>
                            onClearDay(
                                selectedLocation.id,
                                day
                            )
                        }
                    >
                        Clear
                    </button>

                    <button
                        type="button"
                        className="text-sm px-2 py-1 border rounded bg-blue-600 text-white"
                        onClick={() =>
                            onAddInterval(
                                selectedLocation.id,
                                day
                            )
                        }
                    >
                        + Add
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {selectedLocation.workingHours[day].map((interval, index) => (
                    <div
                        key={interval.id}
                        className="flex items-center gap-2 flex-wrap"
                    >
                        <input
                            type="time"
                            value={interval.start}
                            className="border rounded p-2 w-32"
                            onChange={(e) =>
                                onUpdateInterval(
                                    selectedLocation.id,
                                    day,
                                    index,
                                    "start",
                                    e.target.value
                                )
                            }
                        />

                        <input
                            type="time"
                            value={interval.end}
                            className="border rounded p-2 w-32"
                            onChange={(e) =>
                                onUpdateInterval(
                                    selectedLocation.id,
                                    day,
                                    index,
                                    "end",
                                    e.target.value
                                )
                            }
                        />

                        <select
                            value={interval.type}
                            className="border rounded p-2 w-32"
                            onChange={(e) =>
                                onUpdateInterval(
                                    selectedLocation.id,
                                    day,
                                    index,
                                    "type",
                                    e.target.value
                                )
                            }
                        >
                            <option value="work">Work</option>
                            <option value="break">Break</option>
                        </select>

                        <button
                            type="button"
                            className="border rounded px-3 py-2 text-red-600 hover:bg-red-50"
                            onClick={() =>
                                onRemoveInterval(
                                    selectedLocation.id,
                                    day,
                                    index
                                )
                            }
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}