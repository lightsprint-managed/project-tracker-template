import { AppShell } from '@/components/app-shell';
import Providers from '@/components/providers';

const NAV = [
  { href: '/', label: 'Overview' },
  { href: '/projects', label: 'Projects' },
  { href: '/board', label: 'Board' },
  { href: '/team', label: 'Team' }
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AppShell appName="Project Tracker" nav={NAV}>
        {children}
      </AppShell>
    </Providers>
  );
}
