import { createClient } from "@/lib/supabase/server";
import type { ChapterStatus } from "@/types/memoir";
import { NextResponse } from "next/server";
import { z } from "zod";

const RequestSchema = z.object({
  chapterNumber: z.string(),
  status: z.enum(["not_started", "in_progress", "done"]),
});

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { chapterNumber, status } = parsed.data;

  // Récupérer le plan actif
  const { data: plan, error: fetchError } = await supabase
    .from("memoir_plans")
    .select("id, chapter_progress")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const currentProgress: Record<string, ChapterStatus> = plan.chapter_progress ?? {};
  const updatedProgress = { ...currentProgress, [chapterNumber]: status };

  const { error: updateError } = await supabase
    .from("memoir_plans")
    .update({ chapter_progress: updatedProgress, updated_at: new Date().toISOString() })
    .eq("id", plan.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }

  return NextResponse.json({ chapterNumber, status });
}
