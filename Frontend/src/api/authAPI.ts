const API_BASE_URL = "http://localhost:3000/api";

interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterPayload) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result;
};

export const loginUser = async (data: LoginPayload) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
};
