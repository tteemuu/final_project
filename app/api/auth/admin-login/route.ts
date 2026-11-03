// app/api/auth/admin-login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import pool from '@/db/db';
import { createSession } from '@/db/session';

interface LoginUserRow extends RowDataPacket {
  id: number;
  password: string;
}

interface AdminRoleRow extends RowDataPacket {
  admin_role: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Step 1: Find the user
    const [rows] = await pool.execute<LoginUserRow[]>(
      'SELECT id, password FROM user_parent WHERE email = ?',
      [email]
    );
    const user = rows[0];

    // Step 2: Verify password and return generic error if failed[cite: 4, 5]
    const ok = user && await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Step 3: STRICT ADMIN CHECK - Reject if the user is not in the admin table
    const [adminRows] = await pool.execute<AdminRoleRow[]>(
      'SELECT admin_role FROM admin WHERE admin_id = ?',
      [user.id]
    );
    
    if (adminRows.length === 0) {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const { sessionId } = await createSession(user.id, 'Admin');

    return NextResponse.json({ 
      message: 'Admin login successful', 
      admin_role: adminRows[0].admin_role,
      sessionId,
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}