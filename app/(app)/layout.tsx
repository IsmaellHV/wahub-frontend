import { Sidebar } from '@shared/UI/components/Sidebar';
import { AuthGate } from '@acceso/usuarios/UI/AuthGate';

// Authed app shell — sidebar + main column. Each page renders its own Topbar.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <AuthGate />
      <Sidebar />
      <div className="main">{children}</div>
    </div>
  );
}
