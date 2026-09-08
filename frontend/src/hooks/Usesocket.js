import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuth from "./useAuth";
import { API_BASE_URL } from "../api/apiBaseUrl";

const SOCKET_SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");

/**
 * Customer Socket Hook
 * Keeps a single socket connection alive for as long as the user is logged in.
 * Dynamically proxies incoming events to the latest handlers to avoid stale closures.
 */
export default function useSocket(handlers = {}) {
    const socketRef = useRef(null);
    const handlersRef = useRef(handlers);
    const { user } = useAuth();

    // Always keep latest handler functions in ref
    handlersRef.current = handlers;

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token || !user) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }

        const socket = io(SOCKET_SERVER_URL, {
            auth: { token },
            withCredentials: true,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("[socket] customer connected:", socket.id);
        });

        socket.onAny((event, payload) => {
            console.log("[socket] event received:", event, payload);
            if (handlersRef.current && typeof handlersRef.current[event] === "function") {
                try {
                    handlersRef.current[event](payload);
                } catch (err) {
                    console.error(`[socket] error in handler for ${event}:`, err);
                }
            }
        });

        socket.on("connect_error", (err) => {
            console.warn("[socket] connection warning:", err.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user]);

    return socketRef;
}