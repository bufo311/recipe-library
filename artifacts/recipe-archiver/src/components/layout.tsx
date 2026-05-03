import { Link } from "wouter";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

/* Eastern Mills palette */
const MAROON = "#4A1520";
const TEAL   = "#3D7A72";
const GOLD   = "#C8A020";
const ROSE   = "#C05870";
const CREAM  = "#F5EEE0";
const BLACK  = "#140A04";
const SAGE   = "#5E7A58";   /* MILLS green — title background */

/* Decorative SVG band patterns */
const EGG_DART_MAROON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='12'%3E%3Crect width='20' height='12' fill='%234A1520'/%3E%3Cellipse cx='10' cy='6' rx='8' ry='3.5' fill='%23C8A020' opacity='0.28'/%3E%3Cellipse cx='10' cy='6' rx='5.5' ry='2' fill='%234A1520'/%3E%3Ccircle cx='0' cy='6' r='2' fill='%23C8A020' opacity='0.4'/%3E%3Ccircle cx='20' cy='6' r='2' fill='%23C8A020' opacity='0.4'/%3E%3C/svg%3E")`;
const CABLE_TEAL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='10'%3E%3Crect width='20' height='10' fill='%233D7A72'/%3E%3Cpath d='M0 5 Q5 1 10 5 Q15 9 20 5' fill='none' stroke='%23F5EEE0' stroke-width='0.9' opacity='0.35'/%3E%3Cpath d='M0 5 Q5 9 10 5 Q15 1 20 5' fill='none' stroke='%23F5EEE0' stroke-width='0.9' opacity='0.35'/%3E%3C/svg%3E")`;

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col">

      {/* Eastern Mills top rule: rose | gold | rose */}
      <div style={{ display: "flex", height: 5 }}>
        <div style={{ flex: 1, backgroundColor: ROSE  }} />
        <div style={{ flex: 3, backgroundColor: GOLD  }} />
        <div style={{ flex: 1, backgroundColor: ROSE  }} />
      </div>
      <div style={{ height: 3, backgroundColor: MAROON }} />

      <header style={{ backgroundColor: BLACK, boxShadow: "0 6px 24px rgba(0,0,0,0.55)" }}>
        <div className="container mx-auto px-4 flex items-stretch" style={{ minHeight: 72 }}>

          {/* Left maroon column */}
          <div style={{ backgroundColor: MAROON, padding: "0 1.5rem",
            display: "flex", alignItems: "center",
            marginLeft: -16, marginRight: 24, borderRight: `3px solid ${GOLD}` }}>
            <Link href="/" className="flex flex-col leading-none">
              {/* MILLS-style drop-shadow title */}
              <span style={{
                fontFamily: "'Playfair Display', serif", fontSize: "1.6rem",
                fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
                color: CREAM,
                textShadow: `1px 1px 0 ${MAROON}, 3px 3px 0 #1A0808, 4px 4px 0 rgba(0,0,0,0.25)`,
              }}>
                Spencer's
              </span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.5rem",
                letterSpacing: "0.35em", textTransform: "uppercase", color: CREAM, opacity: 0.6, marginTop: 2 }}>
                Recipe Emporium
              </span>
            </Link>
          </div>

          {/* Nav */}
          <div style={{ flex: 1, display: "flex", alignItems: "center",
            justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
              background: `linear-gradient(105deg, transparent 30%, ${TEAL} 30%, ${TEAL} 70%, transparent 70%)`,
              opacity: 0.2 }} />
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

        {/* Egg-and-dart decorative band */}
        <div style={{ height: 12, backgroundImage: EGG_DART_MAROON, backgroundRepeat: "repeat-x" }} />
        {/* Cable teal band */}
        <div style={{ height: 10, backgroundImage: CABLE_TEAL, backgroundRepeat: "repeat-x" }} />
        <div style={{ height: 3, backgroundColor: ROSE }} />
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-8 mt-12 text-center text-sm"
        style={{ color: CREAM, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
        <div style={{ height: 3, backgroundColor: ROSE, marginBottom: 0 }} />
        <div style={{ height: 10, backgroundImage: CABLE_TEAL, backgroundRepeat: "repeat-x" }} />
        <div style={{ height: 12, backgroundImage: EGG_DART_MAROON, backgroundRepeat: "repeat-x", marginBottom: 16 }} />
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
