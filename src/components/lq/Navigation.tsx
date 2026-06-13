import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export default function Navigation() {
  return (
    <nav className="fixed top-0 w-full bg-card/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/user/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">LinguisQuest</span>
          </Link>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/user/dashboard" className="text-muted-foreground hover:text-foreground transition" activeProps={{ className: "text-foreground font-semibold" }}>
              Dashboard
            </Link>
            <Link to="/user/leaderboard" className="text-muted-foreground hover:text-foreground transition" activeProps={{ className: "text-foreground font-semibold" }}>
              Leaderboard
            </Link>
            <Link to="/user/achievements" className="text-muted-foreground hover:text-foreground transition" activeProps={{ className: "text-foreground font-semibold" }}>
              Achievements
            </Link>
            <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground border border-border">
              Guest mode
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}