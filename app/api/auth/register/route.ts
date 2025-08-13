import { db } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  const { name, email, password } = data;

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  try {
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [name, email, passwordHash]
    );
    const userId = result.rows[0].id;
    return NextResponse.json({ userId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }
}
