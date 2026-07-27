import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

// Rooms: every connected admin joins "admins"; every connected customer
// joins a room scoped to their own userId, so we can target one user
// (e.g. "log out your other tabs") without broadcasting to everyone.
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: [
                "http://localhost:5173", // customer frontend (Vite default)
                "http://localhost:5174/admin", // admin frontend, adjust to your actual admin dev port
            ],
            credentials: true,
        },
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("No token provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            socket.user = decoded; // { userId, email, role }

            next();
        } catch (err) {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        const { userId, role } = socket.user;

        if (role === "admin") {
            socket.join("admins");
            socket.join(`admin:${userId}`);
        } else {
            socket.join(`user:${userId}`);
        }

        console.log(`Socket connected: ${role} (userId=${userId}), socket=${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

// Call this from anywhere in the backend (services, controllers) after
// initSocket() has run once at server startup.
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized. Call initSocket() first.");
    }
    return io;
};