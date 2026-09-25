import crypto from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'odusina_portfolio_admin';
const MAX_AGE = 60 * 60 * 8;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

function hmac(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

function safeEqual(a = '', b = '') {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

export function authConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && secret());
}

export function validAdminCredentials(username, password) {
  if (!authConfigured()) return false;
  return safeEqual(username, process.env.ADMIN_USERNAME) && safeEqual(password, process.env.ADMIN_PASSWORD);
}

export function makeSessionToken(username) {
  const payload = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  return `${payload}.${hmac(payload)}`;
}

export function verifySessionToken(token = '') {
  if (!secret() || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  if (!safeEqual(signature, hmac(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.u === process.env.ADMIN_USERNAME && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

export async function isAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value || '');
}

export async function setAdminCookie(username) {
  const store = await cookies();
  store.set(COOKIE_NAME, makeSessionToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export { COOKIE_NAME };
