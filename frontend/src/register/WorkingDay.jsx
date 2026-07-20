import WorkingIntervalRow from "./WorkingIntervalRow";

export default function WorkingDay({
  day,
  label,
  intervals,

  onAddInterval,
  onCopyDay,
  onClearDay,

  onStartChange,
  onEndChange,
  onTypeChange,
  onDeleteInterval,
}) {
  return (
    <div className="border rounded-xl p-4 space-y-3">

      <div className="flex items-center justify-between">
        <h4 className="font-semibold">
          {label}
        </h4>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCopyDay}
            className="px-3 py-2 border rounded-lg"
          >
            Copy
          </button>

          <button
            type="button"
            onClick={onClearDay}
            className="px-3 py-2 border rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {intervals.map((interval, index) => (
          <WorkingIntervalRow
            key={index}
            interval={interval}
            onStartChange={(value) =>
              onStartChange(index, value)
            }
            onEndChange={(value) =>
              onEndChange(index, value)
            }
            onTypeChange={(value) =>
              onTypeChange(index, value)
            }
            onDelete={() =>
              onDeleteInterval(index)
            }
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddInterval}
        className="w-full border rounded-lg py-2"
      >
        + Add interval
      </button>

    </div>
  );
}