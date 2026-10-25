// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read the file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename to prevent overwriting
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, '-')}`;
    
    // Define the path inside the 'public/uploads' directory
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filepath = path.join(uploadDir, filename);

    // Ensure the uploads directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save the file to the local filesystem
    await writeFile(filepath, buffer);

    // Return the URL path that the frontend can use (e.g., /uploads/my-image.jpg)
    const imageUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ imageUrl }, { status: 201 });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}