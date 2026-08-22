import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

// Store connected clients grouped by user ID
const clients = new Map();

// Helper to safely get user ID as a string
const getUserId = (user) => (user._id || user.id || user).toString();

// GET /api/sse/stream
// Endpoint for frontend to connect and listen for real-time updates
router.get('/stream', auth, (req, res) => {
  const userId = getUserId(req.user);

  // Set necessary headers for Server-Sent Events (SSE)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send an initial handshake event
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

  // Add this client to the pool
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  const userClients = clients.get(userId);
  userClients.add(res);

  // Remove the client from the pool when the connection is closed
  req.on('close', () => {
    userClients.delete(res);
    if (userClients.size === 0) {
      clients.delete(userId);
    }
  });
});

/**
 * Broadcast an event to all connected devices for a specific user.
 * @param {string} userId - The user's ID
 * @param {string} eventType - The type of event (e.g., 'workout_updated')
 * @param {object} payload - Optional payload to send
 */
export const broadcastToUser = (userId, eventType, payload = {}) => {
  const userClients = clients.get(userId.toString());
  if (userClients && userClients.size > 0) {
    const dataString = JSON.stringify({ type: eventType, ...payload });
    userClients.forEach((res) => {
      res.write(`data: ${dataString}\n\n`);
    });
  }
};

export default router;
