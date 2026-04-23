import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import styles from './Auth.module.css';




export function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const {setUser} = useAuth();
    const navigate = useNavigate();
    
    function handleChange(e) {
        const {name, value} = e.target;
        setFormData((prev) => 
            ({...prev, 
                [name]: value
            }));
    }

   const handleSubmit = async (e) => {
          e.preventDefault();
    try {
        const response = await fetch(`http://localhost:8080/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: formData.email, 
                password: formData.password 
            })
        });
        console.log(response);
        if (!response.ok) throw new Error("Email sau parolă greșită!");

        const data = await response.json();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/dashboard");

    } catch (error) {
        setError(error.message);
    }

    
};

   return (
  <div className={styles.page}>
    <div className={styles.card}>

      <div className={styles.header}>
        <h2 className={styles.titleH2}>iHealth</h2>
        <p className={styles.titleP}>Autentificare</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>


        <div className={styles.inputGroup}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit" onChange={() => navigate("/dashboard")}>
          Authentication
        </button>

        <button className={styles.button} type="button" onClick={() => navigate("/register")}>
          Register
        </button>

      </form>
    </div>
  </div>
);
}


