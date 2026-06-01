import { useState } from "react";

export default function RegisterApp({ onBack }) {
  // console.log("REGISTER COMPONENT RENDERED");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const TOTAL_STEPS = 3;
  const [form, setForm] = useState({
    basic: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },

    profile: {
      gender: "male",
      birthDate: "",
      country: "",
      city: "",
      address: "",
      photo: null,
      logo: null,
    },

    therapies: [],
    certificates: [],

    workingHours: {},

    notifications: {
      message1: "Имате насрочена среща при ... за ...",
      time1: 1440,
      message2: "",
      time2: 90,
    },

    errors: {},
  });

  const next = () => {
    const errors = {};

    // STEP 1
    if (step === 1) {
      if (!form.basic.firstName.trim()) errors.firstName = "Required";
      if (!form.basic.lastName.trim()) errors.lastName = "Required";
      if (!form.basic.email.trim()) {
        errors.email = "Required";
      } else if (!/\S+@\S+\.\S+/.test(form.basic.email)) {
        errors.email = "Invalid email";
      }
      if (!form.basic.phone.trim()) errors.phone = "Required";
      if (form.basic.password.length < 8)
        errors.password = "Min 8 chars";
      if (form.basic.password !== form.basic.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    <div style={{ fontSize: 12, color: "#666", marginTop: 10 }}>
      Fill the form and click Next to continue registration
    </div>

    // STEP 2
    if (step === 2) {
      if (!form.profile.country.trim()) {
        errors.country = "Required";
      }

      if (!form.profile.city.trim()) {
        errors.city = "Required";
      }
    }

    if (Object.keys(errors).length > 0) {
      setForm((prev) => ({
        ...prev,
        errors,
      }));
      return;
    }

    setStep((s) => (s < TOTAL_STEPS ? s + 1 : s));
  };

  const back = () => setStep((s) => (s > 1 ? s - 1 : s));

  const handleChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
      errors: {
        ...prev.errors,
        [field]: "",
      },
    }));
  };
  const getPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return "weak";
    if (score === 2 || score === 3) return "medium";
    return "strong";
  };

  const handleSubmit = async () => {
    console.log("SUBMIT START");

    const payload = {
      email: form.basic.email,
      password: form.basic.password,

      firstName: form.basic.firstName,
      lastName: form.basic.lastName,
      phone: form.basic.phone,

      gender: form.profile.gender,
      birthDate: form.profile.birthDate,

      country: form.profile.country,
      city: form.profile.city,
      address: form.profile.address,
    };

    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("STATUS:", res.status);

      const data = await res.json();
      console.log("REGISTER RESPONSE:", data);

      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.requiresVerification) {
        console.log("SAVE EMAIL:", form.basic.email);
        localStorage.setItem("verifyEmail", form.basic.email);
        localStorage.setItem("verifyPassword", form.basic.password);
        window.location.reload();
        return;
      }

      alert("Unexpected response");
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      throw err;
      alert("Register failed");
    }
  };

  return (
    <div style={{ padding: 30, maxWidth: 500, margin: "0 auto" }}>
      <h2>Register Therapist</h2>
      <div>Step {step} of 6</div>

      {step === 1 && (
        <>
          <input
            placeholder="First name *"
            value={form.basic.firstName}
            onChange={(e) =>
              handleChange("basic", "firstName", e.target.value)
            }
            style={{
              border: form.errors.firstName
                ? "1px solid red"
                : "1px solid #ccc",
            }}
          />
          <br /><br />
          {form.errors.firstName && (
            <div style={{ color: "red", fontSize: 12 }}>
              {form.errors.firstName}
            </div>
          )}
          <input
            placeholder="Middle name"
            value={form.basic.middleName}
            onChange={(e) =>
              handleChange("basic", "middleName", e.target.value)
            }
          />
          <br /><br />
          <input
            placeholder="Last name *"
            value={form.basic.lastName}
            onChange={(e) =>
              handleChange("basic", "lastName", e.target.value)
            }
            style={{
              border: form.errors.lastName
                ? "1px solid red"
                : "1px solid #ccc",
            }}
          />
          <br /><br />
          <input
            placeholder="Email *"
            value={form.basic.email}
            onChange={(e) =>
              handleChange("basic", "email", e.target.value)
            }
            style={{
              border: form.errors.email
                ? "1px solid red"
                : "1px solid #ccc",
            }}
          />
          <br /><br />
          {form.errors.email && (
            <div style={{ color: "red", fontSize: 12 }}>
              {form.errors.email}
            </div>
          )}
          <input
            placeholder="Phone *"
            value={form.basic.phone}
            onChange={(e) =>
              handleChange("basic", "phone", e.target.value)
            }
            style={{
              border: form.errors.phone
                ? "1px solid red"
                : "1px solid #ccc",
            }}
          />
          <br /><br />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password *"
            value={form.basic.password}
            onChange={(e) =>
              handleChange("basic", "password", e.target.value)
            }
            style={{
              border: form.errors.password
                ? "1px solid red"
                : "1px solid #ccc",
            }}
          />
          <br /><br />
          <button type="button" onClick={() => setShowPassword((s) => !s)}>
            {showPassword ? "Hide" : "Show"}
          </button>
          <div style={{ fontSize: 12 }}>
            Strength: {getPasswordStrength(form.basic.password)}
          </div>
          {form.errors.password && (
            <div style={{ color: "red", fontSize: 12 }}>
              {form.errors.password}
            </div>
          )}

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm password *"
            onChange={(e) =>
              handleChange("basic", "confirmPassword", e.target.value)
            }
          />

          {form.errors.confirmPassword && (
            <div style={{ color: "red", fontSize: 12 }}>
              {form.errors.confirmPassword}
            </div>
          )}

          <button onClick={next}>Next</button>
        </>
      )}

      <button
        onClick={() => {
          window.location.reload();
        }}
      >
        Back to Login
      </button>

      {step === 2 && (
        <>
          <div>
            Gender *
          </div>

          <select
            value={form.profile.gender}
            onChange={(e) =>
              handleChange("profile", "gender", e.target.value)
            }
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <br /><br />

          <input
            placeholder="Birth date"
            value={form.profile.birthDate}
            onChange={(e) =>
              handleChange("profile", "birthDate", e.target.value)
            }
          />

          <br /><br />

          <input
            placeholder="Country *"
            value={form.profile.country}
            onChange={(e) =>
              handleChange("profile", "country", e.target.value)
            }
            style={{
              border:
                form.errors.country ? "1px solid red" : "1px solid #ccc",
            }}
          />

          {form.errors.country && (
            <div style={{ color: "red", fontSize: 12 }}>
              {form.errors.country}
            </div>
          )}

          <br />

          <input
            placeholder="City *"
            value={form.profile.city}
            onChange={(e) =>
              handleChange("profile", "city", e.target.value)
            }
            style={{
              border:
                form.errors.city ? "1px solid red" : "1px solid #ccc",
            }}
          />

          {form.errors.city && (
            <div style={{ color: "red", fontSize: 12 }}>
              {form.errors.city}
            </div>
          )}

          <br /><br />

          <input
            placeholder="Address"
            value={form.profile.address}
            onChange={(e) =>
              handleChange("profile", "address", e.target.value)
            }
          />

          <br /><br />

          <button onClick={back}>Back</button>
          <button onClick={next}>Next</button>
        </>
      )}
      <div style={{ fontSize: 12, color: "#666", marginTop: 10 }}>
        Almost done — click Next to review your data
      </div>

      {step === 3 && (
        <>
          <h4>Review</h4>
          <pre>{JSON.stringify(form, null, 2)}</pre>

          <button onClick={back}>Back</button>

          <button
            onClick={() => {
              console.log("CLICK REGISTER");

              handleSubmit();
            }}
            style={{
              marginLeft: 10,
              padding: "10px 20px",
              background: "green",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </>
      )}

      <div style={{ marginBottom: 10, fontWeight: "bold" }}>
        Review your data and click Register to finish
      </div>

      <br />
      {onBack && <button onClick={onBack}>Back to Login</button>}
    </div>

  );

}
