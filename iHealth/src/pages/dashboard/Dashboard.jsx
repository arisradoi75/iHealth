import React, { useEffect } from "react";
import useAuth from "../../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import DashboardCard from "../../components/Cards/DashboardCard.jsx";
import style from "./Dashboard.module.css";


function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    
    const [patientData, setPatientData] = React.useState({
        name: "",
        bornDate: "",
        cnp: "",
        gender: "",
        phone: "",
        email: "",
        profesion: "",
        job: "",
        address: {
            country: "",
            county: "",
            city: "",
            street: "",
            zipCode: "",
            number: "",
        },
    })

    useEffect(() => {
        if (!user) {
            navigate("/login");
        } else {

            const fetchPatientData = async () => {
                try {
                    const token = JSON.parse(localStorage.getItem("user")).accessToken;
                    


                    const response = await fetch(`http://localhost:8080/api/patients/me`, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
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
            
            fetchPatientData();
        }
    }, [user, navigate]);
    
    const handleLogout = () => {
        logout(); 
        navigate("/login"); 
    };

    

    return (
        <>
        <div>
            <h1 className={style.title}>iHealth - A way to manage your health</h1>
        </div>

       <div className={style.cardPlacement}>
            <DashboardCard title="Profile" icon="/assets/iHealthProfileIcon.svg" destination="/shared/Profile" />
            <DashboardCard title="Appointments" icon="/assets/schedule.png" destination="/dashboard/Appointments" />
            <DashboardCard title = "Recommendations" icon="/assets/heart.png" destination="/patient/Recommendations"/>
            <DashboardCard title = "Medical Records" icon="/assets/medical-records.png" destination="/dashboard/MedicalRecords"/>
            <DashboardCard title = "Prescriptions" icon="/assets/prescription.png" destination="/dashboard/Prescriptions"/>
            <DashboardCard title = "Health Data" icon="/assets/health-data.png" destination="/dashboard/HealthData"/>
            <Outlet />
            <div>
                <button onClick={handleLogout} className="logoutButton">Logout</button>
            </div>
       </div>
       </> 
    );
}
        

export default Dashboard