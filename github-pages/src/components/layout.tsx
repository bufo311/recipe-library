import { Link } from "wouter";
import { BookOpen } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col selection:bg-primary/20 selection:text-primary">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <BookOpen className="w-5 h-5" />
            <span className="font-serif font-medium text-lg tracking-wide">Recipe Archiver</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/recipe/new" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Write a Recipe
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="py-8 border-t border-border/50 mt-12 text-center text-sm text-muted-foreground">
        <p>A quiet kitchen companion.</p>
      </footer>
    </div>
  );
}
