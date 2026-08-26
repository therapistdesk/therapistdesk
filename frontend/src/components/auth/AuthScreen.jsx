export default function AuthScreen({
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  handleForgotPassword,
  onRegister,
}) {
  return (
    <div style={{ padding: 40 }}>
      <h1>TherapistDesk</h1>

      <div
        style={{
          fontSize: 18,
          color: "#666",
          marginBottom: 24,
        }}
      >
        Вход за терапевти
      </div>

      {/* <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /> */}

      <div
        style={{
          width: "100%",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 14,
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          E-mail
        </div>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
        />
      </div>

      {/* <br /><br /> */}

      {/* <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /> */}

      <div
        style={{
          width: "100%",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 14,
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          Парола
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Въведете парола"
        />
      </div>

      {/* <br /><br /> */}

      <button onClick={handleLogin}>Login</button>

      {/* <br /><br /> */}

      <div
        onClick={handleForgotPassword}
        style={{
          marginTop: 16,
          textAlign: "center",
          color: "#2563eb",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        Забравена парола?
      </div>

      {/* <br /><br /> */}

      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          fontSize: 14,
        }}
      >
        Нямате акаунт?{" "}
        <span
          onClick={onRegister}
          style={{
            color: "#2563eb",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Регистрация
        </span>
      </div>
    </div>
  );
}