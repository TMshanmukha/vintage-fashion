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
                gutter={8}
                toastOptions={{
                    duration: 3500,
                    style: {
                        fontSize: "13px",
                        fontWeight: "500",
                        padding: "10px 18px",
                        borderRadius: "12px",
                        background: "#ffffff",
                        color: "#1e293b",
                        maxWidth: "min(90vw, 650px)",
                        width: "fit-content",
                        whiteSpace: "nowrap",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #f1f5f9",
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: "#10b981",
                            secondary: "#ffffff",
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#ef4444",
                            secondary: "#ffffff",
                        },
                    },
                }}
            />
            <App />

        </AuthProvider>

    </BrowserRouter>

);