import { useState } from "react";
import {
  addCategory,
  updateCategory,
  removeCategory,

  addService,
  updateService,
  removeService,

  validatePractice,

  addLocation,
  updateLocation,
  removeLocation,

  validateLocations,
  createDefaultWorkingHours,
  WEEK_DAYS,
  WEEK_DAY_LABELS,
  addWorkingInterval,
  updateWorkingInterval,
  removeWorkingInterval,
  copyWorkingDay,
  clearWorkingDay,
  validateWorkingHours,
  sortPracticeWorkingHours,
} from "./RegisterHelpers";

import RegisterWorkingHours from "./RegisterWorkingHours";
import RegisterAccount from "./RegisterAccount";
import RegisterPersonal from "./RegisterPersonal";
import RegisterPractice from "./RegisterPractice";
import RegisterLocations from "./RegisterLocations";
import RegisterReview from "./RegisterReview";

export default function RegisterApp({ onBack }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const TOTAL_STEPS = 6;
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

    practice: {
      categories: [],
      locations: [],
      certificates: [],
      workingHours: createDefaultWorkingHours(),
    },

    settings: {
      reminderOffsets: [1440, 90],
    },

    errors: {},
  });

  const [selectedLocationId, setSelectedLocationId] = useState("");
  const selectedLocation = form.practice.locations.find(
    (location) => location.id === selectedLocationId
  );

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
    // <div style={{ fontSize: 12, color: "#666", marginTop: 10 }}>
    //   Fill the form and click Next to continue registration
    // </div>

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

  const handleAddCategory = () => {
    setForm((prev) => ({
      ...prev,
      practice: addCategory(prev.practice),
    }));
  };

  const handleUpdateCategory = (
    index,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      practice: updateCategory(
        prev.practice,
        index,
        field,
        value
      ),
    }));
  };

  const handleRemoveCategory = (categoryIndex) => {
    setForm((prev) => ({
      ...prev,
      practice: removeCategory(
        prev.practice,
        categoryIndex
      ),
    }));
  };

  const handleAddService = (categoryIndex) => {
    setForm((prev) => ({
      ...prev,
      practice: addService(
        prev.practice,
        categoryIndex
      ),
    }));
  };

  const handleUpdateService = (
    categoryIndex,
    serviceIndex,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      practice: updateService(
        prev.practice,
        categoryIndex,
        serviceIndex,
        field,
        value
      ),
    }));
  };

  const handleRemoveService = (
    categoryIndex,
    serviceIndex
  ) => {
    setForm((prev) => ({
      ...prev,
      practice: removeService(
        prev.practice,
        categoryIndex,
        serviceIndex
      ),
    }));
  };

  const handleAddLocation = () => {
    setForm((prev) => ({
      ...prev,
      practice: addLocation(prev.practice),
    }));
  };

  const handleUpdateLocation = (
    locationId,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      practice: updateLocation(
        prev.practice,
        locationId,
        field,
        value
      ),
    }));
  };

  const handleRemoveLocation = (locationId) => {
    setForm((prev) => ({
      ...prev,
      practice: removeLocation(
        prev.practice,
        locationId
      ),
    }));
  };

  const handleAddWorkingInterval = (
    locationId,
    day
  ) => {
    setForm((prev) => ({
      ...prev,
      practice: addWorkingInterval(
        prev.practice,
        locationId,
        day
      ),
    }));
  };

  const handleUpdateWorkingInterval = (
    locationId,
    day,
    intervalIndex,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      practice: updateWorkingInterval(
        prev.practice,
        locationId,
        day,
        intervalIndex,
        field,
        value
      ),
    }));
  };

  const handleRemoveWorkingInterval = (
    locationId,
    day,
    intervalIndex
  ) => {
    setForm((prev) => ({
      ...prev,
      practice: removeWorkingInterval(
        prev.practice,
        locationId,
        day,
        intervalIndex
      ),
    }));
  };

  const handleCopyWorkingDay = (
    locationId,
    sourceDay,
    targetDays
  ) => {

    setForm((prev) => ({
      ...prev,
      practice: copyWorkingDay(
        prev.practice,
        locationId,
        sourceDay,
        targetDays
      ),
    }));
  };

  const handleClearWorkingDay = (
    locationId,
    day
  ) => {
    setForm((prev) => ({
      ...prev,
      practice: clearWorkingDay(
        prev.practice,
        locationId,
        day
      ),
    }));
  };

  const handleSubmit = async () => {
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
      practice: form.practice,
    };

    try {
      setErrorMessage("");
      setSuccessMessage("");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.message === "User already exists") {
          setErrorMessage("An account with this e-mail already exists.");
        } else {
          setErrorMessage(data.message || "Registration failed.");
        }
        return;
      }

      if (data.requiresVerification) {


        localStorage.setItem("verifyEmail", form.basic.email);
        localStorage.setItem("verifyPassword", form.basic.password);

        setSuccessMessage(
          "Registration successful. Verification code sent to your e-mail."
        );

        setTimeout(() => {
          window.location.reload();
        }, 1500);

        return;
      }
      // ✅ TEST MODE
      setSuccessMessage("Registration successful.");

      setTimeout(() => {
        localStorage.removeItem("verifyEmail");
        localStorage.removeItem("verifyPassword");
        onBack();
      }, 1000);

    } catch (err) {
      console.error("REGISTER ERROR:", err);
      throw err;
      alert("Register failed");
    }
  };

  const handleWorkingHoursNext = () => {
    const sortedPractice = sortPracticeWorkingHours(
      form.practice
    );

    const result = validateWorkingHours(
      sortedPractice.locations
    );

    if (!result.valid) {
      alert(result.errors[0].message);
      return;
    }

    setForm((prev) => ({
      ...prev,
      practice: sortedPractice,
    }));

    next();
  };

  return (
    <div style={{ padding: 30, maxWidth: 500, margin: "0 auto" }}>
      <h2>Register Therapist</h2>
      <div>Step {step} of 6</div>

      {step === 1 && (
        <RegisterAccount
          form={form}
          handleChange={handleChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          getPasswordStrength={getPasswordStrength}
          TOTAL_STEPS={TOTAL_STEPS}
          next={next}
          handleSubmit={handleSubmit}
          errorMessage={errorMessage}
          successMessage={successMessage}
        />
      )}

      {step === 2 && (
        <RegisterPersonal
          form={form}
          handleChange={handleChange}
          back={back}
          next={next}
        />
      )}


      {step === 4 && (
        <RegisterPractice
          form={form}
          handleAddCategory={handleAddCategory}
          handleRemoveCategory={handleRemoveCategory}
          handleUpdateCategory={handleUpdateCategory}
          handleAddService={handleAddService}
          handleRemoveService={handleRemoveService}
          handleUpdateService={handleUpdateService}
          validatePractice={validatePractice}
          next={next}
          back={back}
        />
      )}

      {step === 3 && (
        <RegisterLocations
          form={form}
          handleAddLocation={handleAddLocation}
          handleRemoveLocation={handleRemoveLocation}
          handleUpdateLocation={handleUpdateLocation}
          validateLocations={validateLocations}
          back={back}
          next={next}
        />
      )}

      {step === 5 && (
        <RegisterWorkingHours
          form={form}
          selectedLocation={selectedLocation}
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}

          WEEK_DAYS={WEEK_DAYS}
          WEEK_DAY_LABELS={WEEK_DAY_LABELS}

          handleAddWorkingInterval={handleAddWorkingInterval}
          handleUpdateWorkingInterval={handleUpdateWorkingInterval}
          handleRemoveWorkingInterval={handleRemoveWorkingInterval}
          handleCopyWorkingDay={handleCopyWorkingDay}
          handleClearWorkingDay={handleClearWorkingDay}

          back={back}
          next={handleWorkingHoursNext}
        />
      )}

      {step === 6 && (
        <RegisterReview
          form={form}
          back={back}
          handleSubmit={handleSubmit}
        />
      )}

      {/* <div style={{ marginBottom: 10, fontWeight: "bold" }}>
        Review your data and click Register to finish
      </div> */}

      <br />
      {onBack && <button onClick={onBack}>Back to Login</button>}
    </div>

  );

}
