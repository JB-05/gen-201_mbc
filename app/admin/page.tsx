import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminAuthCheck } from '@/components/admin/AdminAuthCheck';

export default function AdminPage() {
  return (
    <AdminAuthCheck>
      <AdminDashboard />
    </AdminAuthCheck>
  );
}
