// app/api/admin/ekyc/route.ts
import { NextResponse } from 'next/server';
import pool from '@/db/db';

// Helper function to verify admin session
async function getAdminSession(request: Request) {
  const sessionId = request.headers.get('x-session-id');

  if (!sessionId) return null;

  const [sessionRows]: any = await pool.execute(
    'SELECT user_id, role, expires_at FROM session WHERE session_id = ? AND role = "Admin"',
    [sessionId]
  );

  if (sessionRows.length === 0 || new Date(sessionRows[0].expires_at) < new Date()) {
    return null;
  }

  return sessionId;
}

// GET: Fetch all pending eKYC requests
export async function GET(request: Request) {
  try {
    const admin = await getAdminSession(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized Admin Access' }, { status: 403 });

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
    const admin = await getAdminSession(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized Admin Access' }, { status: 403 });

    const body = await request.json();
    const { verification_id, action } = body; // action should be 'Accept' or 'Reject'

    const verificationId = Number(verification_id);
    if (!Number.isInteger(verificationId) || verificationId < 1 || !['Accept', 'Reject'].includes(action)) {
      return NextResponse.json(
        { error: 'A valid verification ID and review action are required.' },
        { status: 400 }
      );
    }

    const newStatus = action === 'Accept' ? 'Verified' : 'Rejected';

    await pool.execute(
      'CALL process_ekyc_review(?, ?, ?)',
      [admin, verificationId, newStatus]
    );

    return NextResponse.json({ message: `User eKYC ${newStatus} successfully` }, { status: 200 });
  } catch (error) {
    console.error('Error processing eKYC:', error);
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ER_SIGNAL_EXCEPTION' &&
      'sqlMessage' in error &&
      typeof error.sqlMessage === 'string'
    ) {
      const status = error.sqlMessage.includes('Pending eKYC request was not found') ? 404 : 403;
      return NextResponse.json({ error: error.sqlMessage }, { status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}