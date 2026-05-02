import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthState {
  authenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setAuthenticated(d.authenticated === true))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  async function login(password: string): Promise<string | null> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      return null;
    }
    const data = await res.json().catch(() => ({}));
    return (data as { error?: string }).error ?? "Incorrect password";
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ authenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
