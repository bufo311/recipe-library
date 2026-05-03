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

      {/* Top rule: rose | gold | rose */}
      <div style={{ display: "flex", height: 5 }}>
        <div style={{ flex: 1, backgroundColor: c.rose }} />
        <div style={{ flex: 3, backgroundColor: c.gold }} />
        <div style={{ flex: 1, backgroundColor: c.rose }} />
      </div>
      <div style={{ height: 3, backgroundColor: c.maroon }} />

      <header style={{ backgroundColor: c.black, boxShadow: "0 6px 24px rgba(0,0,0,0.55)" }}>
        <div className="container mx-auto px-4 flex items-stretch" style={{ minHeight: 72 }}>

          {/* Left maroon column */}
          <div style={{ backgroundColor: c.maroon, padding: "0 1.5rem",
            display: "flex", alignItems: "center",
            marginLeft: -16, marginRight: 24, borderRight: `3px solid ${c.gold}` }}>
            <Link href="/" className="flex flex-col leading-none">
              <span style={{
                fontFamily: "'Playfair Display', serif", fontSize: "1.6rem",
                fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
                color: c.cream,
                textShadow: `1px 1px 0 ${c.maroon}, 3px 3px 0 rgba(0,0,0,0.25)`,
              }}>
                Spencer's
              </span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.5rem",
                letterSpacing: "0.35em", textTransform: "uppercase", color: c.cream, opacity: 0.6, marginTop: 2 }}>
                Recipe Emporium
              </span>
            </Link>
          </div>

          {/* Nav */}
          <div style={{ flex: 1, display: "flex", alignItems: "center",
            justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
              background: `linear-gradient(105deg, transparent 30%, ${c.teal} 30%, ${c.teal} 70%, transparent 70%)`,
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
                    color: location === item.href ? c.gold : c.cream,
                    borderBottom: location === item.href ? `2px solid ${c.gold}` : "2px solid transparent",
                    transition: "color 0.15s",
                  }}>
                    {item.label}
                  </Link>
                  {i < arr.length - 1 && (
                    <span style={{ color: c.gold, opacity: 0.35, fontSize: "0.6rem" }}>✦</span>
                  )}
                </span>
              ))}
            </nav>
            <div className="flex items-center gap-2 relative z-10 mr-2">
              <ThemeEditorButton />
              <button onClick={logout} title="Sign out"
                style={{ color: c.cream, opacity: 0.45, transition: "opacity 0.15s" }}
                className="hover:opacity-100">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: 12, backgroundImage: p.eggDartMaroon, backgroundRepeat: "repeat-x" }} />
        <div style={{ height: 10, backgroundImage: p.cableTeal, backgroundRepeat: "repeat-x" }} />
        <div style={{ height: 3, backgroundColor: c.rose }} />
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-8 mt-12 text-center text-sm"
        style={{ color: c.cream, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
        <div style={{ height: 3, backgroundColor: c.rose }} />
        <div style={{ height: 10, backgroundImage: p.cableTeal, backgroundRepeat: "repeat-x" }} />
        <div style={{ height: 12, backgroundImage: p.eggDartMaroon, backgroundRepeat: "repeat-x", marginBottom: 16 }} />
        <div style={{ backgroundColor: c.black, padding: "1.25rem 0" }}>
          <div style={{ color: c.gold, marginBottom: 4, fontSize: "0.8rem", letterSpacing: "0.2em" }}>✦ ─── ❧ ─── ✦</div>
          <p style={{ color: c.cream, opacity: 0.65 }}>Entered at Stationers' Hall. All receipts faithfully preserved.</p>
          <p style={{ fontSize: "0.65rem", opacity: 0.35, marginTop: 4, fontFamily: "'Outfit', sans-serif",
            letterSpacing: "0.2em", textTransform: "uppercase", color: c.gold }}>Est. 1884</p>
        </div>
      </footer>
    </div>
  );
}
