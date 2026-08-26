export default function ClientContextMenu({
  clientMenu,
  setClientMenu,
  API_URL,
  token,
  getClients,
  setClients,
  appointments,
  t,
  lang,
}) {
  if (!clientMenu) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: clientMenu.y,
        left: clientMenu.x,
        background: "white",
        border: "1px solid #ccc",
        padding: 10,
        zIndex: 9999,
      }}
      onMouseLeave={() => setClientMenu(null)}
    >
      {/* Код */}
      <div
        style={{ cursor: "pointer", marginBottom: 5 }}
        onClick={async () => {
          const clientId = clientMenu.client.id;

          const newAlias = prompt(
            "Въведи код за клиента:",
            clientMenu.client.alias || ""
          );

          if (newAlias === null) return;

          await fetch(`${API_URL}/clients/${clientId}/alias`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ alias: newAlias }),
          });

          const updated = await getClients(token);
          setClients(updated);

          setClientMenu(null);
        }}
      >
        ✏️ Код
      </div>

      {/* DELETE */}
      <div
        style={{ cursor: "pointer", color: "red" }}
        onClick={async () => {
          const clientId = clientMenu.client.id;

          const confirmDelete = window.confirm(
            t("confirmDeleteClient", lang)
          );

          if (!confirmDelete) return;

          const hasAppointments = appointments.some(
            (a) => a.client?.id === c.id && a.status !== "cancelled"
          );

          if (hasAppointments) {
            alert(t("clientHasAppointments", lang));
            setClientMenu(null);
            return;
          }

          await fetch(`${API_URL}/clients/${clientId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json().catch(() => null);

          if (!res.ok) {
            alert(data?.message || "Delete failed");
            return;
          }

          getClients(token).then((data) => {
            if (Array.isArray(data)) {
              // setClients(data);
            } else {
              console.error("Invalid clients response:", data);
              // setClients([]);
            }
          });

          setClientMenu(null);
        }}
      >
        Cancel
      </div>
    </div>
  );
}