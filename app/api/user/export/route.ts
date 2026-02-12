import { NextResponse } from "next/server";
import { getAuthUser, createServerClient } from "@/lib/supabase-server";

/**
 * GET /api/user/export
 * RGPD Art. 20 — Droit à la portabilité des données.
 * Returns all user data as a structured JSON download.
 * Requires Bearer token authentication.
 */
export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié. Veuillez vous connecter." }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    const { data, error } = await supabase.from("user_progress").select("*").eq("user_id", user.id).single();

    if (error && error.code !== "PGRST116") {
      console.error("[Export] DB error:", error);
      return NextResponse.json({ error: "Erreur lors de la récupération des données." }, { status: 500 });
    }

    // Fetch analysis history
    const { data: history } = await supabase
      .from("user_analysis_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const exportData = {
      export_info: {
        format: "JSON",
        exported_at: new Date().toISOString(),
        service: "maimoirkouest",
        rgpd_article: "Art. 20 — Droit à la portabilité",
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || null,
        created_at: user.created_at,
      },
      progress: data
        ? {
            quests: data.quests,
            completed_steps: data.completed_steps,
            analysis: data.analysis,
            requirements_summary: data.requirements_summary,
            domain: data.domain,
            active_quest: data.active_quest,
            updated_at: data.updated_at,
          }
        : null,
      analysis_history: history || [],
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="maimoirkouest-export-${user.id.slice(0, 8)}.json"`,
      },
    });
  } catch (e) {
    console.error("[Export] Error:", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
