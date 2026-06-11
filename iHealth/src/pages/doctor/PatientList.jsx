import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useAuth from "../../hooks/useAuth.js";
import styles from "./PatientList.module.css";

export default function PatientList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignedPatients, setAssignedPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Recommendation form state (non-invasive addition)
    const [recType, setRecType] = useState("");
    const [recDetails, setRecDetails] = useState("");
    const [submittingRec, setSubmittingRec] = useState(false);
    const [submitRecError, setSubmitRecError] = useState("");
    const [submitRecSuccess, setSubmitRecSuccess] = useState("");
    // recommendation list state for selected patient
    const [patientRecommendations, setPatientRecommendations] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const [recsError, setRecsError] = useState("");

    const doctorId = user?.accessToken
        ? jwtDecode(user.accessToken).medic_id
        : null;

    const fetchAssignedPatients = useCallback(async () => {
        if (!doctorId) {
            setError("Doctor data unavailable. Please login again.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const token = user.accessToken;
            const response = await fetch(
                `http://localhost:8080/api/patients/get/by/${doctorId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAssignedPatients(Array.isArray(data) ? data : []);
        } catch (fetchError) {
            setError(`Error fetching assigned patients: ${fetchError.message}`);
        } finally {
            setLoading(false);
        }
    }, [doctorId, user?.accessToken]);

    useEffect(() => {
        if (!user || !user.accessToken) {
            navigate("/login");
            return;
        }

        fetchAssignedPatients();
    }, [user, navigate, fetchAssignedPatients]);

    const handleSelectPatient = (patient) => {
        setSelectedPatient((currentPatient) =>
            currentPatient?.id === patient.id ? null : patient
        );
    };

    const renderPatientField = (label, value) => (
        <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{label}</span>
            <span className={styles.detailValue}>{value || "N/A"}</span>
        </div>
    );

    const detailPatient = selectedPatient || {};

    const formatAddress = (address) => {
    if (!address) return "N/A";
    const { street, number, city, county, country, zipCode } = address;
    return [street, number, city, county, country, zipCode]
        .filter(Boolean) 
        .join(", ");
};

    // fetch recommendations for the currently selected patient
    async function fetchPatientRecs() {
        if (!selectedPatient) {
            setPatientRecommendations([]);
            setRecsError("");
            return;
        }
        setLoadingRecs(true);
        setRecsError("");
        try {
            const patientId = selectedPatient.id ?? selectedPatient.patientId;
            const resp = await fetch(`http://localhost:8080/api/patients/recommendations/for-patient/${patientId}`, {
                method: "GET",
                headers: {
                    Authorization: user?.accessToken ? `Bearer ${user.accessToken}` : undefined,
                    "Content-Type": "application/json",
                },
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            setPatientRecommendations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching patient recommendations:", err);
            setRecsError(err.message || "Eroare la încărcare recomandări");
        } finally {
            setLoadingRecs(false);
        }
    }

    useEffect(() => {
        fetchPatientRecs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPatient]);

   

       const handleSubmitRecommendation = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSubmitRecError("");
    setSubmitRecSuccess("");
    setSubmittingRec(true);
    console.log("Submitting recommendation for patient:", selectedPatient);
    const patientId = selectedPatient.id ?? selectedPatient.patientId;
    try {
        const payload = {
            patientId: selectedPatient.id ?? selectedPatient.patientId,
            recommendationType: recType.toLowerCase().trim(),
            details: recDetails,
            createdBy: user?.accessToken ? jwtDecode(user.accessToken)?.medic_name ?? jwtDecode(user.accessToken)?.medic_id ?? "Medic" : "Medic",
        };
        
        const resp = await fetch(`http://localhost:8080/api/patients/recommendations/for-patient/${patientId}/doctor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.accessToken}`
            },
            body: JSON.stringify(payload),
        });
        if (!resp.ok) {
            const txt = await resp.text();
            throw new Error(txt || `HTTP ${resp.status}`);
        }
        setSubmitRecSuccess("Recomandarea a fost trimisă ");
        setRecType("");
        setRecDetails("");
        setSubmittingRec(false);
    } catch (err) {
        console.error("Error submitting recommendation:", err);
        setSubmitRecError(err.message || "Eroare la trimitere");
        setSubmittingRec(false);
    }
};

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Assigned Patients</h1>
                    <p className={styles.subtitle}>
                        Here are the patients already assigned to you.
                        Click on a patient to see their details.
                    </p>
                    
                </div>
                <button className={styles.refreshButton} onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>

                <button className={styles.refreshButton} onClick={fetchAssignedPatients}>
                    Refresh
                </button>
            </div>
            
            {loading ? (
                <div className={styles.statusCard}>Loading patients...</div>
            ) : error ? (
                <div className={styles.statusCard}>{error}</div>
            ) : (
                <div className={styles.gridLayout}>
                    <div className={styles.listPanel}>
                        <div className={styles.panelHeader}>Patient List</div>
                        {assignedPatients.length === 0 ? (
                            <div className={styles.emptyState}>
                                No assigned patients at the moment.
                            </div>
                        ) : (
                            <div className={styles.patientList}>
                                {assignedPatients.map((patient, index) => {
                                    const patientKey = patient.patientId ?? patient.id ?? index;
                                    const isActive = selectedPatient?.id === patient.id;
                                    return (
                                        <button
                                            key={patientKey}
                                            type="button"
                                            className={`${styles.patientItem} ${
                                                isActive ? styles.activePatient : ""
                                            }`}
                                            onClick={() => handleSelectPatient(patient)}
                                        >
                                            <div className={styles.patientMeta}>
                                                <span className={styles.patientName}>
                                                    {patient.name || "Patient without name"}
                                                </span>
                                                <span className={styles.patientBadge}>
                                                    {patient.cnp || "Unknown CNP"}
                                                </span>
                                            </div>
                                            <span className={styles.patientSmallText}>
                                                {patient.bornDate || patient.birthDate || "Unknown birth date"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className={styles.detailsPanel}>
                        <div className={styles.panelHeader}>Patient Details</div>
                        {selectedPatient ? (
                            <div className={styles.detailsCard}>
                                <p className={styles.detailsHeading}>
                                    {detailPatient.name || "Selected patient"}
                                </p>
                                {renderPatientField("CNP", detailPatient.cnp)}
                                {renderPatientField("Birth Date", detailPatient.bornDate || detailPatient.birthDate)}
                                {renderPatientField("Email", detailPatient.email)}
                                {renderPatientField("Phone", detailPatient.phone)}
                                {renderPatientField("Address", formatAddress(detailPatient.address))}
                                {renderPatientField("Gender", detailPatient.gender)}
                                {renderPatientField("Notes", detailPatient.notes || detailPatient.details)}

                                <div className={styles.recSection}>
                                    <h4 className={styles.recHeader}>Adaugă recomandare</h4>
                                    <form className={styles.recForm} onSubmit={handleSubmitRecommendation}>
                                        <label className={styles.inputLabel}>Tip recomandare</label>
                                        <input className={styles.input} value={recType} onChange={(e) => setRecType(e.target.value)} placeholder="Ex: Dietă, Tratament, Exerciții" />

                                        <label className={styles.inputLabel}>Detalii</label>
                                        <textarea className={styles.textarea} value={recDetails} onChange={(e) => setRecDetails(e.target.value)} rows={4} placeholder="Detalii recomandare" />

                                        {submitRecError && <div className={styles.formError}>{submitRecError}</div>}
                                        {submitRecSuccess && <div className={styles.successMessage}>{submitRecSuccess}</div>}

                                        <div className={styles.formRow}>
                                            <button type="submit" className={styles.buttonPrimary} disabled={submittingRec}>{submittingRec ? "Se trimite..." : "Adaugă recomandare"}</button>
                                            <button type="button" className={styles.buttonSecondary} onClick={() => { setRecType(""); setRecDetails(""); setSubmitRecError(""); setSubmitRecSuccess(""); }}>Curăță</button>
                                        </div>
                                    </form>
                                </div>

                                <div className={styles.recListSection}>
                                    <h4 className={styles.recListHeader}>Recomandări pacient</h4>
                                    {loadingRecs ? (
                                        <div className={styles.statusCard}>Se încarcă recomandările...</div>
                                    ) : recsError ? (
                                        <div className={styles.formError}>{recsError}</div>
                                    ) : patientRecommendations.length === 0 ? (
                                        <div className={styles.emptyState}>Nu există recomandări pentru acest pacient.</div>
                                    ) : (
                                        <div className={styles.recList}>
                                            {patientRecommendations.map((r, idx) => {
                                                const rid = r.id ?? r.recId ?? r._id ?? idx;
                                                return (
                                                    <div key={rid} className={styles.recItem}>
                                                        <div className={styles.recItemHeader}>
                                                            <div className={styles.recLabelSmall}>{r.recommendationType ?? "N/A"}</div>
                                                    
                                                        </div>
                                                        <div className={styles.recText}>{r.details ?? "-"}</div>
                                                        <div className={styles.metaRow}>
                                                            <div className={styles.metaLeft}>{r.author ?? ""}</div>
                                                            <div className={styles.metaRight}>{r.date ?? ""}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.emptyDetails}>
                                Select a patient from the list to see their details.
                            </div>
                        )}
                    </div>
                    
                </div>
                
            )}

            
        </div>
    );
}