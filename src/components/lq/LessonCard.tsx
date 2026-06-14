import type { Lesson, Stage } from "@/lib/linguisquest";

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <div className="relative rounded-lg p-6 border bg-gradient-to-br from-card to-card/60 border-border hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer">
      <div className="text-4xl mb-4">{lesson.icon}</div>
      <h3 className="text-xl font-bold text-foreground mb-2">{lesson.title}</h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{lesson.description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">{lesson.stage_count} lessons</span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: lesson.color }}
        >
          {lesson.lesson_number}
        </div>
      </div>
    </div>
  );
}