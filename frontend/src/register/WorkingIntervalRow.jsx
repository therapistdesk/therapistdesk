export default function WorkingIntervalRow({
  interval,
  onStartChange,
  onEndChange,
  onTypeChange,
  onDelete,
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="time"
        value={interval.start}
        onChange={(e) => onStartChange(e.target.value)}
        className="border rounded-lg px-2 py-2 w-32"
      />

      <input
        type="time"
        value={interval.end}
        onChange={(e) => onEndChange(e.target.value)}
        className="border rounded-lg px-2 py-2 w-32"
      />

      <select
        value={interval.type}
        onChange={(e) => onTypeChange(e.target.value)}
        className="border rounded-lg px-2 py-2 w-32"
      >
        <option value="work">Work</option>
        <option value="break">Break</option>
      </select>

      <button
        type="button"
        onClick={onDelete}
        className="px-3 py-2 border rounded-lg hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}