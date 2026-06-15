import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import Navigation from "@/components/lq/Navigation";
import LessonCard from "@/components/lq/LessonCard";
import { fetchStagesForLesson, fetchLesson, fetchCompletedStageIds } from "@/lib/linguisquest";
import StageCard from "@/components/lq/StageCard";

export const Route = createFileRoute("/user/language/$langCode/foundation/stages/$lessonId")({
  head: () => ({ meta: [{ title: "Lessons — LinguisQuest" }] }),
  component: StagesForLesson,
});

function StagesForLesson() {
  const { lessonId } = Route.useParams();
  const { langCode } = Route.useParams();
  const n = parseInt(lessonId, 10);
  const lesson = useQuery({ queryKey: ["lesson", n], queryFn: () => fetchLesson(n.toString()) });
  const stages = useQuery({ queryKey: ["stages", n], queryFn: () => fetchStagesForLesson(n) });
  const done = useQuery({ queryKey: ["done"], queryFn: () => fetchCompletedStageIds() });
  const doneSet = new Set(done.data ?? []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <Link to="/user/dashboard" className="inline-flex items-center gap-2 text-primary hover:opacity-80 mb-8">
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
        {lesson.data && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">{lesson.data.title}</h1>
            <p className="text-muted-foreground">{lesson.data.description}</p>
          </div>
        )}
        {stages.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : stages.data && stages.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stages.data.map((s) => (
              <Link key={s.id} to="/user/language/$langCode/foundation/stage/$stageId" params={{ langCode, stageId: s.id }}>
                <StageCard stage={s} done={doneSet.has(s.id)} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">No lessons in this stage yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}