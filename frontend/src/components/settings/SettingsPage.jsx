import { useEffect, useState } from "react";
import SettingsMenu from "./SettingsMenu";
import SettingsProfile from "./SettingsProfile";
import SettingsLocations from "./SettingsLocations";
import Button from "../common/Button";
import SettingsServices from './SettingsServices';
import SettingsWorkingHours from "./SettingsWorkingHours";

export default function SettingsPage({ onBack }) {
    const [selected, setSelected] = useState("profile");
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadSettings(true);
    }, []);

    async function loadSettings(isInitial = false) {
        try {
            if (isInitial) {
                setIsLoading(true);
            } else {
                setIsRefreshing(true);
            }

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/settings/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load settings.");
            }

            const data = await response.json();

            setSettings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            if (isInitial) {
                setIsLoading(false);
            } else {
                setIsRefreshing(false);
            }
        }
    }

    function renderContent() {
        if (isLoading) {
            return <p>Loading...</p>;
        }

        if (error) {
            return <p style={{ color: "red" }}>{error}</p>;
        }
        switch (selected) {
            case "profile":
                if (isLoading) {
                    return <p>Loading...</p>;
                }

                if (error) {
                    return <p style={{ color: "red" }}>{error}</p>;
                }

                return (
                    <SettingsProfile
                        settings={settings}
                        loadSettings={loadSettings}
                    />
                );

            case "locations":
                return (
                    <SettingsLocations
                        settings={settings}
                        loadSettings={loadSettings}
                    />
                );

            case "services":
                return (
                    <SettingsServices
                        settings={settings}
                        loadSettings={loadSettings}
                    />
                );

            case "working-hours":
                return (
                    <SettingsWorkingHours
                        settings={settings}
                        loadSettings={loadSettings}
                    />
                );

            default:
                return null;
        }
    }
    return (
        <div style={{ padding: 20 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                }}
            >
                <h2 style={{ margin: 0 }}>⚙️ Settings</h2>

                <Button
                    variant="secondary"
                    onClick={onBack}
                >
                    ← Back
                </Button>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 24,
                    alignItems: "flex-start",
                    marginTop: 20,
                }}
            >
                <SettingsMenu
                    selected={selected}
                    onSelect={setSelected}
                />

                <div
                    style={{
                        flex: 1,
                        minHeight: 500,
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: 20,
                    }}
                >
                    {renderContent()}
                </div>
            </div>

        </div>
    );
}