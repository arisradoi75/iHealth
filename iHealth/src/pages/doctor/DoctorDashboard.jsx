import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardCard from "../../components/Cards/DashboardCard.jsx";
import { Outlet } from "react-router-dom";
import style from "./DoctorDashboard.module.css";

function DoctorDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [doctorData, setDoctorData] = useState({
        nume: "",
        specializare: "",
    });

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
                <DashboardCard 
                    title="Assign Patients" 
                    description="View and manage your assigned patients" 
                    icon="/public/assets/add-group-svgrepo-com.svg"
                    destination="/doctor/PatientAdd" 
                />
                <DashboardCard
                    title="View Patients"
                    description="See the list of patients assigned to you"
                    icon="public/assets/list-svgrepo-com.svg"
                    destination="/doctor/PatientList"
                />
            </div>

            <div className={style.logoutButtonContainer}>
                <button onClick={handleLogout} className={style.logoutButton}>
                    Logout
                </button>
            </div>

            <Outlet />
        </div>
    );
}

export default DoctorDashboard;