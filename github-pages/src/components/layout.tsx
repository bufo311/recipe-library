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
              <div style={{ textAlign: "center", padding: "0.25rem 0" }}>

                {/* "Est. 2026" — tiny spaced caps above */}
                <span style={{
                  display: "block",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.38rem", letterSpacing: "0.5em",
                  textTransform: "uppercase", color: c.gold, opacity: 0.6,
                  marginBottom: 2,
                }}>Est. ✦ 2026</span>

                {/* Main display word — Birshen-style layered shadow */}
                <span style={{
                  display: "block",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "2.4rem", fontWeight: 900,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: c.gold,
                  lineHeight: 0.95,
                  textShadow: [
                    /* black outline — all 8 directions */
                    `-1px -1px 0 ${c.black}`,
                    ` 1px -1px 0 ${c.black}`,
                    `-1px  1px 0 ${c.black}`,
                    ` 1px  1px 0 ${c.black}`,
                    `-2px  0   0 ${c.black}`,
                    ` 2px  0   0 ${c.black}`,
                    ` 0   -2px 0 ${c.black}`,
                    ` 0    2px 0 ${c.black}`,
                    /* maroon drop shadow */
                    ` 3px  4px 0 ${c.maroon}`,
                    ` 4px  5px 0 ${c.maroon}80`,
                  ].join(", "),
                }}>Spencer's</span>

                {/* "Recipe Emporium" banner */}
                <div style={{
                  marginTop: 5,
                  backgroundColor: c.black,
                  border: `1px solid ${c.gold}40`,
                  padding: "0.18rem 0.5rem",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ color: c.gold, fontSize: "0.35rem", opacity: 0.5 }}>◆</span>
                  <span style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "0.4rem", letterSpacing: "0.35em",
                    textTransform: "uppercase", color: c.cream, opacity: 0.7,
                  }}>Recipe Emporium</span>
                  <span style={{ color: c.gold, fontSize: "0.35rem", opacity: 0.5 }}>◆</span>
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
          <p style={{ color: c.cream, opacity: 0.65 }}>your quiet kitchen companion</p>
          <p style={{ fontSize: "0.65rem", opacity: 0.35, marginTop: 4, fontFamily: "'Outfit', sans-serif",
            letterSpacing: "0.2em", textTransform: "uppercase", color: c.gold }}>Est. 2026</p>
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
