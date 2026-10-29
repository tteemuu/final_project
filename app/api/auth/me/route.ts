// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { RowDataPacket } from "mysql2";
import pool from "@/db/db";

interface SessionRow extends RowDataPacket {
  role: string;
  expires_at: Date | string;
  name: string;
  email: string;
}


export async function GET() {
  const sessionId = (await cookies()).get("session_id")?.value;
  try {
    

    if (!sessionId) {
      return NextResponse.json({ authenticated: false });
    }

    const [rows] = await pool.execute<SessionRow[]>(
      `SELECT s.role, s.expires_at, u.name, u.email
       FROM session s
       JOIN user_parent u ON u.id = s.user_id
       WHERE s.session_id = ?`,
      [sessionId]
    );

    const session = rows[0];

    if (!session || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: { name: session.name, email: session.email },
      role: session.role,
    });
  } catch (error) {
    console.error("Error checking login session:", error);
    return NextResponse.json({ error: "Unable to check login session" }, { status: 500 });
  }
}
