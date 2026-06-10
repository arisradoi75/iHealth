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