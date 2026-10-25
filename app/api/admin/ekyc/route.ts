// app/api/admin/ekyc/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/db/db';

// Helper function to verify admin session
async function getAdminSession() {
  const cookieStore = cookies();
  const sessionId = (await cookieStore).get('session_id')?.value;

  if (!sessionId) return null;

  const [sessionRows]: any = await pool.execute(
    'SELECT user_id, role, expires_at FROM session WHERE session_id = ? AND role = "Admin"',
    [sessionId]
  );

  if (sessionRows.length === 0 || new Date(sessionRows[0].expires_at) < new Date()) {
    return null;
  }

  return sessionRows[0].user_id;
}

// GET: Fetch all pending eKYC requests
export async function GET() {
  try {
    const adminId = await getAdminSession();
    if (!adminId) return NextResponse.json({ error: 'Unauthorized Admin Access' }, { status: 403 });

    // Join ekyc_verification with user_parent to get student details
    const [pendingRequests]: any = await pool.execute(
      `SELECT 
        e.verification_id, 
        e.document_url, 
        e.submitted_at, 
        u.id AS user_id, 
        u.student_id, 
        u.name, 
        u.email, 
        u.faculty, 
        u.campus
      FROM ekyc_verification e
      JOIN user_parent u ON e.regular_id = u.id
      WHERE e.verification_status = 'Pending'
      ORDER BY e.submitted_at ASC`
    );

    return NextResponse.json({ requests: pendingRequests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching eKYC requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Accept or Reject an eKYC request
export async function PUT(request: Request) {
  try {
    const adminId = await getAdminSession();
    if (!adminId) return NextResponse.json({ error: 'Unauthorized Admin Access' }, { status: 403 });

    const body = await request.json();
    const { verification_id, action } = body; // action should be 'Accept' or 'Reject'

    if (!verification_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newStatus = action === 'Accept' ? 'Verified' : 'Rejected';

    // 1. Find the regular_id associated with this verification
    const [verifyRows]: any = await pool.execute(
      'SELECT regular_id FROM ekyc_verification WHERE verification_id = ? AND verification_status = "Pending"',
      [verification_id]
    );

    if (verifyRows.length === 0) {
      return NextResponse.json({ error: 'Verification request not found or already processed' }, { status: 404 });
    }

    const regular_id = verifyRows[0].regular_id;

    // 2. Update the ekyc_verification table
    await pool.execute(
      `UPDATE ekyc_verification 
       SET verification_status = ?, admin_id = ?, resolved_at = NOW() 
       WHERE verification_id = ?`,
      [newStatus, adminId, verification_id]
    );

    // 3. Update the user_parent table
    await pool.execute(
      `UPDATE user_parent 
       SET eKYC_status = ? 
       WHERE id = ?`,
      [newStatus, regular_id]
    );

    return NextResponse.json({ message: `User eKYC ${newStatus} successfully` }, { status: 200 });
  } catch (error) {
    console.error('Error processing eKYC:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}