import {useCallback, useEffect, useState} from "react";
import { AuthContext } from "./AuthContextFile.js"

export default function AuthProvider({ children }) {
        const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        const userType = storedUser ? JSON.parse(storedUser).type : null;

        return storedUser ? { ...JSON.parse(storedUser), type: userType } : null;
    });

        const logout = () => {
            localStorage.removeItem("user");
            setUser(null);
        }
       
        const UserData = useCallback(async () => {
            try {
                
                const fetchUserData = await fetch(`http://localhost:8080/api/v1/users/me`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                    method: "GET",
                });

                if (!fetchUserData.ok) {
                    throw new Error(`HTTP error! status: ${fetchUserData.status}`);
                }

                const userData = await fetchUserData.json();
                setUser((prevUser) => ({
                    ...prevUser,
                    ...userData,
                }));

            }catch (error) {
                console.error("Error fetching user data:", error.message);
            }
        }, [user?.accessToken]);

        return (
            <AuthContext.Provider value={{ user, setUser, logout }}>
                {children}
            </AuthContext.Provider>
        );
        
 }   
    