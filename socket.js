let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer, {
            cors: {
              origin: "*", // Allow requests from this origin
              methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
              allowedHeaders: ["Content-Type", "Authorization"]
            }
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized');
        }
        return io;
    }
};