import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";

import AuthProvider from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(

    <BrowserRouter>

        <AuthProvider>
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                    borderRadius: "12px",
                    background: "#fff",
                    color: "#222",
                    fontWeight: "600",
                    },
                }}
                />
            <App />

        </AuthProvider>

    </BrowserRouter>

);