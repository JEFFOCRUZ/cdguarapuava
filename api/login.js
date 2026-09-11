import { createSession, setSessionCookie } from '../lib/auth.js';

const FIXED_USER = 'cdguarapuava';
const FIXED_PASSWORD = 'gpvede';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      endpoint: 'login',
      ready: true
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const username = String(body.username || '').trim();
    const password = String(body.password || '');

    if (username !== FIXED_USER || password !== FIXED_PASSWORD) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    setSessionCookie(res, createSession(FIXED_USER));
    return res.status(200).json({
      ok: true,
      user: FIXED_USER
    });
  } catch (e) {
    return res.status(500).json({
      error: 'Erro interno no login.',
      detail: e?.message || String(e)
    });
  }
}
