import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";

export default function Register() {

    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    
    const [userData, setUserData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const [profileData, setProfileData] = useState({
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
    });

    function handleAccountChange(e) {
        const {name, value} = e.target;
        setUserData((prev) => 
            ({...prev, 
                [name]: value
            }))

        }

    function handleProfileChange(e) {
        const {name, value} = e.target;
        setProfileData((prev) => 
            ({...prev, 
                [name]: value
            }))
    }
    
    function handleAddressChange(e) {
       const {name, value} = e.target;
         setProfileData((prev) => ({
          ...prev,
          address: {
                ...prev.address,
                [name]: value
          }
         }))        
         
    }

    async function handleStep1(e) {

        setError("");
        setLoading(true);
        e.preventDefault();

        try {
        const response = await fetch("http://localhost:8080/api/v1/auth/register/patient", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                username: userData.username, 
                email: userData.email, 
                password: userData.password
            })
        });

       if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Înregistrare eșuată!");
            }

        const token =  await response.json();
        localStorage.setItem("user", JSON.stringify(token));

        setStep(2);

    } catch (error) {
        setError("An error occurred during registration : " + error.message);
    }finally {
        setLoading(false);
    }
}


    async function handleStep2(e) {
        setError("");
        setLoading(true);
        e.preventDefault();

        try {


            const response = await fetch("http://localhost:8080/api/patients/profile", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}`
                },
                body: JSON.stringify({
                    name: profileData.name,
                    bornDate: profileData.bornDate,
                    cnp: profileData.cnp,
                    gender: profileData.gender,
                    phone: profileData.phone,
                    email: profileData.email,
                    profesion: profileData.profesion,
                    job: profileData.job,
                    address: {
                        country: profileData.address.country,
                        county: profileData.address.county,
                        city: profileData.address.city,
                        street: profileData.address.street,
                        zipCode: profileData.address.zipCode,
                        number: profileData.address.number
                    }
                })
            });

            if(!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Profile creation failed!");
            }

            
            
            navigate("/login");
        }catch(error)
        {
            setError("An error occurred during registration : " + error.message);
        }
        finally {
            setLoading(false);
        }
    }

        return(
            <>
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2 className={styles.titleH2}>iHealth</h2>
                    <p className={styles.titleP}>Creare cont</p>
                    <div className={styles.steps}>
                        <span className={`${styles.step} ${step === 1 ? styles.activeStep : styles.doneStep}`}>
                            1. Cont
                        </span>
                        <span className={styles.stepDivider}>→</span>
                        <span className={`${styles.step} ${step === 2 ? styles.activeStep : ""}`}>
                            2. Profil
                        </span>
                    </div>
                </div>
 
                {/* ── PASUL 1 ── */}
                {step === 1 && (
                    <form className={styles.form} onSubmit={handleStep1}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Username</label>
                            <input
                                className={styles.input}
                                type="text"
                                name="username"
                                value={userData.username}
                                onChange={handleAccountChange}
                                placeholder="Username"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email</label>
                            <input
                                className={styles.input}
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={handleAccountChange}
                                placeholder="Email"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Parolă</label>
                            <input
                                className={styles.input}
                                type="password"
                                name="password"
                                value={userData.password}
                                onChange={handleAccountChange}
                                placeholder="Parolă"
                                required
                            />
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <button className={styles.button} type="submit" disabled={loading}>
                            {loading ? "Se procesează..." : "Continuă →"}
                        </button>
                        <p className={styles.link}>
                            Ai deja cont?{" "}
                            <span onClick={() => navigate("/login")}>Autentifică-te</span>
                        </p>
                    </form>
                )}
 
                {/* ── PASUL 2 ── */}
                {step === 2 && (
                    <form className={styles.form} onSubmit={handleStep2}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Nume complet</label>
                            <input className={styles.input} type="text" name="name"
                                value={profileData.name} onChange={handleProfileChange}
                                placeholder="Ion Popescu" required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Data nașterii</label>
                            <input className={styles.input} type="date" name="bornDate"
                                value={profileData.bornDate} onChange={handleProfileChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>CNP</label>
                            <input className={styles.input} type="text" name="cnp"
                                value={profileData.cnp} onChange={handleProfileChange}
                                placeholder="1234567890123" maxLength={13} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Gen</label>
                            <select className={styles.input} name="gender"
                                value={profileData.gender} onChange={handleProfileChange}>
                                <option value="MALE">Masculin</option>
                                <option value="FEMALE">Feminin</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Telefon</label>
                            <input className={styles.input} type="tel" name="phone"
                                value={profileData.phone} onChange={handleProfileChange}
                                placeholder="07xx xxx xxx" required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email</label>
                            <input className={styles.input} type="email" name="email"
                                value={profileData.email} onChange={handleProfileChange}
                                placeholder="Email" required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Profesie</label>
                            <input className={styles.input} type="text" name="profesion"
                                value={profileData.profesion} onChange={handleProfileChange}
                                placeholder="Inginer, Doctor, etc." />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Loc de muncă</label>
                            <input className={styles.input} type="text" name="job"
                                value={profileData.job} onChange={handleProfileChange}
                                placeholder="Compania XYZ" />
                        </div>
 
                        {/* Adresă */}
                        <p className={styles.sectionTitle}>Adresă</p>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Țară</label>
                            <input className={styles.input} type="text" name="country"
                                value={profileData.address.country} onChange={handleAddressChange}
                                placeholder="România" />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Județ</label>
                                <input className={styles.input} type="text" name="county"
                                    value={profileData.address.county} onChange={handleAddressChange}
                                    placeholder="Cluj" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Oraș</label>
                                <input className={styles.input} type="text" name="city"
                                    value={profileData.address.city} onChange={handleAddressChange}
                                    placeholder="Cluj-Napoca" />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Stradă</label>
                                <input className={styles.input} type="text" name="street"
                                    value={profileData.address.street} onChange={handleAddressChange}
                                    placeholder="Str. Exemplu" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Număr</label>
                                <input className={styles.input} type="text" name="number"
                                    value={profileData.address.number} onChange={handleAddressChange}
                                    placeholder="10" />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Cod poștal</label>
                            <input className={styles.input} type="text" name="zipCode"
                                value={profileData.address.zipCode} onChange={handleAddressChange}
                                placeholder="400000" />
                        </div>
 
                        {error && <p className={styles.error}>{error}</p>}
                        <div className={styles.row}>
                            <button className={styles.buttonSecondary} type="button"
                                onClick={() => setStep(1)}>
                                ← Înapoi
                            </button>
                            <button className={styles.button} type="submit" disabled={loading}>
                                {loading ? "Se procesează..." : "Creează cont"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
            </>
            );
         
        }
