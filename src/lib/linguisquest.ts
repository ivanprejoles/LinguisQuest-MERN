import { supabase } from "@/integrations/supabase/client";

export const GUEST_ID = "guest";

/**
 * =========================
 * CORE CONTENT STRUCTURE
 * =========================
 */

export type Language = {
  id: string;
  code: string;
  name: string;
  flag: string;
  active: boolean;
  display_order: number;
};

export type Vocab = {
  word: string;
  translation: string;
  pronunciation?: string;
  example?: string;
};

export type Activity =
  | { type: "tracing"; question: string; content: string; xpReward: number; font: string; audioUrl: string }
  | {
      type: "matching";
      question: string;
      pairs: { id: string; text: string; audioUrl?: string; kind?: "text" | "audio" ; definition: string; pairKey: string}[];
      xpReward: number;
    }
  | {
      type: "multipleChoice";
      question: string;
      image: string;
      subjectAudioUrl?: string;
      subject: { kind: string, value: string, definition: string };
      options: { id: string; text: string; isCorrect: boolean }[];
      xpReward: number;
      definition: string
    };

/**
 * =========================
 * HIERARCHY (FIXED)
 * =========================
 *
 * Lesson (TOP LEVEL)
 *   └── Stage (SMALLEST UNIT)
 */

export type Lesson = {
  id: string;
  lesson_number: number;
  title: string;
  description: string;
  color: string;
  icon: string;
  stage_count: number;
  display_order: number;
};

export type Stage = {
  id: string;

  // parent reference (IMPORTANT FIX)
  lesson_number: number;

  stage_number: number;

  title: string;
  description: string;
  icon: string;
  color: string;

  vocabulary: Vocab[];
  activities: Activity[];

  xp_reward: number;
  estimated_duration: number;

  display_order: number;
};

/**
 * =========================
 * PLAYER / GAMIFICATION
 * =========================
 */

export type Player = {
  id: string;
  username: string;
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: "xp" | "streak" | "lessons" | "level";
  requirement_value: number;
};

/**
 * =========================
 * FETCH: LESSONS (TOP LEVEL)
 * =========================
 */
export async function fetchLessonsByLanguage(languageId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("language_id", languageId)
    .order("display_order");
  if (error) throw error;
  return (data ?? []) as Lesson[];
}

export async function fetchLessons(): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .order("display_order");

  if (error) throw error;
  return (data ?? []) as Lesson[];
}

export async function fetchLesson(id: string): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Lesson | null;
}
export async function createLesson(input: {
  language_id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}) {
  const { data: existing } = await supabase
    .from("lessons")
    .select("lesson_number,display_order")
    .eq("language_id", input.language_id)
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder = (existing?.[0]?.display_order ?? -1) + 1;
  const nextNum = (existing?.[0]?.lesson_number ?? 0) + 1;
  const { data, error } = await supabase
    .from("lessons")
    .insert({ ...input, lesson_number: nextNum, display_order: nextOrder, stage_count: 0 })
    .select("*")
    .single();
  if (error) throw error;
  return data as Lesson;
}
export async function updateLesson(
  id: string,
  patch: Partial<Pick<Stage, "title" | "description" | "icon" | "color">>,
) {
  const { error } = await supabase.from("lessons").update(patch).eq("id", id);
  if (error) throw error;
}
export async function deleteLesson(id: string) {
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw error;
}
export async function reorderLessons(ids: string[]) {
  await Promise.all(ids.map((id, i) => supabase.from("lessons").update({ display_order: i }).eq("id", id)));
}
/**
 * =========================
 * FETCH: STAGES (INSIDE LESSON)
 * =========================
 */
export async function fetchStagesByLesson(languageId: string, lessonNumber: number): Promise<Stage[]> {
  const { data, error } = await supabase
    .from("stages")
    .select("*")
    .eq("language_id", languageId)
    .eq("lesson_number", lessonNumber)
    .order("display_order");
  if (error) throw error;
  return (data ?? []) as unknown as Stage[];
}
export async function createStage(input: {
  language_id: string;
  lesson_number: number;
  title: string;
  description: string;
  xp_reward?: number;
  estimated_duration?: number;
}) {
  const { data: existing } = await supabase
    .from("stages")
    .select("stage_number,display_order")
    .eq("language_id", input.language_id)
    .eq("lesson_number", input.lesson_number)
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder = (existing?.[0]?.display_order ?? -1) + 1;
  const nextNum = (existing?.[0]?.stage_number ?? 0) + 1;
  const { data, error } = await supabase
    .from("stages")
    .insert({
      ...input,
      stage_number: nextNum,
      display_order: nextOrder,
      xp_reward: input.xp_reward ?? 50,
      estimated_duration: input.estimated_duration ?? 10,
      vocabulary: [],
      activities: [],
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as Stage;
}
export async function updateStage(
  id: string,
  patch: Partial<Pick<Stage, "title" | "description" | "xp_reward" | "estimated_duration" | "vocabulary" | "activities">>,
) {
  const { error } = await supabase.from("stages").update(patch as never).eq("id", id);
  if (error) throw error;
}
export async function deleteStage(id: string) {
  const { error } = await supabase.from("stages").delete().eq("id", id);
  if (error) throw error;
}
export async function reorderStages(ids: string[]) {
  await Promise.all(ids.map((id, i) => supabase.from("stages").update({ display_order: i }).eq("id", id)));
}

export async function fetchStagesForLesson(
  lessonNumber: number,
): Promise<Stage[]> {
  const { data, error } = await supabase
    .from("stages")
    .select("*")
    .eq("lesson_number", lessonNumber)
    .order("display_order");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...row,

    // safe casts with fallback
    vocabulary: (row.vocabulary ?? []) as Vocab[],
    activities: (row.activities ?? []) as Activity[],
  }));
}

