// frontend/src/services/mockAuth.js
// Mock authentication service for development/demo purposes

const MOCK_USERS = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@gym.com",
    password: "demo123",
  },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockRegister = async (userData) => {
  await delay(1000); // Simulate network delay

  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = MOCK_USERS.find(
    (user) => user.email === email.toLowerCase(),
  );
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password, // In real app, this would be hashed
  };

  MOCK_USERS.push(newUser);

  // Generate mock token
  const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email }));

  return {
    success: true,
    message: "Registration successful",
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  };
};

export const mockLogin = async (credentials) => {
  await delay(1000); // Simulate network delay

  const { email, password } = credentials;

  // Find user
  const user = MOCK_USERS.find(
    (u) => u.email === email.toLowerCase() && u.password === password,
  );
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Generate mock token
  const token = btoa(JSON.stringify({ id: user.id, email: user.email }));

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};

export const isBackendAvailable = async () => {
  try {
    // Test the actual backend URL
    const backendUrl =
      import.meta.env.VITE_API_BASE || "https://grindx-backend.vercel.app/api";
    console.log("Testing backend at:", backendUrl);

    const response = await fetch(`${backendUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Backend health check successful:", data);
      return true;
    } else {
      console.log("Backend health check failed:", response.status);
      return false;
    }
  } catch (error) {
    console.log("Backend connection error:", error.message);
    return false;
  }
};
