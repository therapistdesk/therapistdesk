import { t } from "../../translations";

export default function TopBar({
    therapist,
    moveMode,
    lang,
    setLang,
    setMode,
}) {
    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    <img
                        src="/Therapistdesk-logo.png"
                        alt="TherapistDesk"
                        style={{
                            width: 180,
                            height: "auto",
                            display: "block",
                        }}
                    />

                    <div>
                        {t("welcome", lang)}, {therapist?.firstName} {therapist?.lastName}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <button onClick={() => setMode("settings-home")}>
                        ⚙️ Settings
                    </button>

                    <select
                        value={lang}
                        onChange={(e) => {
                            const value = e.target.value;
                            setLang(value);
                            localStorage.setItem("lang", value);
                        }}
                        style={{
                            padding: "6px 8px",
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            cursor: "pointer",
                        }}
                    >
                        <option value="bg">🇧🇬 BG</option>
                        <option value="en">🇬🇧 EN</option>
                    </select>

                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.reload();
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {moveMode && (
                <div
                    style={{
                        background: "#fff3cd",
                        padding: 8,
                        marginBottom: 8,
                        border: "1px solid #ffeeba",
                    }}
                >
                    Moving: {moveMode.client?.name}
                </div>
            )}
        </>
    );
}