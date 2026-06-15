import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/lq/Navigation";
import StageCard from "@/components/lq/StageCard";
import UserStats from "@/components/lq/UserStats";
import { Loader2 } from "lucide-react";
import {
  fetchLessons, fetchPlayer, fetchBadges, fetchCompletedStageIds, computeEarnedBadges,
} from "@/lib/linguisquest";
import LessonCard from "@/components/lq/LessonCard";

export const Route = createFileRoute("/user/language/$langCode/foundation/")({
  head: () => ({ meta: [{ title: "Dashboard — LinguisQuest" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { langCode } = Route.useParams();
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: fetchLessons });
  const player = useQuery({ queryKey: ["player"], queryFn: () => fetchPlayer() });
  const badges = useQuery({ queryKey: ["badges"], queryFn: fetchBadges });
  const done = useQuery({ queryKey: ["done"], queryFn: () => fetchCompletedStageIds() });

  const earned = player.data && badges.data && done.data
    ? computeEarnedBadges(player.data, badges.data, done.data.length).length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {player.data?.username ?? "Learner"}! 👋
          </h1>
          <p className="text-muted-foreground">Continue your Filipino learning journey</p>
        </div>

        {player.data && (
          <UserStats
            xp={player.data.total_xp}
            streak={player.data.current_streak}
            level={player.data.level}
            badges={earned}
          />
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Learning Stages</h2>
          {lessons.isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.data?.map((lesson) => (
                <Link key={lesson.id} to="/user/language/$langCode/foundation/lesson/$lessonId" params={{ langCode: langCode, lessonId: String(lesson.lesson_number) }}>
                  <LessonCard lesson={lesson} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}