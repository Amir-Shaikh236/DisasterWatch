import { Server } from "socket.io";
import { socketAuth } from "../../middleware/socketMiddleware.js";

let io;

export const InitializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        }
    });

    io.use(socketAuth)

    io.on("connection", (socket) => {
        const user = socket.user;

        if (user.role === 'admin') {
            socket.join('admin');

        } else {
            socket.join(`user: ${user._id}`)

        }
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io has not been initialized');
    return io;
};

