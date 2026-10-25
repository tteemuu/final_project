// app/api/auth/admin-login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '@/db/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Step 1: Find the user
    const [rows]: any = await pool.execute(
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
    const [adminRows]: any = await pool.execute(
      'SELECT admin_role FROM admin WHERE admin_id = ?',
      [user.id]
    );
    
    if (adminRows.length === 0) {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // Step 4: Generate Session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const formattedExpiresAt = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

    await pool.execute(
      'INSERT INTO session (session_id, user_id, role, expires_at) VALUES (?, ?, ?, ?)',
      [sessionId, user.id, 'Admin', formattedExpiresAt]
    );

    (await cookies()).set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ 
      message: 'Admin login successful', 
      admin_role: adminRows[0].admin_role 
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}