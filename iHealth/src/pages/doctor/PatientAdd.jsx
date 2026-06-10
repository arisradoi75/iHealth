import React, { useEffect } from "react";
import useAuth from "../../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import styles from "./PatientAdd.module.css";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function PatientAdd() {
        const { user } = useAuth();
        const navigate = useNavigate();
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [searchTerm, setSearchTerm] = useState("");
        const [selectedPatient, setSelectedPatient] = useState([]);
        const [patientData, setPatientData] = useState([]);
        const [assignedPatients, setAssignedPatients] = useState([]);

        const goToDashboard = () => {
        navigate("/dashboard");
    };
            


        useEffect(() => {
            if (!user) {
                navigate("/login");
            } else {
                const fetchPatientData = async () => {
                    try {
                        setLoading(true);
                        const token = JSON.parse(localStorage.getItem("user")).accessToken;
                        const response = await fetch(`http://localhost:8080/api/patients/all/patients`, {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            method: "GET",
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const data = await response.json();
                        setPatientData(data);
                        setError("");

                    } catch (error) {
                        console.error("Error fetching patient data:", error.message);
                        setError(error.message);
                    } finally {
                        setLoading(false);
                    }
                };

                fetchPatientData();
            }
        }, [user, navigate]);


        const handleAssignPatients = async () => {
            try {

                const token = JSON.parse(localStorage.getItem("user")).accessToken;
                const doctorId = jwtDecode(token).medic_id;
                const patientId = selectedPatient[0];

    

                const response = await fetch(`http://localhost:8080/api/patients/${doctorId}/assign/${patientId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setAssignedPatients(data);
                setError("");

            }catch (error) {
                console.error("Error assigning patients:", error.message);
                setError(error.message);
            } 
        }

        const togglePatientSelection = (patient) => {
            if (selectedPatient.includes(patient.id)) {
                setSelectedPatient(selectedPatient.filter(id => id !== patient.id));
            } else {
                setSelectedPatient([...selectedPatient, patient.id]);
            }
        };

        const filteredPatients = patientData.filter(patient =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.cnp.toLowerCase().includes(searchTerm.toLowerCase())
        );



      
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Listă Pacienți</h1>
                </div>

                {loading && <p className={styles.loading}>Se încarcă pacienții...</p>}

                {error && <p className={styles.error}>Eroare: {error}</p>}

                {!loading && !error && (
                    <>
                        <div className={styles.searchContainer}>
                            <input 
                                type="text" 
                                placeholder="⋮ Caută pacient..." 
                                className={styles.searchInput}
                                onInput={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>

                        <div className={styles.tableContainer}>
                            {patientData.length === 0 ? (
                                <p className={styles.noPatients}>Nu există pacienți înregistrați.</p>
                            ) : (
                                <table className={styles.patientTable}>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Birth Date</th>
                                            <th>CNP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPatients.map((patient, index) => {
                                            const isSelected = selectedPatient.includes(patient.id);
                                            return (
                                                <tr key={patient.patientId || index} 
                                                    onClick={() => togglePatientSelection(patient)}
                                                    style={{
                                                        cursor: "pointer", 
                                                        backgroundColor: isSelected ? "#407b54" : "transparent",
                                                        transition: "background-color 0.2s"
                                                    }}
                                                >
                                                    <td>{patient.name}</td>
                                                    <td>{patient.bornDate}</td>
                                                    <td>{patient.cnp}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}

                            
                        </div>
                    </>
                )}

                <button className={styles.assignButton} onClick={handleAssignPatients}>
                    Assign Selected Patients
                </button>

                <button className={styles.assignButton} onClick={goToDashboard}>
                    Back
                </button>
            </div>
        );
}