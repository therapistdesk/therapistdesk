export default function CalendarNavigation({
    setCurrentDate,
    selectedClient,
    setShowRecurring,
    selectedDate,
    lang,
}) {
    return (
        <>
            <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                {/* МЕСЕЦ */}
                <button
                    onClick={() => {
                        setCurrentDate((d) => {
                            const newDate = new Date(d);
                            newDate.setMonth(newDate.getMonth() - 1);
                            return newDate;
                        });
                    }}
                >
                    ⏪ Month
                </button>

                <button
                    onClick={() => {
                        setCurrentDate((d) => {
                            const newDate = new Date(d);
                            newDate.setMonth(newDate.getMonth() + 1);
                            return newDate;
                        });
                    }}
                >
                    Month ⏩
                </button>

                {/* СЕДМИЦА */}
                <button
                    onClick={() => {
                        setCurrentDate((d) => {
                            const newDate = new Date(d);
                            newDate.setDate(newDate.getDate() - 7);
                            return newDate;
                        });
                    }}
                >
                    ← Week
                </button>

                <button
                    onClick={() => {
                        setCurrentDate((d) => {
                            const newDate = new Date(d);
                            newDate.setDate(newDate.getDate() + 7);
                            return newDate;
                        });
                    }}
                >
                    Week →
                </button>

                <button onClick={() => setCurrentDate(new Date())}>
                    Today
                </button>

                <button
onClick={() => {
  if (!selectedClient) {
    alert("Select client first");
    return;
  }
  setShowRecurring(true);
}}
                >
                    Recurring
                </button>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (!value) return;

                        setCurrentDate(new Date(value));
                    }}
                />
            </div>
        </>
    );
}