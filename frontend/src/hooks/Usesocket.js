import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuth from "./useAuth";

// Keeps a single socket connection alive for as long as the user is
// logged in, and RECONNECTS whenever login state changes — this is the
// part that was missing before. Depending on `user` (not an empty [])
// means: log in without a page refresh -> effect re-runs -> socket
// connects with the fresh token. Log out -> effect cleans up -> socket
// disconnects. A stale, mount-time-only token check meant events like
// "session:changed" were silently never received in same-tab flows.
export default function useSocket(handlers = {}) {
    const socketRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token || !user) {
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
            console.log("[socket] connected:", socket.id);
        });

        // TEMPORARY debug visibility — logs every event this socket
        // receives, regardless of whether a handler is registered for it.
        // If you change a status in the admin panel and DON'T see a line
        // here in the customer tab's console, the event isn't reaching
        // the browser at all (server-side emit/room issue). If you DO see
        // it here but the UI doesn't update, the bug is in the handler
        // logic instead. Remove this once things are confirmed working.
        socket.onAny((event, payload) => {
            console.log("[socket] event received:", event, payload);
        });

        Object.entries(handlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        socket.on("connect_error", (err) => {
            console.warn("Socket connection failed:", err.message);
        });

        return () => {
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return socketRef;
}