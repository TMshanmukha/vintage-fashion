import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAdminAuth } from "../../src/admin/context/AdminAuthContext";

// Same fix as the customer useSocket hook: reconnects whenever admin
// login state changes, instead of only checking for a token once at
// mount (which meant admin login mid-session never actually connected).
export default function useAdminSocket(handlers = {}) {
    const socketRef = useRef(null);
    const { admin } = useAdminAuth();

    useEffect(() => {
        const token = localStorage.getItem("adminAccessToken");

        if (!token || !admin) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }

        const socket = io("http://localhost:5000", {
            auth: { token },
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("[admin socket] connected:", socket.id);
        });

        // TEMPORARY — same debug visibility as the customer socket hook.
        // Remove once live updates are confirmed working end-to-end.
        socket.onAny((event, payload) => {
            console.log("[admin socket] event received:", event, payload);
        });

        Object.entries(handlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        socket.on("connect_error", (err) => {
            console.warn("Admin socket connection failed:", err.message);
        });

        return () => {
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [admin]);

    return socketRef;
}