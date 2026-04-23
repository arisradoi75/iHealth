import React from "react";
import useAuth from "../../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";

export default function Profile()   
{   

    const { user } = useAuth();
    const navigate  = useNavigate();
    
    const [patientData, setPatientData] = React.useState({
            name: "",
            bornDate: "",
            cnp: "",
            gender: "",
            phone: "",
            email: "",
            profesion: "",
            job: "" 
        });

         const goToDashboard = () => { 
            navigate("/Dashboard");
        }

        async function fetchPatientData() {
            try {
                const response = await fetch(`http://localhost:8080/api/patients/me`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}`
                    },
                    method: "GET"
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setPatientData(data);
            } catch (error) {
                console.error("Error fetching patient data:", error.message);
            }
        }; 

        React.useEffect(() => {
            fetchPatientData();
        }, [user, navigate]);     


    return (
        <div>
            <h1>Profilul meu</h1>
            <p>Nume: {patientData.name}</p>
            <p>Data nașterii: {patientData.bornDate}</p>
            <p>CNP: {patientData.cnp}</p>
            <p>Gen: {patientData.gender}</p>
            <p>Telefon: {patientData.phone}</p>
            <p>Email: {patientData.email}</p>
            <p>Profesie: {patientData.profesion}</p>
            <p>Loc de muncă: {patientData.job}</p>  
            
            <button onClick={goToDashboard}>Iesire</button>
        </div>
    );
}