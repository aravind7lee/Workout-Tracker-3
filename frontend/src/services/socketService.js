import { io } from 'socket.io-client';
import api from '../utils/api';

class SocketService {
  socket = null;

  connect(token) {
    if (!token) return null;
    if (this.socket?.connected) return this.socket;
    this.disconnect();
    const baseUrl = String(api.defaults.baseURL || window.location.origin).replace(/\/api\/?$/, '');
    this.socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000
    });
    return this.socket;
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
