    import { createFileRoute, Link, redirect } from "@tanstack/react-router";
    import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
    import { useState } from "react";
    import { ArrowLeft, Plus, Trash2, Pencil, Loader2, Save, X, Wrench } from "lucide-react";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import { Textarea } from "@/components/ui/textarea";
    import { SortableList } from "@/components/lq/SortableList";
    import {
    fetchLanguageByCode,
    // createLesson,
    // updateLesson,
    // deleteLesson,
    // reorderLessons,
    // type Lesson,
    fetchLesson,
    fetchStagesByLesson,
    createStage,
    deleteStage,
    reorderStages,
    Stage,
    updateStage,
    } from "@/lib/linguisquest";

    export const Route = createFileRoute("/admin/language/$langCode/foundation/lesson/$lessonId/")({
    head: () => ({ meta: [{ title: "Admin · Lessons" }] }),
    beforeLoad: async ({ params }) => {
        const l = await fetchLanguageByCode(params.langCode);
        if (!l) throw redirect({ to: "/admin" });
    },
    component: AdminLesson,
    });

    function AdminLesson() {
    const { langCode, lessonId } = Route.useParams();
    const qc = useQueryClient();
    const lang = useQuery({ queryKey: ["language", langCode], queryFn: () => fetchLanguageByCode(langCode) });
    const lesson = useQuery({ queryKey: ["lesson-id", lessonId], queryFn: () => fetchLesson(lessonId) });
    const stages = useQuery({
        queryKey: ["admin-stages", langCode, lesson.data?.lesson_number],
        queryFn: async () =>
        lang.data && lesson.data ? fetchStagesByLesson(lang.data.id, lesson.data.lesson_number) : [],
        enabled: !!lang.data && !!lesson.data,
    });

    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", xp_reward: 50 });
    const [editId, setEditId] = useState<string | null>(null);

    const invalidate = () =>
        qc.invalidateQueries({ queryKey: ["admin-stages", langCode, lesson.data?.lesson_number] });

    const addM = useMutation({
        mutationFn: () =>
        createStage({
            language_id: lang.data!.id,
            lesson_number: lesson.data!.lesson_number,
            title: form.title,
            description: form.description,
            xp_reward: form.xp_reward,
        }),
        onSuccess: () => { setCreating(false); setForm({ title: "", description: "", xp_reward: 50 }); invalidate(); },
    });
    const delM = useMutation({ mutationFn: (id: string) => deleteStage(id), onSuccess: invalidate });
    const reorderM = useMutation({ mutationFn: (ids: string[]) => reorderStages(ids) });

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
        <header className="border-b border-border bg-card/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">Admin · {lesson.data?.title ?? "Stage"} · Levels</h1>
            <Link to="/admin/language/$langCode/foundation" params={{ langCode }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Roadmap
            </Link>
            </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
            <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold">Levels (stepping stones)</h2>
                <p className="text-sm text-muted-foreground">Drag to reorder. Use “Activities” to author matching, tracing or multiple-choice.</p>
            </div>
            {!creating && (
                <Button onClick={() => setCreating(true)}>
                <Plus className="w-4 h-4 mr-1" /> New level
                </Button>
            )}
            </div>

            {creating && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">XP reward:</span>
                <Input type="number" value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: parseInt(e.target.value) || 0 })} className="w-24" />
                <div className="flex-1" />
                <Button variant="ghost" onClick={() => setCreating(false)}><X className="w-4 h-4" /></Button>
                <Button onClick={() => addM.mutate()} disabled={!form.title.trim() || addM.isPending}>
                    <Save className="w-4 h-4 mr-1" /> Save
                </Button>
                </div>
            </div>
            )}

            {stages.isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (stages.data?.length ?? 0) === 0 ? (
            <p className="text-muted-foreground">No levels yet.</p>
            ) : (
            <SortableList
                items={stages.data ?? []}
                onReorder={(ids) => reorderM.mutate(ids)}
                renderItem={(s) => (
                <StageRow
                    stage={s}
                    lessonId={lessonId}
                    langCode={langCode}
                    editing={editId === s.id}
                    onEditToggle={() => setEditId(editId === s.id ? null : s.id)}
                    onSaved={() => { setEditId(null); invalidate(); }}
                    onDelete={() => { if (confirm(`Delete level "${s.title}"?`)) delM.mutate(s.id); }}
                />
                )}
            />
            )}
        </main>
        </div>
    );
    }

    function StageRow({
    stage,
    langCode,
    lessonId,
    editing,
    onEditToggle,
    onSaved,
    onDelete,
    }: {
    stage: Stage;
    langCode: string;
    lessonId: string;
    editing: boolean;
    onEditToggle: () => void;
    onSaved: () => void;
    onDelete: () => void;
    }) {
    const [draft, setDraft] = useState(stage);
    const save = useMutation({
        mutationFn: () =>
        updateStage(stage.id, {
            title: draft.title,
            description: draft.description,
            xp_reward: draft.xp_reward,
        }),
        onSuccess: onSaved,
    });

    if (editing) {
        return (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">XP:</span>
            <Input type="number" value={draft.xp_reward} onChange={(e) => setDraft({ ...draft, xp_reward: parseInt(e.target.value) || 0 })} className="w-24" />
            <div className="flex-1" />
            <Button variant="ghost" onClick={onEditToggle}><X className="w-4 h-4" /></Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4 mr-1" /> Save</Button>
            </div>
        </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
            {stage.stage_number}
        </div>
        <div className="flex-1 min-w-0">
            <div className="font-bold truncate">{stage.title}</div>
            <div className="text-sm text-muted-foreground truncate">{stage.description}</div>
            <div className="text-xs text-muted-foreground mt-1">{stage.activities.length} activities · {stage.xp_reward} XP</div>
        </div>
        <div className="flex gap-2">
            <Link to="/admin/language/$langCode/foundation/lesson/$lessonId/stage/$stageId" params={{ langCode, lessonId, stageId: stage.id }}>
            <Button size="sm" variant="secondary"><Wrench className="w-4 h-4 mr-1" /> Activities</Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={onEditToggle}><Pencil className="w-4 h-4" /></Button>
            <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="w-4 h-4 text-red-400" /></Button>
        </div>
        </div>
    );
    }