import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import DashboardCard from "../../components/Cards/DashboardCard.jsx";
import style from "./Dashboard.module.css";


function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    
    const [patientData, setPatientData] = useState({
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
                    


                    const response = await fetch(`http://localhost:8080/api/v1/users/me`, {
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
        <div className={style.container}>
            <div className={style.header}>
                <h1 className={style.title}>iHealth</h1>
                <p className={style.subtitle}>Manage your health, your way</p>
            </div>

            <div className={style.cardPlacement}>
                <DashboardCard title="Profile" icon="/assets/profile1-svgrepo-com.svg" destination="/shared/Profile" />
                <DashboardCard title="Appointments" icon="/assets/schedule.png" destination="/dashboard/Appointments" />
                <DashboardCard title="Recommendations" icon="/assets/write-svgrepo-com.svg" destination="/patient/Recommendations" />
                <DashboardCard title="Medical Records" icon="/assets/profile-user-svgrepo-com.svg" destination="/patient/MedicalRecords" />
                <DashboardCard title="Prescriptions" icon="/assets/medical-prescription-svgrepo-com.svg" destination="/dashboard/Prescriptions" />
                <DashboardCard title="Health Data" icon="/assets/samsung-health-monitor-svgrepo-com.svg" destination="/dashboard/HealthData" />
            </div>

            <div className={style.logoutButtonContainer}>
                <button onClick={handleLogout} className={style.logoutButton}>Logout</button>
            </div>

            <Outlet />
        </div>
    );
}
        

export default Dashboard