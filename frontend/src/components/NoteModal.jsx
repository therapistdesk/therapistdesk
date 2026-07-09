import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";

export default function NoteModal({
    open,
    appointment,
    onClose,
    onSave,
}) {
    const [text, setText] = useState("");
    const textareaRef = useRef(null);

    useEffect(() => {
        if (appointment) {
            setText(appointment.notes || "");
        }
    }, [appointment]);

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => {
                textareaRef.current?.focus();
            });
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <div style={{ padding: 20, minWidth: 450 }}>
                <h3>Бележки</h3>

                <textarea
                    ref={textareaRef}
                    value={text}
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === "Enter") {
                            onSave(text);
                        }
                    }}
                    onChange={(e) => setText(e.target.value)}
                    rows={12}
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        resize: "vertical",
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 10,
                        marginTop: 15,
                    }}
                >
                    <button onClick={onClose}>Cancel</button>

                    <button
                        onClick={() => {
                            console.log("BUTTON CLICK");
                            onSave(text);
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </Modal>
    );
}