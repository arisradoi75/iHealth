import { Routes, Route } from "react-router-dom";
import { Login } from "./pages/auth/Login.jsx";
import  Register  from "./pages/auth/Register.jsx";
import Profile from "./pages/shared/Profile.jsx";
import Recommendations from "./pages/patient/Recommendations.jsx";
import MedicalRecords from "./pages/patient/MedicalRecords.jsx";
import DashboardRouter from "./pages/dashboard/DashboardRouter.jsx";
import PatientAdd from "./pages/doctor/PatientAdd.jsx";
import PatientList from "./pages/doctor/PatientList.jsx";

function App() {

  console.log("Ruta curentă:", window.location.pathname)
  return (
    
    <>

     <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /> 
      <Route path="/dashboard" element={<DashboardRouter />} />
      <Route path="/shared/Profile" element={<Profile />} />
      <Route path="/patient/Recommendations" element={<Recommendations />} />
      <Route path="/patient/MedicalRecords" element={<MedicalRecords />} /> 
      <Route path="/doctor/PatientAdd" element={<PatientAdd />} />
      <Route path="/doctor/PatientList" element={<PatientList />} />
    </Routes>
    
    </>
  )
}

export default App
