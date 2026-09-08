import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://vintage-fashion-xi.vercel.app",
];

// Rooms: every connected admin joins "admins" and "admin:userId"; every connected customer
// joins a room scoped to their own userId.
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: function (origin, callback) {
                if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin) || origin.endsWith(".vercel.app") || origin.includes("onrender.com")) {
                    callback(null, true);
                } else {
                    callback(null, true);
                }
            },
            credentials: true,
        },
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
                socket.user = decoded; // { userId, email, role }
            } else {
                socket.user = { role: "guest" };
            }

            next();
        } catch (err) {
            // If token expired or invalid, still allow connection as guest
            socket.user = { role: "guest" };
            next();
        }
    });

    io.on("connection", (socket) => {
        const { userId, role } = socket.user || {};

        if (role === "admin") {
            socket.join("admins");
            if (userId) socket.join(`admin:${userId}`);
        } else if (userId) {
            socket.join(`user:${userId}`);
        }

        console.log(`Socket connected: ${role || 'guest'} (userId=${userId || 'none'}), socket=${socket.id}`);

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
        console.warn("Socket.IO not initialized when getIO() was called.");
        return {
            to: () => ({ emit: () => {} }),
            emit: () => {}
        };
    }
    return io;
};