// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/db/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, username, password, name, phone_number, email, faculty, campus } = body;

    // Validate email domain and password length[cite: 4]
    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: 'Need email + 8-char password' }, { status: 400 });
    }

    if (!email.endsWith('@dome.tu.ac.th')) {
      return NextResponse.json({ error: 'Must use @dome.tu.ac.th email' }, { status: 400 });
    }

    // Hash the password (cost factor 10) BEFORE the INSERT[cite: 4]
    const hash = await bcrypt.hash(password, 10);

    // Insert into user_parent using parameterized placeholders[cite: 4]
    const [result]: any = await pool.execute(
      `INSERT INTO user_parent 
        (student_id, username, password, name, phone_number, email, faculty, campus, eKYC_status, avg_rating, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 0.0, NOW())`,
      [student_id, username, hash, name, phone_number, email, faculty, campus]
    );

    // Link to the regular user table
    const newUserId = result.insertId;
    await pool.execute(
      'INSERT INTO regular (regular_id) VALUES (?)',
      [newUserId]
    );

    return NextResponse.json({ message: 'Account created' }, { status: 201 });

  } catch (err: any) {
    console.error(err);
    // Handle duplicate entry errors (e.g., email or student ID already exists)[cite: 4]
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Account already registered' }, { status: 409 });
    }
    // Return a generic message for other errors[cite: 4]
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}