import { Routes, Route } from "react-router-dom";
import { Login } from "./pages/auth/Login.jsx";
import  Register  from "./pages/auth/Register.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Profile from "./pages/shared/Profile.jsx";
import Recommendations from "./pages/patient/Recommendations.jsx";
import MedicalRecords from "./pages/patient/MedicalRecords.jsx";

function App() {

  console.log("Ruta curentă:", window.location.pathname)
  return (
    
    <>

     <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /> 
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/shared/Profile" element={<Profile />} />
      <Route path="/patient/Recommendations" element={<Recommendations />} />
      <Route path="/patient/MedicalRecords" element={<MedicalRecords />} />
    </Routes>
    
    </>
  )
}

export default App
