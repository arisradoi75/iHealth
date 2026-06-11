import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !email || !password) {
      setError("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {

      const payload = { name, email, specializare: specialization, password };
      console.log("Admin registering doctor payload:", payload);

      const resp = await fetch("http://localhost:8080/api/v1/auth/register/doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user?.accessToken ? `Bearer ${user.accessToken}` : undefined,
        },
        body: JSON.stringify(payload),
      });

      // try to parse JSON response for better debug info
      let respBody = null;
      const text = await resp.text();
      try {
        respBody = JSON.parse(text);
      } catch {
        respBody = text;
      }
      console.log("Register doctor response:", resp.status, respBody);
      if (!resp.ok) throw new Error(typeof respBody === 'string' ? respBody : JSON.stringify(respBody));

      setSuccess("Doctor registered successfully!");
      setName("");
      setEmail("");
      setSpecialization("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error registering doctor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>User management — register doctor</p>
          </div>
          <div>
            <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className={styles.formWrap}>
          <h3 className={styles.formTitle}>Register Doctor</h3>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>Name</label>
            <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />

            <label className={styles.label}>Email</label>
            <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />

            <label className={styles.label}>Specialization</label>
            <input className={styles.input} value={specialization} onChange={(e) => setSpecialization(e.target.value)} />

            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <div className={styles.formRow}>
              <button className={styles.buttonPrimary} type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Register"}</button>
              <button type="button" className={styles.buttonSecondary} onClick={() => { setName(""); setEmail(""); setSpecialization(""); setPassword(""); setError(""); setSuccess(""); }}>Clear</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
