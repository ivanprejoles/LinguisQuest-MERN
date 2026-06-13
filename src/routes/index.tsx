import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LinguisQuest — Learn Filipino" },
      { name: "description", content: "Interactive Filipino learning. Demo mode, no login required." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
      <nav className="px-6 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold">⚡</div>
            <span className="font-bold text-lg">LinguisQuest</span>
          </div>
          <Link to="/user/dashboard" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition">
            Enter (Guest)
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8 mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Learn Filipino the Fun Way
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Interactive lessons, tracing, matching and multiple-choice activities — all open, no sign-in.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/user/dashboard" className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 text-lg">
              Start Learning
            </Link>
            <Link to="/user/leaderboard" className="px-8 py-4 border border-primary rounded-lg font-semibold hover:bg-primary/10 text-lg">
              View Leaderboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            { e: "📚", t: "Foundation Learning", d: "6-stage path from letters to fluent conversation." },
            { e: "🎮", t: "Interactive Activities", d: "Tracing, matching, and multiple-choice — practice every way." },
            { e: "🏆", t: "Stats & Badges", d: "Track XP, streaks, levels, and unlock achievements." },
          ].map((f) => (
            <div key={f.t} className="bg-card border border-border rounded-lg p-8">
              <div className="text-4xl mb-4">{f.e}</div>
              <h3 className="text-xl font-bold mb-2">{f.t}</h3>
              <p className="text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
