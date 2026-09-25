import { redirect } from 'next/navigation';
import { authConfigured, isAdmin } from '../../../lib/auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin');
  return <main className="login-wrap"><LoginForm configured={authConfigured()}/></main>;
}
