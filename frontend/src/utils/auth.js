// frontend/src/api/auth.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // change for production

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
