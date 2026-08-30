import { Server } from "socket.io";
import { socketAuth } from "../../middleware/socketMiddleware.js";

let io = null;

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
            socket.join(`user:${user._id}`)

        }
    });

    console.log('Socket.io successfully initialized');
    return io;
};

export const getIO = () => {
    if (!io) {
        console.warn('Socket.io is not initialized yet; falling back to a no-op socket instance.');
        return noopIO;
    }
    return io;
};

