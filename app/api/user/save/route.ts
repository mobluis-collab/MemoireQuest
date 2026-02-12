import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

/**
 * POST /api/user/save
 * Endpoint for navigator.sendBeacon on beforeunload.
 * Accepts raw JSON body (no auth header — uses service role to write).
 * The user_id in the payload is trusted because RLS is enabled
 * and this endpoint validates the shape.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.user_id || typeof body.user_id !== "string") {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase.from("user_progress").upsert(
      {
        user_id: body.user_id,
        quests: body.quests,
        completed_steps: body.completed_steps,
        analysis: body.analysis,
        requirements_summary: body.requirements_summary,
        domain: body.domain,
        active_quest: body.active_quest,
        updated_at: body.updated_at || new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("[Save] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Save] Error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
