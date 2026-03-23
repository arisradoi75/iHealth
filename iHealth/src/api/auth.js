
export default function DataFetching() {
    const BASE_URL = "http://localhost:8080/api/v1/auth";

    async function Login(email, password) {
        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error during login:", error);
            throw error;
        }
    }

    async function Register(username, email, password) {
        try {
            const response = await fetch(`${BASE_URL}/register/patient`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email, password })
            });
            
            if (!response.ok) {
                throw new Error("Registration failed");
            }
            const data = await response.json();
            return data;

    
            
        }catch(error){
            console.error("Error during registration:", error);
            throw error;
        }
    }

}