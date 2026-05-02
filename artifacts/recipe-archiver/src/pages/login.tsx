import { useState } from "react";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/lib/auth";

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
    if (err) setError(err);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-medium tracking-wide">Recipe Archiver</h1>
          <p className="text-sm text-muted-foreground">Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Checking…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
