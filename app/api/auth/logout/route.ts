import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function POST(request: Request) {
  try {
    const sessionId = request.headers.get("x-session-id");

    if (sessionId) {
      await pool.execute("DELETE FROM session WHERE session_id = ?", [sessionId]);
    }

    return NextResponse.json({ message: "Signed out" });
  } catch (error) {
    console.error("Error signing out:", error);
    return NextResponse.json({ error: "Unable to sign out" }, { status: 500 });
  }
}
