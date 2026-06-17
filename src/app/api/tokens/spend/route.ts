import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, REPORT_TOKEN_COST } from "@/lib/supabase-server";

/**
 * POST /api/tokens/spend
 *
 * Spends REPORT_TOKEN_COST tokens to unlock a report.
 * Atomic: verify balance → decrement → log tx → create unlock record.
 *
 * Body: { projectId: string }
 * Auth: Bearer JWT from the client session.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify caller session
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Parse body
    const body = await req.json();
    const { projectId } = body as { projectId: string };

    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    // Check if already unlocked
    const { data: existing } = await supabaseAdmin
      .from("unlocked_reports")
      .select("id")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .single();

    if (existing) {
      return NextResponse.json({
        ok: true,
        alreadyUnlocked: true,
        message: "Report already unlocked",
      });
    }

    // Check balance
    const { data: account, error: accountError } = await supabaseAdmin
      .from("user_accounts")
      .select("token_balance")
      .eq("id", userId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if ((account.token_balance ?? 0) < REPORT_TOKEN_COST) {
      return NextResponse.json(
        {
          error: `Insufficient tokens. Need ${REPORT_TOKEN_COST}, have ${account.token_balance ?? 0}`,
          balance: account.token_balance ?? 0,
          cost: REPORT_TOKEN_COST,
        },
        { status: 402 },
      );
    }

    // Decrement balance
    const newBalance = account.token_balance - REPORT_TOKEN_COST;
    const { error: updateError } = await supabaseAdmin
      .from("user_accounts")
      .update({ token_balance: newBalance })
      .eq("id", userId);

    if (updateError) {
      console.error("[spend] balance update error:", updateError);
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
    }

    // Log transaction
    const { error: txError } = await supabaseAdmin
      .from("token_transactions")
      .insert({
        user_id: userId,
        amount: -REPORT_TOKEN_COST,
        type: "spend",
        reason: `Unlock report: ${projectId}`,
        project_id: projectId,
      });

    if (txError) {
      console.error("[spend] tx log error:", txError);
    }

    // Create unlock record
    const { error: unlockError } = await supabaseAdmin
      .from("unlocked_reports")
      .insert({
        user_id: userId,
        project_id: projectId,
        method: "tokens",
        tokens_spent: REPORT_TOKEN_COST,
      });

    if (unlockError) {
      console.error("[spend] unlock record error:", unlockError);
      // Balance was decremented but unlock failed — refund
      await supabaseAdmin
        .from("user_accounts")
        .update({ token_balance: account.token_balance })
        .eq("id", userId);
      return NextResponse.json(
        { error: "Failed to create unlock record — tokens refunded" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      unlocked: true,
      projectId,
      tokensSpent: REPORT_TOKEN_COST,
      remainingBalance: newBalance,
    });
  } catch (err) {
    console.error("[spend] unexpected:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
