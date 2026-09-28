import { redirect } from 'next/navigation';
import { isAdmin } from '../../lib/auth';
import { getAdminState } from '../../lib/cms';
import AdminDashboard from './AdminDashboardV2';
import './admin-extra.css';

export const dynamic = 'force-dynamic';

export default async function AdminPage(){
  if(!await isAdmin()) redirect('/admin/login');
  const state=await getAdminState();
  return <AdminDashboard initialState={state}/>;
}
