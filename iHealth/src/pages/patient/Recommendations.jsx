import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";



export default function Recommendations() { 
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);


    let patientId = null;

    if(user.accessToken) {
        const decodedToken = jwtDecode(user.accessToken);
        patientId = decodedToken.userId;
    }

   
    
    useEffect(() => {

        const fetchRecommendations = async () => {
            try {

                const response = await fetch(`http://localhost:8080/api/patients/recommendations/for-patient/${user.patientId}`, {
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
                
                // Opțional: Dă-i un console.log ca să fii sigur că vin datele
                console.log("Date primite:", data); 
                
                setRecommendations(data);
            } catch (error) {
                console.error("Error fetching recommendations:", error.message);
            }
        }; 

        fetchRecommendations();
        
    }, [navigate, user, patientId]); 


    const goToDashboard = () => {
        navigate("/Dashboard");
    }

    return (
        <div>
            <h1>Recomandările mele</h1>
            
            {/* 4. AICI: Verificăm dacă lista e goală. Dacă nu e, o afișăm cu .map() */}
            {recommendations.length === 0 ? (
                <p>Momentan nu ai nicio recomandare.</p>
            ) : (
                recommendations.map((rec, index) => (
                    <div key={index} style={{ borderBottom: "1px solid #ccc", paddingBottom: "10px", marginBottom: "10px" }}>
                        <p><strong>Tip recomandare:</strong> {rec.recommendationType ? rec.recommendationType : "N/A"}</p>
                        <p><strong>Detalii:</strong> {rec.details ? rec.details : "N/A"}</p>
                    </div>
                ))
            )}
            <button onClick={goToDashboard}>Back to Dashboard</button>
        </div>
    );
}