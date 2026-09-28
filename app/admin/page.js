import { redirect } from 'next/navigation';
import { isAdmin } from '../../lib/auth';
import { getAdminState } from '../../lib/cms';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage(){
  if(!await isAdmin()) redirect('/admin/login');
  const state=await getAdminState();
  return <AdminDashboard initialState={state}/>;
}
