import { db } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  const { email, password } = data;

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  console.log('Login attempt for email:', email);
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    console.log('User not found for email:', email);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  console.log('User found:', user);

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    console.log('Password mismatch for user:', user.id);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  console.log('Password match for user:', user.id);

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in the environment variables.');
    return NextResponse.json({ error: 'JWT secret not configured' }, { status: 500 });
  }
  console.log('JWT_SECRET is present.');

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  console.log('JWT created successfully for user:', user.id);

  const response = NextResponse.json({ success: true });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 60 * 60,
    path: '/',
  });
  return response;
}
