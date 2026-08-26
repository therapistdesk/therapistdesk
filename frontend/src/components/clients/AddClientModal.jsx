export default function AddClientModal({
  clientForm,
  setClientForm,
  onSave,
  onCancel,
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 8,
          width: 300,
        }}
      >
        <h3>Add Client</h3>

        <input
          placeholder="Name"
          value={clientForm.name}
          onChange={(e) =>
            setClientForm({
              ...clientForm,
              name: e.target.value,
            })
          }
        />

        <br />
        <br />

        <input
          placeholder="Phone"
          value={clientForm.phone}
          onChange={(e) =>
            setClientForm({
              ...clientForm,
              phone: e.target.value,
            })
          }
        />

        <br />
        <br />

        <input
          placeholder="Email"
          value={clientForm.email}
          onChange={(e) =>
            setClientForm({
              ...clientForm,
              email: e.target.value,
            })
          }
        />

        <br />
        <br />

        <input
          placeholder="Country"
          value={clientForm.country}
          onChange={(e) =>
            setClientForm({
              ...clientForm,
              country: e.target.value,
            })
          }
        />

        <br />
        <br />

        <input
          placeholder="City"
          value={clientForm.city}
          onChange={(e) =>
            setClientForm({
              ...clientForm,
              city: e.target.value,
            })
          }
        />

        <br />
        <br />

        <textarea
          placeholder="Notes"
          value={clientForm.notes}
          onChange={(e) =>
            setClientForm({
              ...clientForm,
              notes: e.target.value,
            })
          }
        />

        <br />
        <br />

        <button onClick={onSave}>
          Save
        </button>

        <button
          onClick={onCancel}
          style={{ marginLeft: 10 }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}