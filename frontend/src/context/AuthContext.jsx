import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const SESSION_KEY = "ks_session"; // stores { token, user }

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  return (role || "farmer").toLowerCase();
}

export function AuthProvider({ children }) {
  const session = loadSession();
  const [currentUser, setCurrentUser] = useState(session?.user || null);
  const [token, setToken] = useState(session?.token || null);

  const register = async ({ name, email, password, role }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: normalizeRole(role),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { ok: false, error: data.message || "Registration failed." };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not connect to the server. Is the backend running?" };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { ok: false, error: data.message || "Incorrect email or password." };
      }

      const { token: authToken, ...user } = data;

      setCurrentUser(user);
      setToken(authToken);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ token: authToken, user }));

      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: "Could not connect to the server. Is the backend running?" };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = async (updates) => {
    if (!currentUser || !token) return { ok: false, error: "Not logged in." };

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return { ok: false, error: data.message || "Update failed." };
      }

      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user: updatedUser }));

      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not connect to the server." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}