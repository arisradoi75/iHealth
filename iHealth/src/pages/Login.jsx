import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function Login() {
    const [formData, setFormData] = useState({
        email: "user@example.com",
        password: "password"
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

    function handleSubmit(e) {
        e.preventDefault();
        
        if(formData.email === "user@example.com" && formData.password === "password") {
            alert("Login successful!");
            
            const userData = {
        id: "m1",
        nume: "Dr. Ionescu",
        role: "medic", 
        };


        setUser(userData);

        localStorage.setItem("user", JSON.stringify(userData));
        
        navigate("/dashboard");
        } else {
            setError("Invalid email or password");
        }

    
    }

    return (
    <div className="login-container">
      <h2>Clinica Sănătatea Noastră</h2>
      <p>Autentificare sistem IoT</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email" // Trebuie să coincidă cu cheia din formData
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Parolă:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Intră în cont</button>
      </form>
    </div>
  );
}


