import PersonalForm from "../components/forms/PersonalForm";

export default function RegisterPersonal({
    form,
    handleChange,
    back,
    next,
}) {
    return (
        <>
            <PersonalForm
                form={form}
                handleChange={handleChange}
            />

            <br />

            <button onClick={back}>Back</button>
            <button onClick={next}>Next</button>
        </>
    );
}