import { useState } from "react";
import { useAuth } from "@/lib/auth";

const MAROON = "#4A1520";
const TEAL   = "#3D7A72";
const GOLD   = "#C8A020";
const ROSE   = "#C05870";
const CREAM  = "#F5EEE0";
const PARCH  = "#E8D5A8";
const BLACK  = "#140A04";
const INK    = "#1E0E04";

export default function LoginPage() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await login(password);
    setLoading(false);
    if (err) setError(err);
    else window.location.replace(import.meta.env.BASE_URL || "/");
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4"
      style={{
        backgroundColor: "#C8DDE0",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect width='24' height='24' fill='%23C8DDE0'/%3E%3Ccircle cx='12' cy='12' r='2' fill='none' stroke='%233D7A72' stroke-width='0.7' opacity='0.35'/%3E%3Cpath d='M12 4 L12 20 M4 12 L20 12' stroke='%233D7A72' stroke-width='0.5' opacity='0.18'/%3E%3Ccircle cx='0' cy='0' r='1' fill='%233D7A72' opacity='0.22'/%3E%3Ccircle cx='24' cy='0' r='1' fill='%233D7A72' opacity='0.22'/%3E%3Ccircle cx='0' cy='24' r='1' fill='%233D7A72' opacity='0.22'/%3E%3Ccircle cx='24' cy='24' r='1' fill='%233D7A72' opacity='0.22'/%3E%3C/svg%3E")`,
      }}>
      <div className="w-full max-w-xs" style={{ border: `3px solid ${BLACK}` }}>

        {/* Top multi-band rule */}
        <div style={{ display: "flex", height: 6 }}>
          <div style={{ flex: 1, backgroundColor: ROSE   }} />
          <div style={{ flex: 3, backgroundColor: GOLD   }} />
          <div style={{ flex: 1, backgroundColor: ROSE   }} />
        </div>
        <div style={{ height: 3, backgroundColor: MAROON }} />

        {/* Black title band — "MILLS" style */}
        <div style={{ backgroundColor: BLACK, padding: "1.4rem 2rem", textAlign: "center",
          borderBottom: `3px solid ${GOLD}` }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.52rem",
            textTransform: "uppercase", letterSpacing: "0.35em", color: TEAL,
            marginBottom: 6 }}>Established 1884</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem",
            fontWeight: 900, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase",
            textShadow: "0 2px 6px rgba(0,0,0,0.5)", lineHeight: 1 }}>
            Spencer's
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.56rem",
            textTransform: "uppercase", letterSpacing: "0.3em", color: CREAM,
            opacity: 0.7, marginTop: 6 }}>
            Recipe Emporium
          </p>
        </div>

        {/* Teal accent strip */}
        <div style={{ height: 6, backgroundColor: TEAL }} />
        <div style={{ height: 3, backgroundColor: ROSE }} />

        {/* Parchment form area */}
        <div style={{ backgroundColor: PARCH, borderBottom: `2px solid ${BLACK}` }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: "0.85rem", color: INK, opacity: 0.65, textAlign: "center",
            padding: "0.65rem 1rem 0" }}>
            Present your credentials to enter the emporium
          </p>
          <form onSubmit={handleSubmit} style={{ padding: "0.85rem 1.25rem 1.25rem" }} className="space-y-3">
            <input type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)} autoFocus required
              style={{ width: "100%", padding: "0.65rem 0.85rem",
                border: `2px solid ${BLACK}`, borderRadius: 0,
                backgroundColor: CREAM, color: INK,
                fontFamily: "'Outfit', sans-serif", fontSize: "0.88rem", outline: "none" }} />
            {error && (
              <p style={{ textAlign: "center", fontFamily: "'Outfit', sans-serif",
                fontSize: "0.78rem", color: MAROON }}>{error}</p>
            )}
            <button type="submit" disabled={loading || !password}
              style={{ width: "100%", padding: "0.65rem",
                backgroundColor: loading || !password ? `${BLACK}80` : BLACK,
                color: GOLD, fontFamily: "'Playfair Display', serif", fontSize: "0.82rem",
                fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
                border: "none", cursor: loading || !password ? "not-allowed" : "pointer",
                transition: "opacity 0.2s" }}>
              {loading ? "One moment…" : "Enter"}
            </button>
          </form>
        </div>

        {/* Bottom multi-band */}
        <div style={{ display: "flex", height: 6 }}>
          <div style={{ flex: 1, backgroundColor: MAROON }} />
          <div style={{ flex: 2, backgroundColor: TEAL   }} />
          <div style={{ flex: 1, backgroundColor: GOLD   }} />
          <div style={{ flex: 2, backgroundColor: TEAL   }} />
          <div style={{ flex: 1, backgroundColor: MAROON }} />
        </div>
      </div>

      <p className="mt-6" style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem",
        textTransform: "uppercase", letterSpacing: "0.22em", color: BLACK, opacity: 0.35 }}>
        ─── ✦ ❧ ✦ ───
      </p>
    </div>
  );
}
