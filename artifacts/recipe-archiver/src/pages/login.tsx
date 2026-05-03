import { useState } from "react";
import { useAuth } from "@/lib/auth";

const DARK_BROWN = "#2C1810";
const CLARET = "#722F37";
const CREAM = "#FDFBF7";
const GOLD = "#D4AF37";

export default function LoginPage() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await login(password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      window.location.replace(import.meta.env.BASE_URL || "/");
    }
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#F5EFE6" }}
    >
      <div className="w-full max-w-sm space-y-8">

        {/* Shop sign header */}
        <div className="text-center space-y-1">
          <div
            className="inline-flex flex-col items-center px-10 py-5 mb-2"
            style={{ backgroundColor: DARK_BROWN, border: `4px double ${GOLD}` }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2rem",
                fontWeight: 700,
                color: GOLD,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Spencer's
            </span>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.55rem",
                color: CREAM,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                opacity: 0.75,
                marginTop: 2,
              }}
            >
              Recipe Emporium
            </span>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.5rem",
                color: CREAM,
                opacity: 0.45,
                fontStyle: "italic",
                marginTop: 2,
              }}
            >
              Est. 1884
            </span>
          </div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: DARK_BROWN,
              opacity: 0.7,
            }}
          >
            Present your credentials to enter the emporium
          </p>
        </div>

        {/* Login form in Victorian border */}
        <div
          style={{
            border: `3px double ${DARK_BROWN}`,
            padding: 3,
            backgroundColor: CREAM,
          }}
        >
          <div style={{ border: `1px solid ${DARK_BROWN}`, opacity: 0.25, position: "absolute", pointerEvents: "none" }} />
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: `1px solid ${DARK_BROWN}`,
                borderRadius: 0,
                backgroundColor: "#FFF9EB",
                color: DARK_BROWN,
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            {error && (
              <p
                style={{
                  textAlign: "center",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.8rem",
                  color: CLARET,
                }}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: loading || !password ? `${DARK_BROWN}80` : DARK_BROWN,
                color: CREAM,
                fontFamily: "'Playfair Display', serif",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                border: "none",
                cursor: loading || !password ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
              }}
            >
              {loading ? "One moment…" : "Enter"}
            </button>
          </form>
        </div>

        <p
          className="text-center"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.6rem",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: DARK_BROWN,
            opacity: 0.35,
          }}
        >
          ─── ✦ ❧ ✦ ───
        </p>
      </div>
    </div>
  );
}
