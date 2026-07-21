import { createContext, useContext, useState } from "react";
import axios from "axios";


const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {


    const [admin, setAdmin] = useState(() => {

        const storedAdmin = localStorage.getItem("admin");

        if (!storedAdmin || storedAdmin === "undefined") {
            return null;
        }

        return JSON.parse(storedAdmin);

    });

    const [accessToken, setAccessToken] = useState(() => {

        return localStorage.getItem("adminAccessToken") || "";

    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {

        return !!localStorage.getItem("adminAccessToken");

    });

    const login = (adminData, token) => {

        setAdmin(adminData);

        setAccessToken(token);

        setIsAuthenticated(true);

        localStorage.setItem(
            "admin",
            JSON.stringify(adminData)
        );

        localStorage.setItem(
            "adminAccessToken",
            token
        );

    };

    const logoutLocal = () => {

        setAdmin(null);

        setAccessToken("");

        setIsAuthenticated(false);

        localStorage.removeItem("admin");

        localStorage.removeItem("adminAccessToken");

    };

    const logout = async () => {
        try {
            await axios.post(
                "http://localhost:5000/api/auth/admin/logout",
                {},
                {
                    withCredentials: true
                }
            );
        } catch (error) {
            console.error(error);
        }

        logoutLocal();
    };

    

    return (
        <AdminAuthContext.Provider
            value={{
                admin,
                accessToken,
                isAuthenticated,
                login,
                logout,
                logoutLocal
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );

}

export const useAdminAuth = () => useContext(AdminAuthContext);