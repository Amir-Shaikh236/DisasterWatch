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
        console.log('Socket Connected: ', socket.id)
        const user = socket.user;

        if (user.role === 'admin') {
            socket.join('admin');
            console.log(`Admin ${user._id} joined admin room`)

        } else {
            socket.join(`user: ${user._id}`)
            console.log(`User ${user._id} joined their room`)

        }
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io has not been initialized');
    return io;
};

