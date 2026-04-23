import { useEffect } from "react";
import { useState } from "react";
import useAuth from "../../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";

export default function MedicalRecords() {
    
    const { user } = useAuth();
    const navigate = useNavigate();
    const [medicalData, setMedicalData] = useState({
        eventData: "",
        eventType: "",
        details: "",
        patient: ""
    });

    const goToDashboard = () => {
        navigate("/Dashboard");
    }

    useEffect(() => {

        console.log("Am intrat în componenta MedicalRecords sper sa mearga in pula mea"); 
        const fetchMedicalRecord = async () => {
            try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/patients/${user.patientId}/medical-events/me`, {
                        
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.accessToken}`
                        },
                        method: "GET"
                    })
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    console.log("Date primite:", medicalData);
                    const data = await response.json();
                    setMedicalData(data);
            }catch(error) {
                console.error("Error fetching medical record:", error.message);
            }
        }}, [navigate, user]);


    return (
        <div>
            <h2>Medical Records</h2>
            <p>This is where the medical records will be displayed.</p>
            <p>Event Data: {medicalData.eventData ? medicalData.eventData : "N/A" }</p>
            <p>Event Type: {medicalData.eventType ? medicalData.eventType : "N/A" }</p>
            <p>Details: {medicalData.details ? medicalData.details : "N/A" }</p>
            <p>Patient: {medicalData.patient ? medicalData.patient : "N/A" }</p>
            <button onClick={goToDashboard}>Back to Dashboard</button>
        </div>
    );
}