import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * POST /api/tokens/grant
 *
 * Admin-only: credit tokens to a user by email.
 *
 * Body: { email: string, amount: number, reason: string }
 *
 * Verifies the caller is an admin by checking their JWT against user_accounts.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the caller's session
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Check admin flag
    const { data: adminAccount } = await supabaseAdmin
      .from("user_accounts")
      .select("is_admin")
      .eq("id", userData.user.id)
      .single();

    if (!adminAccount?.is_admin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    // Parse body
    const body = await req.json();
    const { email, amount, reason } = body as {
      email: string;
      amount: number;
      reason: string;
    };

    if (!email || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "email and positive amount required" },
        { status: 400 },
      );
    }

    // Find target user by email
    const { data: targetAccount, error: findError } = await supabaseAdmin
      .from("user_accounts")
      .select("id, email, token_balance")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (findError || !targetAccount) {
      return NextResponse.json(
        { error: `No user found with email ${email}` },
        { status: 404 },
      );
    }

    // Credit tokens
    const newBalance = (targetAccount.token_balance ?? 0) + amount;
    const { error: updateError } = await supabaseAdmin
      .from("user_accounts")
      .update({ token_balance: newBalance })
      .eq("id", targetAccount.id);

    if (updateError) {
      console.error("[grant] update error:", updateError);
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
    }

    // Log transaction
    const { error: txError } = await supabaseAdmin
      .from("token_transactions")
      .insert({
        user_id: targetAccount.id,
        amount,
        type: "grant",
        reason: reason || "Manual grant",
        granted_by: userData.user.id,
      });

    if (txError) {
      console.error("[grant] tx log error:", txError);
      // Balance was updated but log failed — not fatal, but log it
    }

    return NextResponse.json({
      ok: true,
      email: targetAccount.email,
      granted: amount,
      newBalance,
    });
  } catch (err) {
    console.error("[grant] unexpected:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
