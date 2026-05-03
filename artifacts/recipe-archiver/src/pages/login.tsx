import { useState } from "react";
import { useAuth } from "@/lib/auth";

const GREEN  = "#1D5C35";
const CLARET = "#8C1F28";
const GOLD   = "#C8A020";
const CREAM  = "#F5EEE0";
const PARCH  = "#E8D5A8";
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
    if (err) { setError(err); }
    else { window.location.replace(import.meta.env.BASE_URL || "/"); }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4"
      style={{
        backgroundColor: "#EAE0CC",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 0 L40 20 L20 40 L0 20 Z' fill='none' stroke='%23A08020' stroke-width='0.6' opacity='0.22'/%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23A08020' opacity='0.12'/%3E%3Ccircle cx='0' cy='0' r='1.5' fill='%23A08020' opacity='0.12'/%3E%3Ccircle cx='40' cy='0' r='1.5' fill='%23A08020' opacity='0.12'/%3E%3Ccircle cx='0' cy='40' r='1.5' fill='%23A08020' opacity='0.12'/%3E%3Ccircle cx='40' cy='40' r='1.5' fill='%23A08020' opacity='0.12'/%3E%3C/svg%3E")`,
      }}>
      <div className="w-full max-w-xs space-y-7">

        {/* Triple-rule top bar */}
        <div style={{ display: "flex", height: 5 }}>
          <div style={{ flex: 1, backgroundColor: CLARET }} />
          <div style={{ flex: 2, backgroundColor: GOLD }} />
          <div style={{ flex: 1, backgroundColor: CLARET }} />
        </div>

        {/* Shop sign — green banner with gold lettering */}
        <div style={{ backgroundColor: GREEN, border: `2px solid ${INK}`, textAlign: "center", padding: "1.25rem 2rem" }}>
          <div style={{ border: `1px solid ${GOLD}`, padding: "0.75rem 1.25rem", opacity: 0.9 }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", textTransform: "uppercase",
              letterSpacing: "0.35em", color: CREAM, opacity: 0.65, marginBottom: 4 }}>
              Established 1884
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.1rem", fontWeight: 900,
              color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase",
              textShadow: "0 1px 4px rgba(0,0,0,0.4)", lineHeight: 1 }}>
              Spencer's
            </h1>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.58rem", textTransform: "uppercase",
              letterSpacing: "0.3em", color: CREAM, opacity: 0.75, marginTop: 4 }}>
              Recipe Emporium
            </p>
          </div>
        </div>

        {/* Gold rule */}
        <div style={{ height: 3, backgroundColor: GOLD, marginTop: 0 }} />

        {/* Login form — cream label area */}
        <div style={{ border: `2px solid ${INK}`, backgroundColor: CREAM }}>
          <div style={{ backgroundColor: PARCH, padding: "0.4rem 1rem", borderBottom: `1px solid ${INK}`, textAlign: "center" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
              fontSize: "0.85rem", color: INK, opacity: 0.65 }}>
              Present your credentials to enter the emporium
            </p>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }} className="space-y-3">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: `1px solid ${INK}`,
                borderRadius: 0, backgroundColor: "#FFF9EB", color: INK,
                fontFamily: "'Outfit', sans-serif", fontSize: "0.88rem", outline: "none" }}
            />
            {error && (
              <p style={{ textAlign: "center", fontFamily: "'Outfit', sans-serif",
                fontSize: "0.78rem", color: CLARET }}>{error}</p>
            )}
            <button type="submit" disabled={loading || !password}
              style={{ width: "100%", padding: "0.65rem", backgroundColor: loading || !password ? `${GREEN}80` : GREEN,
                color: CREAM, fontFamily: "'Playfair Display', serif", fontSize: "0.8rem",
                fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
                border: "none", cursor: loading || !password ? "not-allowed" : "pointer",
                transition: "opacity 0.2s" }}>
              {loading ? "One moment…" : "Enter"}
            </button>
          </form>
        </div>

        {/* Bottom ornament */}
        <p className="text-center" style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem",
          textTransform: "uppercase", letterSpacing: "0.22em", color: INK, opacity: 0.3 }}>
          ─── ✦ ❧ ✦ ───
        </p>
      </div>
    </div>
  );
}
