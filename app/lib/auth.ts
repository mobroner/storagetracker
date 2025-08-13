import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token.value, secret);
    return payload.userId as string;
  } catch {
    return null;
  }
}
