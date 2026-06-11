import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import styles from "./Recommendations.module.css";


export default function Recommendations() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
   
    
    useEffect(() => {

        const fetchRecommendations = async () => {
            try {
                const tokenData = jwtDecode(user.accessToken);
                const patientId = tokenData.patient_id;
                const response = await fetch(`http://localhost:8080/api/patients/recommendations/for-patient/${patientId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.accessToken}`
                    },
                    method: "GET"
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                setRecommendations(data);
            } catch (error) {
                console.error("Error fetching recommendations:", error.message);
            }
        }; 

        fetchRecommendations();
        
    }, [navigate, user]); 


    const goToDashboard = () => {
        navigate("/Dashboard");
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>My Recommendations</h1>
                        <p className={styles.subtitle}>Here you can see the recommendations received.</p>
                    </div>
                    <div className={styles.controls}>
                        <button className={styles.backButton} onClick={goToDashboard}>Back to Dashboard</button>
                    </div>
                </div>

                {recommendations.length === 0 ? (
                    <div className={styles.emptyState}>You don't have any recommendations at the moment.</div>
                ) : (
                    <div className={styles.list}>
                        {recommendations.map((rec, index) => (
                            <div key={index} className={styles.recCard}>
                                <div className={styles.recHeader}>
                                    <div className={styles.recTypeBlock}>
                                        <div className={styles.recLabel}>Recommendation Type</div>
                                        <div className={styles.recValue}>{rec.recommendationType ?? "N/A"}</div>
                                    </div>
                                    <div className={styles.metaRight}>{rec.date ?? ""}</div>
                                </div>

                                <div className={styles.whatRow}>
                                    <div className={styles.whatHeader}>What you need to do</div>
                                    <div className={styles.recDetails}>{rec.details ?? "N/A"}</div>
                                </div>

                                <div className={styles.metaRow}>
                                    <div className={styles.metaLeft}>{rec.author ? `Sursă: ${rec.author}` : ""}</div>
                                    <div className={styles.metaRight}>{rec.priority ?? ""}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}