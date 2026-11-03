import { randomBytes } from 'crypto';
import type { RowDataPacket } from 'mysql2';
import pool from '@/db/db';

type SessionRole = 'Regular' | 'Admin';

interface UserIdRow extends RowDataPacket {
  id: number;
}

export async function createSession(userId: number, role: SessionRole) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [users] = await connection.execute<UserIdRow[]>(
      'SELECT id FROM user_parent WHERE id = ? FOR UPDATE',
      [userId]
    );

    if (users.length === 0) {
      throw new Error('Cannot create a session for a user that no longer exists.');
    }

    const sessionId = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const formattedExpiresAt = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

    await connection.execute(
      'INSERT INTO session (session_id, user_id, role, expires_at) VALUES (?, ?, ?, ?)',
      [sessionId, userId, role, formattedExpiresAt]
    );

    await connection.commit();
    return { sessionId, expiresAt };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
