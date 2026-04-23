import {useState} from "react";
import { AuthContext } from "./AuthContextFile.js"

export default function AuthProvider({ children }) {
        const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

        const logout = () => {
            localStorage.removeItem("user");
            setUser(null);
        }

        return (
            <AuthContext.Provider value={{ user, setUser, logout }}>
                {children}
            </AuthContext.Provider>
        );
        
 }   
    