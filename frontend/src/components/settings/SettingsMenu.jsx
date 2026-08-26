export default function SettingsMenu({
  selected,
  onSelect,
}) {
  const items = [
    {
      id: "profile",
      icon: "👤",
      label: "My Profile",
    },
    {
      id: "locations",
      icon: "📍",
      label: "Practice Locations",
    },
    {
      id: "services",
      icon: "🧠",
      label: "Therapeutic Approaches & Services",
    },
    {
      id: "working-hours",
      icon: "🕒",
      label: "Working Hours",
    },
    {
      id: "notifications",
      icon: "🔔",
      label: "Notifications",
      disabled: true,
    },
    {
      id: "security",
      icon: "🔒",
      label: "Security",
      disabled: true,
    },
  ];

  return (
    <div
      style={{
        width: 280,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          disabled={item.disabled}
          onClick={() => onSelect(item.id)}
          style={{
            textAlign: "left",
            padding: "10px 12px",
            borderRadius: 8,
            border:
              selected === item.id
                ? "2px solid #1976d2"
                : "1px solid #ddd",
            background:
              selected === item.id
                ? "#e3f2fd"
                : "#fff",
            cursor: item.disabled
              ? "default"
              : "pointer",
            opacity: item.disabled ? 0.5 : 1,
          }}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  );
}