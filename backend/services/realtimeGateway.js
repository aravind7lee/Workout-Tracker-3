let io;

export const initializeRealtimeGateway = (socketServer) => {
  io = socketServer;
};

export const emitToUser = (userId, eventType, payload = {}) => {
  if (!io || !userId) return;
  io.to(`user:${userId.toString()}`).emit(eventType, {
    type: eventType,
    ...payload,
    timestamp: new Date().toISOString()
  });
};

export const emitPublic = (eventType, payload = {}) => {
  if (!io) return;
  io.emit(eventType, { type: eventType, ...payload, timestamp: new Date().toISOString() });
};
