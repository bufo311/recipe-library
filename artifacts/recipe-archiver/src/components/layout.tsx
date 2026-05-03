import { Link } from "wouter";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useTheme } from "@/lib/theme-context";
import { ThemeEditorButton } from "./theme-editor";

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [location] = useLocation();
  const { colors: c, patterns: p } = useTheme();

  return (
    <div className="min-h-[100dvh] flex flex-col">

      <header style={{ backgroundColor: c.black }}>

        {/* ── Very top accent rule ── */}
        <div style={{ display: "flex", height: 4 }}>
          <div style={{ flex: 1, backgroundColor: c.rose }} />
          <div style={{ flex: 4, backgroundColor: c.gold }} />
          <div style={{ flex: 1, backgroundColor: c.rose }} />
        </div>

        {/* ── TOP: Vulcan-style spaced-diamond band ── */}
        <div style={{
          height: 20,
          backgroundImage: p.spacedDiamond,
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 20px",
          borderBottom: `1.5px solid ${c.gold}`,
        }} />

        {/* ── Inner teal rule ── */}
        <div style={{ height: 3, backgroundColor: c.teal }} />

        {/* ── Main nav bar ── */}
        <div className="container mx-auto px-4 flex items-stretch" style={{ minHeight: 60 }}>

          {/* Logo column */}
          <div style={{
            backgroundColor: c.maroon,
            padding: "0 1.5rem",
            display: "flex", alignItems: "center",
            marginLeft: -16, marginRight: 24,
            borderRight: `2px solid ${c.gold}`,
          }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ textAlign: "center" }}>
                <span style={{
                  display: "block",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.42rem", letterSpacing: "0.45em",
                  textTransform: "uppercase", color: c.gold, opacity: 0.75,
                }}>Est. 1884</span>
                <span style={{
                  display: "block",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.55rem", fontWeight: 900,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: c.cream, lineHeight: 1,
                  textShadow: `1px 1px 0 rgba(0,0,0,0.4), 2px 2px 0 rgba(0,0,0,0.25)`,
                }}>Spencer's</span>
                <span style={{
                  display: "block",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.42rem", letterSpacing: "0.32em",
                  textTransform: "uppercase", color: c.cream, opacity: 0.5, marginTop: 4,
                }}>Recipe Emporium</span>
                <div style={{ marginTop: 5, color: c.gold, fontSize: "0.5rem", opacity: 0.45, letterSpacing: "0.15em" }}>
                  ── ✦ ──
                </div>
              </div>
            </Link>
          </div>

          {/* Nav + actions */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center",
            justifyContent: "space-between",
            position: "relative", overflow: "hidden",
          }}>
            {/* Subtle diagonal teal wash */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: `linear-gradient(105deg, transparent 28%, ${c.teal} 28%, ${c.teal} 72%, transparent 72%)`,
              opacity: 0.10,
            }} />

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
                    color: location === item.href ? c.gold : c.cream,
                    borderBottom: location === item.href ? `2px solid ${c.gold}` : "2px solid transparent",
                    transition: "color 0.15s",
                  }}>
                    {item.label}
                  </Link>
                  {i < arr.length - 1 && (
                    <span style={{ color: c.gold, opacity: 0.3, fontSize: "0.5rem" }}>◆</span>
                  )}
                </span>
              ))}
            </nav>

            <div className="flex items-center gap-2 relative z-10 mr-2">
              <ThemeEditorButton />
              <button onClick={logout} title="Sign out"
                style={{ color: c.cream, opacity: 0.4, transition: "opacity 0.15s" }}
                className="hover:opacity-100">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Inner teal rule ── */}
        <div style={{ height: 3, backgroundColor: c.teal }} />

        {/* ── BOTTOM: Vulcan-style spaced-diamond band ── */}
        <div style={{
          height: 20,
          backgroundImage: p.spacedDiamond,
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 20px",
          borderTop: `1.5px solid ${c.gold}`,
        }} />

        {/* ── Very bottom accent rule ── */}
        <div style={{ display: "flex", height: 4 }}>
          <div style={{ flex: 1, backgroundColor: c.rose }} />
          <div style={{ flex: 4, backgroundColor: c.gold }} />
          <div style={{ flex: 1, backgroundColor: c.rose }} />
        </div>

      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-12 text-center text-sm"
        style={{ color: c.cream, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>

        {/* Matching footer frame */}
        <div style={{ display: "flex", height: 4 }}>
          <div style={{ flex: 1, backgroundColor: c.rose }} />
          <div style={{ flex: 4, backgroundColor: c.gold }} />
          <div style={{ flex: 1, backgroundColor: c.rose }} />
        </div>
        <div style={{
          height: 20,
          backgroundImage: p.spacedDiamond,
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 20px",
          borderBottom: `1.5px solid ${c.gold}`,
        }} />
        <div style={{ height: 3, backgroundColor: c.teal }} />

        <div style={{ backgroundColor: c.black, padding: "1.25rem 0" }}>
          <div style={{ color: c.gold, marginBottom: 4, fontSize: "0.8rem", letterSpacing: "0.2em" }}>✦ ─── ❧ ─── ✦</div>
          <p style={{ color: c.cream, opacity: 0.65 }}>Entered at Stationers' Hall. All receipts faithfully preserved.</p>
          <p style={{ fontSize: "0.65rem", opacity: 0.35, marginTop: 4, fontFamily: "'Outfit', sans-serif",
            letterSpacing: "0.2em", textTransform: "uppercase", color: c.gold }}>Est. 1884</p>
        </div>

        <div style={{ height: 3, backgroundColor: c.teal }} />
        <div style={{
          height: 20,
          backgroundImage: p.spacedDiamond,
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 20px",
          borderTop: `1.5px solid ${c.gold}`,
        }} />
        <div style={{ display: "flex", height: 4 }}>
          <div style={{ flex: 1, backgroundColor: c.rose }} />
          <div style={{ flex: 4, backgroundColor: c.gold }} />
          <div style={{ flex: 1, backgroundColor: c.rose }} />
        </div>
      </footer>

    </div>
  );
}
