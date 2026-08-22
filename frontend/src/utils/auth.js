// frontend/src/api/auth.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV || window?.location?.hostname === 'localhost' ? "http://localhost:5000/api/auth" : "https://workout-tracker-backend-wga7.onrender.com/api/auth");

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};
