import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";
import http from "http";
import { initSocket } from "./socket/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    const maxRetries = 5;
    const retryDelay = 3000; // 3 seconds
    let connection = null;

    for (let i = 1; i <= maxRetries; i++) {
        try {
            console.log(`Connecting to database (Attempt ${i}/${maxRetries})...`);
            connection = await pool.getConnection();
            console.log("Database Connected Successfully");
            connection.release();
            break; // success, break out of loop
        } catch (error) {
            console.error(`Database Connection Attempt ${i} Failed:`, error.message);
            if (i === maxRetries) {
                console.error("All database connection attempts failed. Exiting.");
                process.exit(1);
            }
            console.log(`Retrying in ${retryDelay / 1000} seconds...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }

    try {
        const server = http.createServer(app);
        initSocket(server);
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Server Startup Failed:", error);
        process.exit(1);
    }
}

startServer();