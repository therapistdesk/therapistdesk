import { useState, useEffect } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  const handleReset = async () => {
    if (password.length < 8) {
      alert("Min 8 characters");
      return;
    }

    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Password updated. You can now login.");
      window.location.href = "/";
    } else {
      alert("Invalid or expired link.");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleReset}>Set new password</button>
    </div>
  );
}