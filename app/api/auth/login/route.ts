// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import pool from '@/db/db';
import { createSession } from '@/db/session';

interface LoginUserRow extends RowDataPacket {
  id: number;
  password: string;
}

interface AdminIdRow extends RowDataPacket {
  admin_id: number;
}

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
    const [rows] = await pool.execute<LoginUserRow[]>(
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
    const [adminRows] = await pool.execute<AdminIdRow[]>(
      'SELECT admin_id FROM admin WHERE admin_id = ?', 
      [user.id]
    );
    const role = adminRows.length > 0 ? 'Admin' : 'Regular';

    const { sessionId } = await createSession(user.id, role);

    // Never send the password hash back in the response payload[cite: 4]
    return NextResponse.json({ message: 'Login successful', role, sessionId }, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
