import { NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/auth';
import { db } from '@/app/lib/db';

export async function GET() {
  const userId = await getUserId();

  if (!userId) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { rows } = await db.query('SELECT id, email, name FROM users WHERE id = $1', [userId]);

    if (rows.length === 0) {
      return new NextResponse(JSON.stringify({ message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = rows[0];
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
