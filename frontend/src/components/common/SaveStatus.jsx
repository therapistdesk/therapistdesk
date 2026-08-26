export default function SaveStatus({
    message,
    error,
}) {
    return (
        <div>
            {message && (
                <span
                    style={{
                        color: "green",
                        fontWeight: 600,
                    }}
                >
                    ✔ {message}
                </span>
            )}

            {error && (
                <span
                    style={{
                        color: "red",
                        fontWeight: 600,
                    }}
                >
                    ✖ {error}
                </span>
            )}
        </div>
    );
}