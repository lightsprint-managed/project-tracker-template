import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth, signOut } from '@/lib/auth';

export async function User() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className="md:w-full">
        <Link href="/login">Sign in</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700">
        {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
      </span>
      <span className="hidden min-w-0 flex-1 truncate text-xs text-slate-500 md:block">
        {user.email}
      </span>
      <form
        action={async () => {
          'use server';
          await signOut();
        }}
      >
        <Button type="submit" variant="ghost" size="sm" className="text-xs">
          Sign out
        </Button>
      </form>
    </div>
  );
}
