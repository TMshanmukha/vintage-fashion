import { createContext, useState } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser || storedUser === "undefined") {
            return null;
        }

        return JSON.parse(storedUser);
    });

    const [accessToken, setAccessToken] = useState(() => {
        return localStorage.getItem("accessToken") || "";
    });

    return (

        <AuthContext.Provider
            value={{
                user,
                setUser,
                accessToken,
                setAccessToken
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}