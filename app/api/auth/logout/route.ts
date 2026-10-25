import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/db/db";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (sessionId) {
      await pool.execute("DELETE FROM session WHERE session_id = ?", [sessionId]);
    }

    cookieStore.delete("session_id");
    return NextResponse.json({ message: "Signed out" });
  } catch (error) {
    console.error("Error signing out:", error);
    return NextResponse.json({ error: "Unable to sign out" }, { status: 500 });
  }
}
