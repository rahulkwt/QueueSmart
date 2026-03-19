import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Lazy initializer: rehydrate user from localStorage on first render
  // so the session survives page refreshes without an extra effect
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  /**
   * Persists user data to localStorage and updates auth state.
   * Called after a successful login API response.
   * @param {Object} userData - { id, name, email, role, token }
   */
  function login(userData) {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    console.log("User logged in:", userData);
  }

  /**
   * Clears user data from localStorage, resets auth state, and redirects to login.
   */
  function logout() {
    console.log("User logged out:", user);
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Convenience hook for consuming auth context.
 * Returns { user, login, logout } from the nearest AuthProvider.
 */
export function useAuth() {
  return useContext(AuthContext);
}
