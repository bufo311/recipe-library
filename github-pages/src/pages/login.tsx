import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme-context";
import { LabelFrame } from "@/components/label-frame";

export default function LoginPage() {
  const { login } = useAuth();
  const { colors: c, patterns: p } = useTheme();
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
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4">
      <LabelFrame className="w-full max-w-xs" variant={0}>

        {/* Title band */}
        <div style={{ backgroundColor: c.sage, padding: "1.4rem 2rem", textAlign: "center",
          borderBottom: `3px solid ${c.black}` }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.52rem",
            textTransform: "uppercase", letterSpacing: "0.35em", color: c.cream, opacity: 0.65, marginBottom: 6 }}>
            Established 2026
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem",
            fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
            color: c.cream, textShadow: `1px 1px 0 rgba(0,0,0,0.5), 3px 3px 0 rgba(0,0,0,0.3)`,
            lineHeight: 1 }}>
            Spencer's
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.56rem",
            textTransform: "uppercase", letterSpacing: "0.3em", color: c.cream, opacity: 0.7, marginTop: 6 }}>
            Recipe Emporium
          </p>
        </div>

        {/* Divider bands */}
        <div style={{ height: 10, backgroundImage: p.cableTeal, backgroundRepeat: "repeat-x" }} />
        <div style={{ height: 3, backgroundColor: c.rose }} />

        {/* Form */}
        <div style={{ backgroundColor: c.parch }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: "0.85rem", color: c.ink, opacity: 0.65, textAlign: "center",
            padding: "0.65rem 1rem 0" }}>
            Present your credentials to enter the emporium
          </p>
          <form onSubmit={handleSubmit} style={{ padding: "0.85rem 1.25rem 1.25rem" }} className="space-y-3">
            <input type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)} autoFocus required
              style={{ width: "100%", padding: "0.65rem 0.85rem",
                border: `2px solid ${c.black}`, borderRadius: 0,
                backgroundColor: c.cream, color: c.ink,
                fontFamily: "'Outfit', sans-serif", fontSize: "0.88rem", outline: "none" }} />
            {error && (
              <p style={{ textAlign: "center", fontFamily: "'Outfit', sans-serif",
                fontSize: "0.78rem", color: c.maroon }}>{error}</p>
            )}
            <button type="submit" disabled={loading || !password}
              style={{ width: "100%", padding: "0.65rem",
                backgroundColor: loading || !password ? `${c.sage}80` : c.sage,
                color: c.cream, fontFamily: "'Playfair Display', serif", fontSize: "0.82rem",
                fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
                border: "none", cursor: loading || !password ? "not-allowed" : "pointer",
                textShadow: `1px 1px 0 rgba(0,0,0,0.4)`, transition: "opacity 0.2s" }}>
              {loading ? "One moment…" : "Enter"}
            </button>
          </form>
        </div>

      </LabelFrame>

      <p className="mt-6" style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem",
        textTransform: "uppercase", letterSpacing: "0.22em", color: c.black, opacity: 0.35 }}>
        ─── ✦ ❧ ✦ ───
      </p>
    </div>
  );
}
