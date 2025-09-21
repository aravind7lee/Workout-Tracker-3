// Vercel serverless function for health check
export default function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    message: 'GymTracker API Ready',
    timestamp: new Date().toISOString()
  });
}