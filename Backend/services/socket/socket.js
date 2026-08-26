let io;

export const InitializeSocket = (socketIO) => {
    io = socketIO;
    console.log('Socket.io Initialized');
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io has not been initialized');
    return io;
};

