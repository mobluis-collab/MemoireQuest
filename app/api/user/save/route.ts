import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.field === "deadline") {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.value)) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Update plan_data.deadline in the memoir_plans table
    const { data: existingPlan } = await supabase
      .from("memoir_plans")
      .select("id, plan_data")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (!existingPlan) {
      return NextResponse.json({ error: "No plan found" }, { status: 404 });
    }

    const updatedPlanData = {
      ...existingPlan.plan_data,
      deadline: body.value,
    };

    const { error } = await supabase
      .from("memoir_plans")
      .update({ plan_data: updatedPlanData, updated_at: new Date().toISOString() })
      .eq("id", existingPlan.id);

    if (error) {
      console.error("[save] Deadline update error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown field" }, { status: 400 });
}
