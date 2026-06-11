import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import style from "./ReviewRecords.module.css";


export default function ReviewRecords() {
    const [records, setRecords] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState("");

    const [recordType, setRecordType] = useState("");
    const [recordDetails, setRecordDetails] = useState("");
    const [recordDate, setRecordDate] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState("");

    useEffect(() => {
        const fetchAssigned = async () => {
            if (!user?.accessToken) return;
            let doctorId = null;
            try {
                doctorId = jwtDecode(user.accessToken)?.medic_id;
            } catch (e) {
                console.warn("Could not decode token for medic_id", e);
            }

            try {
                const resp = await fetch(`http://localhost:8080/api/patients/get/by/${doctorId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();
                setPatients(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching patients:", err);
            }
        };
        fetchAssigned();
    }, [user, selectedPatientId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        setSubmitSuccess("");
        if (!selectedPatientId) {
            setSubmitError("Selectați un pacient");
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                patientId: selectedPatientId,
                eventtype: recordType,
                details: recordDetails,
                eventdata: recordDate,
                createdBy: user?.accessToken ? jwtDecode(user.accessToken)?.medic_name ?? jwtDecode(user.accessToken)?.medic_id ?? "Medic" : "Medic",
            };


            console.log("Sending medical record payload:", payload);
            const resp = await fetch(`http://localhost:8080/api/patients/${selectedPatientId}/medical-events/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", 
                    Authorization: user?.accessToken ? `Bearer ${user.accessToken}` : undefined,
                },
                body: JSON.stringify(payload),
            });

            const respText = await resp.text();
            console.log("Medical record response status:", resp.status);
            console.log("Medical record response body:", respText);
            if (!resp.ok) {
                throw new Error(respText || `HTTP ${resp.status}`);
            }

            setSubmitSuccess("Medical record added (placeholder).");
            setRecordType("");
            setRecordDetails("");
            setRecordDate("");
        } catch (err) {
            console.error("Error adding medical record:", err);
            setSubmitError(err.message || "Eroare la trimitere");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={style.container}>
            <div className={style.card}>
                <h2 className={style.title}>Add Medical Record</h2>
                <p className={style.subtitle}>Select a patient and fill in the medical details.</p>

                <form className={style.form} onSubmit={handleSubmit}>
                    <label className={style.label}>Patient</label>
                    <select className={style.select} value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
                        <option value="">Choose...</option>
                        {patients.map((p) => (
                            <option key={p.id ?? p.patientId} value={p.id ?? p.patientId}>{p.name ?? p.fullName ?? (p.patientId ?? p.id)}</option>
                        ))}
                    </select>

                    <label className={style.label}>Tip</label>
                    <input className={style.input} value={recordType} onChange={(e) => setRecordType(e.target.value)} placeholder="Ex: Diagnostic, Observație" />

                    <label className={style.label}>Detalii</label>
                    <textarea className={style.textarea} value={recordDetails} onChange={(e) => setRecordDetails(e.target.value)} rows={4} />

                    <label className={style.label}>Data</label>
                    <input type="date" className={style.input} value={recordDate} onChange={(e) => setRecordDate(e.target.value)} />

                    {submitError && <div className={style.error}>{submitError}</div>}
                    {submitSuccess && <div className={style.success}>{submitSuccess}</div>}

                    <div className={style.formRow}>
                        <button type="submit" className={style.buttonPrimary} disabled={submitting}>{submitting ? "Se trimite..." : "Adaugă record"}</button>
                        <button type="button" className={style.buttonSecondary} onClick={() => { setRecordType(""); setRecordDetails(""); setRecordDate(""); setSubmitError(""); setSubmitSuccess(""); }}>Curăță</button>
                    </div>
                </form>
            </div>
        </div>
    );
}