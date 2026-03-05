import { createClient } from "@/lib/supabase/server";
import { getXPForDifficulty, MAX_LEVEL, LEVEL_THRESHOLDS } from "@/lib/xp/levels";
import type { QuestProgress, StreakData, MemoirePlan, SectionProgress } from "@/types/memoir";
import { isSectionDone } from "@/types/memoir";
import type { ComboState } from "@/lib/combo";
import { updateCombo, getComboBonus } from "@/lib/combo";
import { NextResponse } from "next/server";
import { z } from "zod";

const RequestSchema = z.object({
  chapterNumber: z.string(),
  sectionIndex: z.number().int().min(0),
  taskIndex: z.number().int().min(0).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", remaining: 0 }, { status: 400 });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten(), remaining: 0 },
      { status: 400 }
    );
  }

  const { chapterNumber, sectionIndex, taskIndex } = parsed.data;

  const { data: plan, error: fetchError } = await supabase
    .from("memoir_plans")
    .select("id, quest_progress, total_points, streak_data, plan_data, combo_state")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !plan) {
    return NextResponse.json({ error: "Plan not found", remaining: 0 }, { status: 404 });
  }

  const planData: MemoirePlan = plan.plan_data;
  const questProgress: QuestProgress = plan.quest_progress ?? {};
  if (!questProgress[chapterNumber]) questProgress[chapterNumber] = {};

  // Trouver la section dans le plan pour récupérer la difficulté
  const chapterIndex = planData.chapters.findIndex((ch) => ch.number === chapterNumber);
  if (chapterIndex === -1) {
    return NextResponse.json({ error: "Chapter not found in plan", remaining: 0 }, { status: 404 });
  }

  const chapter = planData.chapters[chapterIndex];
  const section = chapter.sections[sectionIndex];
  if (!section) {
    return NextResponse.json({ error: "Section not found in chapter", remaining: 0 }, { status: 404 });
  }

  // Calculer l'XP selon la difficulté
  let xpEarned = getXPForDifficulty(section.difficulty);

  // Détecter si c'est un boss chapter (≥60% sections hard)
  const hardCount = chapter.sections.filter((s) => s.difficulty === "hard").length;
  const isBossChapter = hardCount / chapter.sections.length >= 0.6;

  const streak: StreakData = plan.streak_data ?? { current: 0, last_activity: null, jokers: 1 };
  let comboState: ComboState = plan.combo_state ?? { count: 0, lastQuestTime: null };
  let newTotalPoints = plan.total_points ?? 0;

  const currentProgress = questProgress[chapterNumber][sectionIndex] as SectionProgress | undefined;
  let wasAlreadyDone = isSectionDone(currentProgress);
  let isNowDone = false;

  if (taskIndex !== undefined) {
    // NOUVEAU : toggle d'une sous-tâche spécifique
    const taskCount = section.tasks?.length ?? 0;
    let tasksBools: boolean[];

    if (currentProgress === "done") {
      // Rétro-compat : old format, toutes les tâches étaient done
      tasksBools = Array(taskCount).fill(true);
    } else if (currentProgress && typeof currentProgress === "object" && "tasks" in currentProgress) {
      tasksBools = [...currentProgress.tasks];
      // S'assurer que le tableau a la bonne longueur
      while (tasksBools.length < taskCount) tasksBools.push(false);
    } else {
      tasksBools = Array(taskCount).fill(false);
    }

    // Toggle la tâche spécifique
    if (taskIndex < tasksBools.length) {
      tasksBools[taskIndex] = !tasksBools[taskIndex];
    }

    isNowDone = tasksBools.length > 0 && tasksBools.every(Boolean);
    questProgress[chapterNumber][sectionIndex] = { tasks: tasksBools } as SectionProgress;
  } else {
    // ANCIEN : toggle de toute la section (rétro-compatibilité)
    if (wasAlreadyDone) {
      delete questProgress[chapterNumber][sectionIndex];
      isNowDone = false;
    } else {
      questProgress[chapterNumber][sectionIndex] = "done";
      isNowDone = true;
    }
  }

  if (wasAlreadyDone && !isNowDone) {
    // Décocher : retirer la quête et les points
    let bossBonus = 0;
    if (isBossChapter) {
      const completedCount = Object.values(questProgress[chapterNumber]).filter((v) =>
        isSectionDone(v as SectionProgress)
      ).length;
      if (completedCount === chapter.sections.length - 1) {
        bossBonus = 50;
      }
    }
    newTotalPoints = Math.max(0, newTotalPoints - xpEarned - bossBonus);
  } else if (!wasAlreadyDone && isNowDone) {
    // Section complétée : ajouter les points
    comboState = updateCombo(comboState);
    const comboBonus = getComboBonus(comboState.count);

    const completedCount = Object.values(questProgress[chapterNumber]).filter((v) =>
      isSectionDone(v as SectionProgress)
    ).length;
    const isChapterComplete = completedCount === chapter.sections.length;

    if (isBossChapter && isChapterComplete) {
      xpEarned += 50;
    }
    xpEarned += comboBonus;

    const maxXP = LEVEL_THRESHOLDS[MAX_LEVEL - 1];
    newTotalPoints = Math.min(maxXP, newTotalPoints + xpEarned);

    const today = new Date().toISOString().split("T")[0];
    const lastActivity = streak.last_activity ? streak.last_activity.split("T")[0] : null;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (lastActivity === today) {
      // Déjà actif aujourd'hui, streak inchangé
    } else if (lastActivity === yesterday) {
      streak.current += 1;
      streak.last_activity = today;
    } else {
      streak.current = 1;
      streak.last_activity = today;
    }
  }
  // Si ni wasAlreadyDone→false ni false→done : pas de changement XP (tâche togglée dans une section non complétée)

  const { error: updateError } = await supabase
    .from("memoir_plans")
    .update({
      quest_progress: questProgress,
      total_points: newTotalPoints,
      streak_data: streak,
      combo_state: comboState,
      updated_at: new Date().toISOString(),
    })
    .eq("id", plan.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update quest progress", remaining: 0 }, { status: 500 });
  }

  return NextResponse.json({ questProgress, totalPoints: newTotalPoints, streak, comboState });
}
