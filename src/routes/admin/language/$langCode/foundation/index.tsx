import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Pencil, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SortableList } from "@/components/lq/SortableList";
import {
  fetchLanguageByCode,
  fetchLessonsByLanguage,
  createLesson,
  updateStage,
  deleteStage,
  reorderStages,
  type Stage,
  deleteLesson,
  reorderLessons,
  Lesson,
  updateLesson,
} from "@/lib/linguisquest";

export const Route = createFileRoute("/admin/language/$langCode/foundation/")({
  head: () => ({ meta: [{ title: "Admin · Foundation roadmap" }] }),
  beforeLoad: async ({ params }) => {
    const l = await fetchLanguageByCode(params.langCode);
    if (!l) throw redirect({ to: "/admin" });
  },
  component: AdminFoundation,
});

function AdminFoundation() {
  const { langCode } = Route.useParams();
  const qc = useQueryClient();
  const lang = useQuery({ queryKey: ["language", langCode], queryFn: () => fetchLanguageByCode(langCode) });
  const lessons = useQuery({
    queryKey: ["admin-lessons", langCode],
    queryFn: async () => (lang.data ? fetchLessonsByLanguage(lang.data.id) : []),
    enabled: !!lang.data,
  });

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", icon: "📚", color: "#3b82f6" });
  const [editId, setEditId] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-stages", langCode] });

  const addM = useMutation({
    mutationFn: () => createLesson({ ...form, language_id: lang.data!.id }),
    onSuccess: () => { setCreating(false); setForm({ title: "", description: "", icon: "📚", color: "#3b82f6" }); invalidate(); },
  });
  const delM = useMutation({ mutationFn: (id: string) => deleteLesson(id), onSuccess: invalidate });
  const reorderM = useMutation({ mutationFn: (ids: string[]) => reorderLessons(ids) });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin · {lang.data?.name} · Foundation roadmap</h1>
          <Link to="/admin/language/$langCode" params={{ langCode }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Features
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Lessons</h2>
            <p className="text-sm text-muted-foreground">Drag to reorder the learning path. Click a lesson to edit its levels.</p>
          </div>
          {!creating && (
            <Button onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4 mr-1" /> New lesson
            </Button>
          )}
        </div>

        {creating && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description (definition)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-2">
              <Input placeholder="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-32" />
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-20" />
              <div className="flex-1" />
              <Button variant="ghost" onClick={() => setCreating(false)}><X className="w-4 h-4" /></Button>
              <Button onClick={() => addM.mutate()} disabled={!form.title.trim() || addM.isPending}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        )}

        {lessons.isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        ) : (lessons.data?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground">No lessons yet.</p>
        ) : (
          <SortableList
            items={lessons.data ?? []}
            onReorder={(ids) => reorderM.mutate(ids)}
            renderItem={(l) => (
              <LessonRow
                lesson={l}
                editing={editId === l.id}
                onEditToggle={() => setEditId(editId === l.id ? null : l.id)}
                onSaved={() => { setEditId(null); invalidate(); }}
                onDelete={() => { if (confirm(`Delete lesson "${l.title}"? Levels will be deleted too.`)) delM.mutate(l.id); }}
                langCode={langCode}
              />
            )}
          />
        )}
      </main>
    </div>
  );
}

function LessonRow({
  lesson,
  editing,
  onEditToggle,
  onSaved,
  onDelete,
  langCode,
}: {
  lesson: Lesson;
  editing: boolean;
  onEditToggle: () => void;
  onSaved: () => void;
  onDelete: () => void;
  langCode: string;
}) {
  const [draft, setDraft] = useState(lesson);
  const save = useMutation({
    mutationFn: () =>
      updateLesson(lesson.id, {
        title: draft.title,
        description: draft.description,
        icon: draft.icon,
        color: draft.color,
      }),
    onSuccess: onSaved,
  });

  if (editing) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <div className="flex gap-2">
          <Input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} className="w-32" />
          <Input type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className="w-20" />
          <div className="flex-1" />
          <Button variant="ghost" onClick={onEditToggle}><X className="w-4 h-4" /></Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4 mr-1" /> Save</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: lesson.color + "33" }}>
        {lesson.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold truncate">{lesson.title}</div>
        <div className="text-sm text-muted-foreground truncate">{lesson.description}</div>
        <div className="text-xs text-muted-foreground mt-1">Stage {lesson.lesson_number} · {lesson.stage_count} levels</div>
      </div>
      <div className="flex gap-2">
        <Link to="/admin/language/$langCode/foundation/lesson/$lessonId" params={{ langCode: langCode,lessonId: lesson.id }}>
          <Button size="sm" variant="secondary">Levels</Button>
        </Link>
        <Button size="sm" variant="ghost" onClick={onEditToggle}><Pencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="w-4 h-4 text-red-400" /></Button>
      </div>
    </div>
  );
}