export async function fetchStage(id: string): Promise<Stage | null> {
  const { data, error } = await supabase
    .from("stages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Stage | null;
}

/**
 * =========================
 * PLAYER LOGIC (UNCHANGED)
 * =========================
 */

export async function fetchPlayer(id = GUEST_ID): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  if (data) return data as Player;

  const insert = await supabase
    .from("players")
    .insert({ id, username: id === GUEST_ID ? "Guest Learner" : id })
    .select("*")
    .single();

  if (insert.error) throw insert.error;
  return insert.data as Player;
}

export async function fetchBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("display_order");

  if (error) throw error;
  return (data ?? []) as Badge[];
}

export async function fetchLeaderboard(
  sortBy: "xp" | "level" | "streak" = "xp",
): Promise<Player[]> {
  const column =
    sortBy === "level"
      ? "level"
      : sortBy === "streak"
        ? "current_streak"
        : "total_xp";

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order(column, { ascending: false })
    .order("total_xp", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as Player[];
}

export async function recordStageCompletion(args: {
  playerId?: string;
  stageId: string;
  xpEarned: number;
  score?: number;
}) {
  const playerId = args.playerId ?? GUEST_ID;

  await supabase.from("player_progress").upsert(
    {
      player_id: playerId,
      stage_id: args.stageId,
      xp_earned: args.xpEarned,
      score: args.score ?? 100,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "player_id,stage_id" },
  );

  const { data: p } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .single();

  if (p) {
    const newXp = (p.total_xp ?? 0) + args.xpEarned;
    const newLevel = Math.max(1, Math.floor(newXp / 200) + 1);

    await supabase
      .from("players")
      .update({
        total_xp: newXp,
        level: newLevel,
        current_streak: Math.max(1, p.current_streak ?? 0),
        longest_streak: Math.max(
          p.longest_streak ?? 0,
          p.current_streak ?? 0,
          1,
        ),
        updated_at: new Date().toISOString(),
      })
      .eq("id", playerId);
  }

  await supabase.from("activity_log").insert({
    player_id: playerId,
    action: "stage_completed",
    details: { stage_id: args.stageId, xp: args.xpEarned },
  });
}

export async function fetchCompletedLessonIds(
  playerId = GUEST_ID,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("player_progress")
    .select("stage_id")
    .eq("player_id", playerId);

  if (error) throw error;
  return (data ?? []).map((r: { stage_id: string }) => r.stage_id);
}

export function computeEarnedBadges(
  player: Player,
  badges: Badge[],
  lessonsDone: number,
) {
  return badges
    .filter((b) => {
      switch (b.requirement_type) {
        case "xp":
          return player.total_xp >= b.requirement_value;
        case "streak":
          return player.longest_streak >= b.requirement_value;
        case "level":
          return player.level >= b.requirement_value;
        case "lessons":
          return lessonsDone >= b.requirement_value;
      }
    })
    .map((b) => b.id);
}

// ---------- Languages ----------
export async function fetchLanguages(): Promise<Language[]> {
  const { data, error } = await supabase.from("languages").select("*").order("display_order");
  if (error) throw error;
  return (data ?? []) as Language[];
}
export async function fetchLanguageByCode(code: string): Promise<Language | null> {
  const { data, error } = await supabase.from("languages").select("*").eq("code", code).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Language | null;
}
export async function createLanguage(input: { code: string; name: string; flag?: string }) {
  const { data, error } = await supabase
    .from("languages")
    .insert({ code: input.code, name: input.name, flag: input.flag ?? "🌐" })
    .select("*")
    .single();
  if (error) throw error;
  return data as Language;
}
export async function updateLanguage(id: string, patch: Partial<Pick<Language, "name" | "flag" | "active" | "display_order">>) {
  const { error } = await supabase.from("languages").update(patch).eq("id", id);
  if (error) throw error;
}
export async function deleteLanguage(id: string) {
  const { error } = await supabase.from("languages").delete().eq("id", id);
  if (error) throw error;
}
