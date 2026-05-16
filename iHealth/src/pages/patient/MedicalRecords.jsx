import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import styles from "./MedicalRecords.module.css";

export default function MedicalRecords() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [medicalData, setMedicalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const goToDashboard = () => {
        navigate("/dashboard");
    };

    useEffect(() => {
        if (!user || !user.patientId || !user.accessToken) {
            setError("User data is incomplete");
            setLoading(false);
            return;
        }

        const fetchMedicalRecord = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost:8080/api/patients/${user.patientId}/medical-events/me`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${user.accessToken}`,
                        },
                        method: "GET",
                    }
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Medical records fetched:", data);
                setMedicalData(data);
                setError("");
            } catch (err) {
                console.error("Error fetching medical record:", err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMedicalRecord();
    }, [user]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Medical Records</h2>
                    <p className={styles.subtitle}>Your Medical Events</p>
                </div>

                {loading && (
                    <div className={styles.loadingState}>
                        <p>Loading your medical records...</p>
                    </div>
                )}

                {error && (
                    <div className={styles.emptyState}>
                        <p>Error: {error}</p>
                    </div>
                )}

                {!loading && !error && medicalData && (
                    <div className={styles.recordsContainer}>
                        <div className={styles.recordItem}>
                            <p className={styles.recordLabel}>Event Date</p>
                            <p className={styles.recordValue}>
                                {medicalData.eventData || "N/A"}
                            </p>
                        </div>
                        <div className={styles.recordItem}>
                            <p className={styles.recordLabel}>Event Type</p>
                            <p className={styles.recordValue}>
                                {medicalData.eventType || "N/A"}
                            </p>
                        </div>
                        <div className={styles.recordItem}>
                            <p className={styles.recordLabel}>Details</p>
                            <p className={styles.recordValue}>
                                {medicalData.details || "N/A"}
                            </p>
                        </div>
                        <div className={styles.recordItem}>
                            <p className={styles.recordLabel}>Patient</p>
                            <p className={styles.recordValue}>
                                {medicalData.patient || "N/A"}
                            </p>
                        </div>
                    </div>
                )}

                {!loading && !error && !medicalData && (
                    <div className={styles.emptyState}>
                        <p>No medical records found.</p>
                    </div>
                )}

                <div className={styles.buttonGroup}>
                    <button
                        className={styles.button}
                        onClick={goToDashboard}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}