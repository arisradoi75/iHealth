import React from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const { user } = useAuth();
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    

    const handleLogout = () => {
        logout(); // Executăm logica de ștergere
        navigate("/login"); // Trimitem utilizatorul la pagina de login
    };

    return (
        <div>
            <h1>Salut, {user?.nume}!</h1>
            <button onClick={handleLogout}>Ieșire</button>
        </div>
    );
}

export default Dashboard