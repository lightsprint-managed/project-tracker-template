import Link from 'next/link';
import { User } from '@/components/user-menu';
import { SidebarNav, type NavItem } from '@/components/sidebar-nav';

/**
 * The app frame: a sidebar with the app's name and sections, and a content
 * column. Edit the nav items in `app/(app)/layout.tsx`.
 */
export function AppShell({
  appName,
  nav,
  children
}: {
  appName: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-white md:flex">
        <Link href="/" className="flex h-14 items-center gap-2.5 border-b px-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            {appName[0]}
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            {appName}
          </span>
        </Link>
        <SidebarNav items={nav} />
        <div className="border-t p-3">
          <User />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-white px-4 md:hidden">
          <Link href="/" className="text-sm font-semibold text-slate-900">
            {appName}
          </Link>
          <User />
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b bg-white px-2 py-1.5 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
