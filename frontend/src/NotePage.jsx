import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { updateAppointment } from "./api";

export default function NotePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState("");
  const [initialNotes, setInitialNotes] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  
  // LOAD
  useEffect(() => {
    fetch(`${API_URL}/appointments/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        const value = data.notes ?? "";
        setNotes(value);
        setInitialNotes(value);
      });
  }, [id]);

  // CHANGE CHECK
  const hasChanges = notes !== initialNotes;

  const handleSave = async () => {
  await updateAppointment(localStorage.getItem("token"), id, {
    notes,
  });

  navigate("/", { state: { reload: true } });
};

  // CANCEL
  const handleCancel = () => {
    if (hasChanges) {
      const ok = window.confirm("Има незапазени промени. Сигурен ли си?");
      if (!ok) return;
    }

    navigate("/");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Note</h2>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ width: "100%", height: 200 }}
      />

      <br /><br />

      <button onClick={handleSave}>Save</button>

      <button onClick={handleCancel} style={{ marginLeft: 10 }}>
        Cancel
      </button>
    </div>
  );
}