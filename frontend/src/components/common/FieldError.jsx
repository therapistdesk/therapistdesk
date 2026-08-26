export default function FieldError({ message }) {
    if (!message) {
        return null;
    }

    return (
        <div
            style={{
                color: "#d32f2f",
                fontSize: 13,
                marginTop: 4,
            }}
        >
            {message}
        </div>
    );
}