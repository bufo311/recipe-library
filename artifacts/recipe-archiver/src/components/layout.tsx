import { Link } from "wouter";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

/* Maltby's-inspired palette */
const GREEN   = "#1D5C35";   /* forest green — main banner */
const GREEN_D = "#143F24";   /* darker green — bottom edge */
const CLARET  = "#8C1F28";   /* crimson — scroll ends */
const GOLD    = "#C8A020";   /* amber gold — lettering */
const CREAM   = "#F5EEE0";   /* paper cream */
const TEAL    = "#3D7A72";   /* Eastern Mills teal accent */

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* ── Top colour bar: claret / gold / claret — like Maltby's triple rule ── */}
      <div style={{ display: "flex", height: 6 }}>
        <div style={{ flex: 1, backgroundColor: CLARET }} />
        <div style={{ flex: 2, backgroundColor: GOLD }} />
        <div style={{ flex: 1, backgroundColor: CLARET }} />
      </div>

      <header style={{ backgroundColor: GREEN, boxShadow: "0 4px 16px rgba(0,0,0,0.45)" }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6">
          {/* Shop sign */}
          <Link href="/" className="flex flex-col leading-none group">
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.6rem",
                fontWeight: 900,
                color: GOLD,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textShadow: "0 1px 4px rgba(0,0,0,0.4)",
              }}
            >
              Spencer's
            </span>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.55rem",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: CREAM,
                opacity: 0.72,
                marginTop: 1,
              }}
            >
              Recipe Emporium
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-0 text-xs">
            {[
              { href: "/",          label: "Stock"        },
              { href: "/reference", label: "Reference"    },
              { href: "/recipe/new",label: "Add to Ledger"},
            ].map((item, i, arr) => (
              <span key={item.href} className="flex items-center">
                <Link
                  href={item.href}
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    padding: "0.25rem 0.85rem",
                    color: location === item.href ? GOLD : CREAM,
                    borderBottom: location === item.href ? `2px solid ${GOLD}` : "2px solid transparent",
                    transition: "color 0.15s, border-color 0.15s",
                  }}
                >
                  {item.label}
                </Link>
                {i < arr.length - 1 && (
                  <span style={{ color: GOLD, opacity: 0.45, fontSize: "0.65rem" }}>✦</span>
                )}
              </span>
            ))}

            <span style={{ color: GOLD, opacity: 0.3, margin: "0 0.5rem", fontSize: "0.65rem" }}>✦</span>
            <button
              onClick={logout}
              title="Sign out"
              style={{ color: CREAM, opacity: 0.55, transition: "opacity 0.15s" }}
              className="hover:opacity-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        </div>

        {/* Bottom triple rule: thin claret / thick green shadow line */}
        <div style={{ height: 3, backgroundColor: GREEN_D }} />
        <div style={{ height: 2, backgroundColor: CLARET, opacity: 0.7 }} />
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer
        className="py-8 mt-12 text-center text-sm"
        style={{
          borderTop: `4px double ${GREEN}`,
          color: "#6B4F2A",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          backgroundColor: "#E8D8B8",
        }}
      >
        <div style={{ color: CLARET, marginBottom: 4, fontSize: "0.8rem", letterSpacing: "0.2em" }}>✦ ─── ❧ ─── ✦</div>
        <p>Entered at Stationers' Hall. All receipts faithfully preserved.</p>
        <p style={{ fontSize: "0.7rem", opacity: 0.5, marginTop: 4, fontFamily: "'Outfit', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>Est. 1884</p>
      </footer>
    </div>
  );
}
