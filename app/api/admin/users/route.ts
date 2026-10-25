// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/db/db';

// Strict helper function to verify Super admin session
async function getSuperAdminSession() {
  const cookieStore = cookies();
  const sessionId = (await cookieStore).get('session_id')?.value;

  if (!sessionId) return null;

  // Verify active session
  const [sessionRows]: any = await pool.execute(
    'SELECT user_id, expires_at FROM session WHERE session_id = ? AND role = "Admin"',
    [sessionId]
  );

  if (sessionRows.length === 0 || new Date(sessionRows[0].expires_at) < new Date()) {
    return null;
  }

  const userId = sessionRows[0].user_id;

  // Verify strict 'Super admin' role
  const [adminRows]: any = await pool.execute(
    'SELECT admin_role FROM admin WHERE admin_id = ?',
    [userId]
  );

  if (adminRows.length === 0 || adminRows[0].admin_role !== 'Super admin') {
    return null;
  }

  return userId; // Returns the Super admin's ID
}

// GET: Fetch all users for the dashboard
export async function GET() {
  try {
    const superAdminId = await getSuperAdminSession();
    if (!superAdminId) {
      return NextResponse.json({ error: 'Access Denied. Super admin privileges required.' }, { status: 403 });
    }

    const [users]: any = await pool.execute(
      `SELECT id, student_id, username, name, email, faculty, campus, eKYC_status, created_at 
       FROM user_parent 
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ users, currentAdminId: superAdminId }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove a user by ID
export async function DELETE(request: Request) {
  try {
    const superAdminId = await getSuperAdminSession();
    if (!superAdminId) {
      return NextResponse.json({ error: 'Access Denied. Super admin privileges required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('id');

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent the super admin from deleting themselves
    if (parseInt(targetUserId, 10) === superAdminId) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }

    // Because of ON DELETE CASCADE in your schema, deleting from user_parent removes 
    // their listings, sessions, and ekyc data automatically.
    await pool.execute('DELETE FROM user_parent WHERE id = ?', [targetUserId]);

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}