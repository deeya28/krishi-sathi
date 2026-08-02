import { createContext, useContext, useState } from "react";
import { apiFetch } from "../utils/api";

const AuthContext = createContext(null);

const SESSION_KEY = "ks_session";

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadSession);

  /**
   * Register a new user via the backend.
   * Returns { ok: true } on success or { ok: false, error: string } on failure.
   * Does NOT log the user in — they must login separately.
   */
  const register = async ({ name, email, password, role }) => {
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  /**
   * Login via the backend.
   * Returns { ok: true, user } on success or { ok: false, error: string } on failure.
   */
  const login = async ({ email, password }) => {
    try {
      // Response: { _id, name, email, role, token }
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const session = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
        bio: '',
        location: '',
        avatarColor: '#2F5233',
      };

      setCurrentUser(session);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { ok: true, user: session };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  /** Update local profile fields without a backend call (bio, location, avatarColor). */
  const updateProfile = (updates) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
