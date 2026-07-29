import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const USERS_KEY = "ks_users";
const SESSION_KEY = "ks_session";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadSession);

  // Creates the account, but does NOT log the user in.
  // Returns { ok: true } or { ok: false, error }
  const register = ({ name, email, password, role }) => {
    const users = loadUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const newUser = {
      id: Date.now(),
      name,
      email,
      password, // Demo-only, front-end storage. Never store plaintext passwords in production.
      role: role || "Farmer",
      bio: "",
      location: "",
      avatarColor: "#2F5233",
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    return { ok: true };
  };

  // Returns { ok: true, user } or { ok: false, error }
  const login = ({ email, password }) => {
    const users = loadUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user || user.password !== password) {
      return { ok: false, error: "Incorrect email or password." };
    }
    // eslint-disable-next-line no-unused-vars
    const { password: _pw, ...safeUser } = user;
    setCurrentUser(safeUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return { ok: true, user: safeUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = (updates) => {
    if (!currentUser) return;
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveUsers(users);
    }
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
