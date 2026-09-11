import crypto from 'crypto';

const COOKIE = 'cdg_session';
const MAX_AGE = 60 * 60 * 8;
const SECRET = process.env.SESSION_SECRET || 'bobinou-cd-guarapuava-v5-login-fixo';

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex');
}

export function createSession(username) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ u: username, exp })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const expected = sign(payload);

  try {
    const a = Buffer.from(signature || '');
    const b = Buffer.from(expected || '');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

function readCookies(req) {
  const raw = req.headers.cookie || '';
  const out = {};
  raw.split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > -1) {
      const k = part.slice(0, i).trim();
      const v = part.slice(i + 1).trim();
      if (k) out[decodeURIComponent(k)] = decodeURIComponent(v);
    }
  });
  return out;
}

export function getUser(req) {
  return verifySession(readCookies(req)[COOKIE]);
}

export function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}; Secure`
  );
}

export function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`
  );
}
