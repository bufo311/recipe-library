import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const SESSION_KEY = "ra_auth";
const CORRECT = import.meta.env.VITE_APP_PASSWORD as string | undefined;

interface AuthState {
  authenticated: boolean;
  login: (password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  });

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, authenticated ? "1" : "");
  }, [authenticated]);

  function login(password: string): string | null {
    if (!CORRECT) {
      setAuthenticated(true);
      return null;
    }
    if (password === CORRECT) {
      setAuthenticated(true);
      return null;
    }
    return "Incorrect password";
  }

  function logout() {
    setAuthenticated(false);
    sessionStorage.removeItem(SESSION_KEY);
  }

  return (
    <AuthContext.Provider value={{ authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
