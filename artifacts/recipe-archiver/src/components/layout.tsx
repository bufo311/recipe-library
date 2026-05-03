import { Link } from "wouter";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col selection:bg-primary/20 selection:text-primary">
      <header
        className="sticky top-0 z-50 shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
        style={{ backgroundColor: "#2C1810", borderBottom: "6px solid #150b07" }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6">
          <Link href="/" className="flex flex-col leading-none group">
            <span
              className="tracking-[0.15em] uppercase drop-shadow-sm transition-opacity group-hover:opacity-80"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#D4AF37",
              }}
            >
              Spencer's
            </span>
            <span
              className="tracking-[0.3em] uppercase opacity-70"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "#E8DCC4" }}
            >
              Recipe Emporium
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-xs tracking-widest uppercase">
            <Link
              href="/"
              className="px-3 py-1 transition-colors"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: location === "/" ? "#D4AF37" : "#E8DCC4",
              }}
            >
              Stock
            </Link>
            <span style={{ color: "#D4AF37", opacity: 0.4 }}>✦</span>
            <Link
              href="/reference"
              className="px-3 py-1 transition-colors"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: location === "/reference" ? "#D4AF37" : "#E8DCC4",
              }}
            >
              Reference
            </Link>
            <span style={{ color: "#D4AF37", opacity: 0.4 }}>✦</span>
            <Link
              href="/recipe/new"
              className="px-3 py-1 transition-colors"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: "#E8DCC4",
              }}
            >
              Add to Ledger
            </Link>
            <span style={{ color: "#D4AF37", opacity: 0.4, marginLeft: "0.5rem" }}>✦</span>
            <button
              onClick={logout}
              title="Sign out"
              className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: "#E8DCC4" }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        </div>
        <div
          className="text-center text-[10px] italic pb-1.5 opacity-50"
          style={{ fontFamily: "'Outfit', sans-serif", color: "#E8DCC4", letterSpacing: "0.2em" }}
        >
          Est. 1884
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer
        className="py-8 mt-12 text-center text-sm"
        style={{
          borderTop: "4px double #2C1810",
          color: "hsl(var(--muted-foreground))",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
        }}
      >
        <p>Entered at Stationers' Hall. All receipts faithfully preserved.</p>
      </footer>
    </div>
  );
}
