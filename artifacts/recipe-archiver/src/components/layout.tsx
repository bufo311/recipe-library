import { Link } from "wouter";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

/* Eastern Mills palette */
const MAROON  = "#4A1520";   /* left column / dark zone */
const TEAL    = "#3D7A72";   /* diagonal banner */
const GOLD    = "#C8A020";   /* lettering + rules */
const ROSE    = "#C05870";   /* accent strip */
const CREAM   = "#F5EEE0";   /* paper */
const BLACK   = "#140A04";   /* sunburst band */

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col">

      {/* Eastern Mills multi-band top rule */}
      <div style={{ display: "flex", height: 5 }}>
        <div style={{ flex: 1, backgroundColor: ROSE   }} />
        <div style={{ flex: 3, backgroundColor: GOLD   }} />
        <div style={{ flex: 1, backgroundColor: ROSE   }} />
      </div>
      <div style={{ height: 3, backgroundColor: MAROON }} />

      <header style={{ backgroundColor: BLACK, boxShadow: "0 6px 24px rgba(0,0,0,0.55)" }}>
        <div className="container mx-auto px-4 flex items-stretch" style={{ minHeight: 68 }}>

          {/* Left maroon column — like Eastern Mills botanical sidebar */}
          <div style={{ backgroundColor: MAROON, padding: "0 1.5rem", display: "flex",
            alignItems: "center", marginLeft: -16, marginRight: 24,
            borderRight: `3px solid ${GOLD}` }}>
            <Link href="/" className="flex flex-col leading-none">
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.55rem",
                fontWeight: 900, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase",
                textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
                Spencer's
              </span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.5rem",
                letterSpacing: "0.35em", textTransform: "uppercase", color: CREAM, opacity: 0.65, marginTop: 2 }}>
                Recipe Emporium
              </span>
            </Link>
          </div>

          {/* Teal diagonal banner — nav area */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "relative", overflow: "hidden" }}>
            {/* Diagonal teal slash behind nav */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
              background: `linear-gradient(105deg, transparent 30%, ${TEAL} 30%, ${TEAL} 70%, transparent 70%)`,
              opacity: 0.25 }} />

            <nav className="flex items-center gap-0 relative z-10">
              {[
                { href: "/",           label: "Stock"         },
                { href: "/reference",  label: "Reference"     },
                { href: "/recipe/new", label: "Add to Ledger" },
              ].map((item, i, arr) => (
                <span key={item.href} className="flex items-center">
                  <Link href={item.href} style={{
                    fontFamily: "'Playfair Display', serif", fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.68rem",
                    padding: "0.3rem 0.9rem",
                    color: location === item.href ? GOLD : CREAM,
                    borderBottom: location === item.href ? `2px solid ${GOLD}` : "2px solid transparent",
                    transition: "color 0.15s",
                  }}>
                    {item.label}
                  </Link>
                  {i < arr.length - 1 && (
                    <span style={{ color: GOLD, opacity: 0.35, fontSize: "0.6rem" }}>✦</span>
                  )}
                </span>
              ))}
            </nav>

            <button onClick={logout} title="Sign out"
              style={{ color: CREAM, opacity: 0.45, transition: "opacity 0.15s", position: "relative", zIndex: 10 }}
              className="hover:opacity-100 mr-4">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom: teal band + gold rule + rose strip */}
        <div style={{ height: 6, backgroundColor: TEAL }} />
        <div style={{ height: 2, backgroundColor: GOLD }} />
        <div style={{ height: 4, backgroundColor: ROSE }} />
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-8 mt-12 text-center text-sm"
        style={{ borderTop: `none`, color: CREAM, fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic" }}>
        {/* Multi-band footer top rule */}
        <div style={{ display: "flex", height: 4, marginBottom: 16 }}>
          <div style={{ flex: 1, backgroundColor: MAROON }} />
          <div style={{ flex: 2, backgroundColor: TEAL }} />
          <div style={{ flex: 1, backgroundColor: GOLD }} />
          <div style={{ flex: 2, backgroundColor: TEAL }} />
          <div style={{ flex: 1, backgroundColor: MAROON }} />
        </div>
        <div style={{ backgroundColor: BLACK, padding: "1.25rem 0" }}>
          <div style={{ color: GOLD, marginBottom: 4, fontSize: "0.8rem", letterSpacing: "0.2em" }}>✦ ─── ❧ ─── ✦</div>
          <p style={{ color: CREAM, opacity: 0.65 }}>Entered at Stationers' Hall. All receipts faithfully preserved.</p>
          <p style={{ fontSize: "0.65rem", opacity: 0.35, marginTop: 4, fontFamily: "'Outfit', sans-serif",
            letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD }}>Est. 1884</p>
        </div>
      </footer>
    </div>
  );
}
