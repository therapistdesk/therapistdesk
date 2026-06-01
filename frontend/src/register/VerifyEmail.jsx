import { useState } from "react";

export default function VerifyEmail() {
  const [code, setCode] = useState("");

  const handleVerify = async () => {
    const email = localStorage.getItem("verifyEmail");
    const password = localStorage.getItem("verifyPassword");

    console.log("VERIFY START", email, password);

    const res = await fetch("http://localhost:3000/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    console.log("VERIFY RESPONSE:", data);

    if (data.success) {
      const email = localStorage.getItem("verifyEmail");

      try {
        const res = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password, // ⚠️ важно
          }),
        });

        console.log("LOGIN STATUS:", res.status);

        const loginData = await res.json();

        alert("STATUS: " + res.status);
        alert("RESPONSE: " + JSON.stringify(loginData));

        console.log("LOGIN RESPONSE:", loginData);

        if (loginData.access_token) {
          console.log("LOGIN SUCCESS");

          localStorage.setItem("token", loginData.access_token);

          // 👉 трий САМО при успех
          localStorage.removeItem("verifyEmail");
          localStorage.removeItem("verifyPassword");

          window.location.reload();
        } else {
          console.log("LOGIN FAILED:", loginData);
          alert("Login failed after verify");

          // ❗ НЕ трием нищо тук
        }
      } catch (err) {
        console.error("LOGIN ERROR:", err);
        console.error(err);
        alert("Auto login error");
      }
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Verify Email</h2>

      <input
        placeholder="Enter code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <br /><br />

      <button onClick={handleVerify}>Verify</button>
      <br /><br />

      <button
        onClick={async () => {
          const email = localStorage.getItem("verifyEmail");

          await fetch("http://localhost:3000/auth/resend-code", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          alert("New code sent to your email");
        }}
      >
        Resend Code
      </button>
      <br /><br />

      <button
        onClick={() => {
          localStorage.removeItem("verifyEmail");
          window.location.reload();
        }}
      >
        Back to Login
      </button>
    </div>
  );
}