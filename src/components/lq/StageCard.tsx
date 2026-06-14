import { Clock, BookOpen } from "lucide-react";
import type { Stage } from "@/lib/linguisquest";

export default function StageCard({ stage, done }: { stage: Stage; done?: boolean }) {
  return (
    <div className={`rounded-lg p-6 border transition-all cursor-pointer ${done ? "bg-emerald-500/10 border-emerald-500/40" : "bg-gradient-to-br from-card to-card/60 border-border hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20"}`}>
      <div className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground text-sm font-bold mb-4">
        {stage.lesson_number}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{stage.title}</h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{stage.description}</p>
      <div className="mb-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Vocabulary</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {stage.vocabulary.slice(0, 3).map((v, i) => (
            <span key={i} className="px-2 py-1 bg-muted rounded text-xs text-foreground/80">{v.word}</span>
          ))}
          {stage.vocabulary.length > 3 && (
            <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">+{stage.vocabulary.length - 3} more</span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{stage.estimated_duration} min</span>
        </div>
        <div className="flex items-center gap-1 text-yellow-400 font-semibold text-sm">
          {done ? "✓ Completed" : `+${stage.xp_reward} XP`}
        </div>
      </div>
    </div>
  );
}