import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";
import http from "http";
import { initSocket } from "./socket/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        const connection = await pool.getConnection();
        console.log("Database Connected Successfully");
        connection.release();
        const server = http.createServer(app);
        initSocket(server);
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Database Connection Failed");
        console.error(error);
        process.exit(1);
    }
}

startServer();