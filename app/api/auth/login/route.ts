// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '@/db/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Step 1: Enforce the @dome.tu.ac.th email domain
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    if (!email.endsWith('@dome.tu.ac.th')) {
      return NextResponse.json({ error: 'Access restricted to @dome.tu.ac.th emails only' }, { status: 403 });
    }

    // Step 2: Query the user_parent table using parameterized queries to prevent SQL injection[cite: 4, 5]
    const [rows]: any = await pool.execute(
      'SELECT id, password FROM user_parent WHERE email = ?', 
      [email]
    );
    
    const user = rows[0];

    // Step 3: Verify the password using bcryptjs[cite: 4]
    // bcrypt.compare reads the salt and cost directly from the stored hash[cite: 4].
    const ok = user && await bcrypt.compare(password, user.password);

    if (!ok) {
      // Step 4: Return a generic error to obscure whether the failure was the email or password[cite: 4, 5]
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Step 5: Determine user role (Admin or Regular) to fulfill the session table's role ENUM
    const [adminRows]: any = await pool.execute(
      'SELECT admin_id FROM admin WHERE admin_id = ?', 
      [user.id]
    );
    const role = adminRows.length > 0 ? 'Admin' : 'Regular';

    // Step 6: Generate session ID and expiration time
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const formattedExpiresAt = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

    // Step 7: Insert the session record using parameterized placeholders
    await pool.execute(
      'INSERT INTO session (session_id, user_id, role, expires_at) VALUES (?, ?, ?, ?)',
      [sessionId, user.id, role, formattedExpiresAt]
    );

    // Step 8: Set an HTTP-only secure cookie for the session
    (await
          // Step 8: Set an HTTP-only secure cookie for the session
          cookies()).set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      path: '/',
      sameSite: 'lax',
    });

    // Never send the password hash back in the response payload[cite: 4]
    return NextResponse.json({ message: 'Login successful', role: role }, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
