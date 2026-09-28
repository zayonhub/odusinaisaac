import { NextResponse } from 'next/server';
import { authConfigured, setAdminCookie, validAdminCredentials } from '../../../../lib/auth';

export async function POST(request) {
  if (!authConfigured()) return NextResponse.json({ error: 'Admin authentication is not configured.' }, { status: 503 });
  const { username = '', password = '' } = await request.json().catch(()=>({}));
  if (!validAdminCredentials(username, password)) return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  await setAdminCookie(username);
  return NextResponse.json({ ok: true });
}
