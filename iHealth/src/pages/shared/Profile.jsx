import React from "react";
import useAuth from "../../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    const [patientData, setPatientData] = React.useState({
        name: "",
        bornDate: "",
        cnp: "",
        gender: "",
        phone: "",
        email: "",
        profesion: "",
        job: "",
    });

    const goToDashboard = () => {
        navigate("/dashboard");
    };
    
    async function fetchPatientData() {
        try {
            setLoading(true);
            const token = JSON.parse(localStorage.getItem("user")).accessToken;
            const response = await fetch(`http://localhost:8080/api/patients/me`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setPatientData(data);
            setError("");
        } catch (error) {
            console.error("Error fetching patient data:", error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        fetchPatientData();
    }, [user, navigate]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Profilul Meu</h1>
                    <p className={styles.subtitle}>Informații Personale</p>
                </div>

                {loading && (
                    <div className={styles.loadingState}>
                        <p>Se încarcă informațiile...</p>
                    </div>
                )}

                {error && (
                    <div className={styles.emptyState}>
                        <p>Error: {error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className={styles.profileContainer}>
                        <div className={styles.profileItem}>
                            <p className={styles.profileLabel}>Nume</p>
                            <p className={styles.profileValue}>
                                {patientData.name || "N/A"}
                            </p>
                        </div>
                        <div className={styles.profileItem}>
                            <p className={styles.profileLabel}>Data Nașterii</p>
                            <p className={styles.profileValue}>
                                {patientData.bornDate || "N/A"}
                            </p>
                        </div>
                        <div className={styles.profileItem}>
                            <p className={styles.profileLabel}>CNP</p>
                            <p className={styles.profileValue}>
                                {patientData.cnp || "N/A"}
                            </p>
                        </div>
                        <div className={styles.profileItem}>
                            <p className={styles.profileLabel}>Gen</p>
                            <p className={styles.profileValue}>
                                {patientData.gender || "N/A"}
                            </p>
                        </div>
                        <div className={styles.profileItem}>
                            <p className={styles.profileLabel}>Telefon</p>
                            <p className={styles.profileValue}>
                                {patientData.phone || "N/A"}
                            </p>
                        </div>
                        <div className={styles.profileItem}>
                            <p className={styles.profileLabel}>Email</p>
                            <p className={styles.profileValue}>
                                {patientData.email || "N/A"}
                            </p>
                        </div>
                        <div className={styles.profileItem}>
                            <p className={styles.profileLabel}>Profesie</p>
                            <p className={styles.profileValue}>
                                {patientData.profesion || "N/A"}
                            </p>
                        </div>
                        <div className={styles.profileItem}>
                            <p className={styles.profileLabel}>Loc de Muncă</p>
                            <p className={styles.profileValue}>
                                {patientData.job || "N/A"}
                            </p>
                        </div>
                    </div>
                )}

                <div className={styles.buttonGroup}>
                    <button className={styles.button} onClick={goToDashboard}>
                        Înapoi la Panou
                    </button>
                </div>
            </div>
        </div>
    );
}