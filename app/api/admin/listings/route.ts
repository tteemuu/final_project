// app/api/admin/listings/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/db/db';

// Helper to verify ANY admin role (Moderator OR Super admin)
async function getAnyAdminSession() {
  const cookieStore = cookies();
  const sessionId = (await cookieStore).get('session_id')?.value;

  if (!sessionId) return null;

  // 1. Check session
  const [sessionRows]: any = await pool.execute(
    'SELECT user_id, expires_at FROM session WHERE session_id = ? AND role = "Admin"',
    [sessionId]
  );

  if (sessionRows.length === 0 || new Date(sessionRows[0].expires_at) < new Date()) {
    return null;
  }

  const userId = sessionRows[0].user_id;

  // 2. Check if they exist in the admin table (accepts both roles)
  const [adminRows]: any = await pool.execute(
    'SELECT admin_role FROM admin WHERE admin_id = ?',
    [userId]
  );

  if (adminRows.length === 0) return null;

  return { userId, adminRole: adminRows[0].admin_role };
}

// GET: Fetch all marketplace listings for the admin dashboard
export async function GET() {
  try {
    const admin = await getAnyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied. Admin privileges required.' }, { status: 403 });
    }

    const [listings]: any = await pool.execute(
      `SELECT 
        l.listing_id, l.title, l.price, l.listing_status, l.created_at, 
        u.username AS seller_username, u.name AS seller_name 
       FROM listing l
       JOIN user_parent u ON l.seller_id = u.id
       ORDER BY l.created_at DESC`
    );

    return NextResponse.json({ listings, adminRole: admin.adminRole }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin listings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove a listing by ID
export async function DELETE(request: Request) {
  try {
    const admin = await getAnyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied. Admin privileges required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetListingId = searchParams.get('id');

    if (!targetListingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // Because of ON DELETE CASCADE in listing_image, deleting the listing 
    // also automatically deletes associated images from the database.
    await pool.execute('DELETE FROM listing WHERE listing_id = ?', [targetListingId]);

    return NextResponse.json({ message: 'Listing deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}