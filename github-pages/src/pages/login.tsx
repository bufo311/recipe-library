import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme-context";
import { LabelFrame } from "@/components/label-frame";
import mansHeadUrl from "@/assets/mans-head.svg";

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
    <div className="min-h-[100dvh] flex flex-col items-center justify-center">
      <div style={{ position: "relative", width: "min(100vw, 460px)" }}>

        {/* Card sits BEHIND the SVG — visible through the transparent mouth */}
        <div style={{
          position: "absolute",
          top: "31%",
          left: "52%",
          transform: "translateX(-50%) scaleY(1.19)",
          transformOrigin: "top center",
          width: "57%",
          zIndex: 1,
        }}>
          <LabelFrame className="w-full" variant={0}>

            {/* Title band */}
            <div style={{ backgroundColor: c.sage, padding: "1rem 1.5rem", textAlign: "center",
              borderBottom: `3px solid ${c.black}` }}>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.44rem",
                textTransform: "uppercase", letterSpacing: "0.35em", color: c.cream, opacity: 0.65, marginBottom: 4 }}>
                Established 2026
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem",
                fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
                color: c.cream, textShadow: `1px 1px 0 rgba(0,0,0,0.5), 3px 3px 0 rgba(0,0,0,0.3)`,
                lineHeight: 1 }}>
                Spencer's
              </h1>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.46rem",
                textTransform: "uppercase", letterSpacing: "0.3em", color: c.cream, opacity: 0.7, marginTop: 4 }}>
                Recipe Emporium
              </p>
            </div>

            {/* Divider bands */}
            <div style={{ height: 8, backgroundImage: p.cableTeal, backgroundRepeat: "repeat-x" }} />
            <div style={{ height: 2, backgroundColor: c.rose }} />

            {/* Form */}
            <div style={{ backgroundColor: c.parch }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: "0.7rem", color: c.ink, opacity: 0.65, textAlign: "center",
                padding: "0.5rem 0.75rem 0" }}>
                Present your credentials to enter the emporium
              </p>
              <form onSubmit={handleSubmit} style={{ padding: "0.6rem 0.9rem 0.9rem" }} className="space-y-2">
                <input type="password" placeholder="Password" value={password}
                  onChange={e => setPassword(e.target.value)} autoFocus required
                  style={{ width: "100%", padding: "0.5rem 0.65rem",
                    border: `2px solid ${c.black}`, borderRadius: 0,
                    backgroundColor: c.cream, color: c.ink,
                    fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", outline: "none" }} />
                {error && (
                  <p style={{ textAlign: "center", fontFamily: "'Outfit', sans-serif",
                    fontSize: "0.7rem", color: c.maroon }}>{error}</p>
                )}
                <button type="submit" disabled={loading || !password}
                  style={{ width: "100%", padding: "0.5rem",
                    backgroundColor: loading || !password ? `${c.sage}80` : c.sage,
                    color: c.cream, fontFamily: "'Playfair Display', serif", fontSize: "0.72rem",
                    fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
                    border: "none", cursor: loading || !password ? "not-allowed" : "pointer",
                    textShadow: `1px 1px 0 rgba(0,0,0,0.4)`, transition: "opacity 0.2s" }}>
                  {loading ? "One moment…" : "Enter"}
                </button>
              </form>
            </div>

          </LabelFrame>
        </div>

        {/* Head SVG on top (z-index 2) — transparent mouth reveals the card below.
            pointer-events: none keeps the form fully interactive. */}
        <img
          src={mansHeadUrl}
          alt=""
          style={{ width: "100%", display: "block", position: "relative", zIndex: 2, pointerEvents: "none" }}
        />

      </div>

      <p className="mt-4" style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem",
        textTransform: "uppercase", letterSpacing: "0.22em", color: c.black, opacity: 0.35 }}>
        ─── ✦ ❧ ✦ ───
      </p>
    </div>
  );
}
