// app/api/listings/route.ts
import { NextResponse } from 'next/server';
import pool from '@/db/db';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Parse URL for optional pagination (e.g., /api/listings?limit=20&page=1)
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);
    const offset = (page - 1) * limit;
    // Execute a JOIN query to combine listings with seller and image data
    const [listings]: any = await pool.query(
      `SELECT 
        l.listing_id, 
        l.title, 
        l.description, 
        l.price, 
        l.listing_condition, 
        l.created_at,
        c.category_name,
        i.image_url AS primary_image,
        u.username AS seller_username,
        u.name AS seller_name,
        u.email AS seller_email,
        u.phone_number AS seller_phone,
        u.avg_rating AS seller_rating,
        u.faculty AS seller_faculty,
        u.campus AS seller_campus,
        u.eKYC_status AS seller_ekyc_status
      FROM listing l
      JOIN user_parent u ON l.seller_id = u.id
      JOIN category c ON l.category_id = c.category_id
      LEFT JOIN listing_image i ON l.listing_id = i.listing_id AND i.is_primary_image = TRUE
      WHERE l.listing_status = 'Active'
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Return the formatted feed
    return NextResponse.json({
      listings,
      page,
      limit,
      count: listings.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching main feed listings:', error);
    return NextResponse.json({ error: 'Failed to load listings' }, { status: 500 });
  }
}


// Add this POST function to your existing app/api/listings/route.ts file

export async function POST(request: Request) {
  try {
    // 1. Authenticate the User using the session cookie
    const cookieStore = cookies();
    const sessionId = (await cookieStore).get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // Check if session exists and is not expired
    const [sessionRows]: any = await pool.execute(
      'SELECT user_id, expires_at FROM session WHERE session_id = ?',
      [sessionId]
    );

    if (sessionRows.length === 0) {
      return NextResponse.json({ error: 'Invalid session. Please log in again.' }, { status: 401 });
    }

    const session = sessionRows[0];
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }

    const seller_id = session.user_id;

    // 2. Parse the Request Body
    const body = await request.json();
    const { 
      title, 
      description, 
      price, 
      quantity, 
      category_id, 
      listing_condition, 
      images // Expecting an array of string URLs: e.g., ["url1.jpg", "url2.jpg"]
    } = body;

    // 3. Basic Validation
    if (!title || !description || !price || !category_id || !listing_condition) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Note: Based on your schema, price is DECIMAL(3,2), meaning the max value is 9.99.
    if (parseFloat(price) > 99999999.99) {
      return NextResponse.json({ error: 'Price exceeds the maximum allowed limit (99999999.99)' }, { status: 400 });
    }
    
    if (description.length > 150) {
      return NextResponse.json({ error: 'Description must be 150 characters or less' }, { status: 400 });
    }

    // The product form uses these IDs, while the checked-in category schema has no seed rows.
    await pool.execute(
      `INSERT IGNORE INTO category (category_id, category_name)
       VALUES (1, 'Electronics'), (2, 'Textbooks'), (3, 'Furniture'), (4, 'Stationery')`
    );

    // 4. Insert into the `listing` table
    const [listingResult]: any = await pool.execute(
      `INSERT INTO listing 
        (seller_id, category_id, title, description, price, quantity, listing_condition, listing_status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', NOW(), NOW())`,
      [seller_id, category_id, title, description, price, quantity || 1, listing_condition]
    );

    const newListingId = listingResult.insertId;

    // 5. Insert images into the `listing_image` table
    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        // The first image in the array becomes the primary image (is_primary_image = TRUE)
        const isPrimary = i === 0; 
        
        await pool.execute(
          `INSERT INTO listing_image (listing_id, image_url, is_primary_image) VALUES (?, ?, ?)`,
          [newListingId, images[i], isPrimary]
        );
      }
    }

    return NextResponse.json({ 
      message: 'Product listed successfully', 
      listing_id: newListingId 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
