'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm({ configured }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault(); setLoading(true); setMessage('');
    const res = await fetch('/api/admin/login', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ username, password }) });
    const data = await res.json().catch(()=>({}));
    setLoading(false);
    if (!res.ok) { setMessage(data.error || 'Login failed.'); return; }
    router.replace('/admin'); router.refresh();
  }
  return <form className="login-card" onSubmit={submit}>
    <div className="mono" style={{color:'var(--wine)'}}>Portfolio CMS</div>
    <h1>Admin login</h1>
    <p className="muted">Secure server-side access to pages, sections, projects and media.</p>
    {!configured && <p className="notice">Set ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Vercel before using the CMS.</p>}
    <div className="field"><label>Username</label><input value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username"/></div>
    <div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></div>
    <button className="btn primary" disabled={loading || !configured}>{loading ? 'Signing in…' : 'Sign in'}</button>
    {message && <p style={{color:'var(--danger)'}}>{message}</p>}
  </form>;
}
