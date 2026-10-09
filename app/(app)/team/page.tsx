import Link from 'next/link';
import { asc } from 'drizzle-orm';
import { db, members, tasks } from '@/lib/db';
import { getProjectsWithProgress } from '@/lib/queries';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, StatusBadge } from '@/components/tracker-ui';
import { createMember } from '../actions';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const [people, allTasks, projectRows] = await Promise.all([
    db.select().from(members).orderBy(asc(members.name)),
    db.select({ assigneeId: tasks.assigneeId, status: tasks.status }).from(tasks),
    getProjectsWithProgress()
  ]);

  return (
    <div>
      <PageHeader title="Team" description="Who owns what, and how much is on their plate." />

      <form action={createMember} className="mb-6 flex flex-wrap gap-2 rounded-lg border bg-white p-3 shadow-sm">
        <Input name="name" required placeholder="Name" className="w-48" />
        <Input name="title" placeholder="Role" className="w-48" />
        <Input name="email" type="email" placeholder="Email" className="w-56" />
        <Button type="submit">Add person</Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((m) => {
          const owned = projectRows.filter((p) => p.ownerId === m.id && p.status !== 'done');
          const open = allTasks.filter((t) => t.assigneeId === m.id && t.status !== 'done').length;
          const done = allTasks.filter((t) => t.assigneeId === m.id && t.status === 'done').length;
          return (
            <Card key={m.id}>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-3">
                  <Avatar id={m.id} name={m.name} className="h-10 w-10 text-sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{m.name}</p>
                    <p className="truncate text-xs text-slate-500">{m.title ?? '—'}</p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <span>
                    <span className="font-semibold text-slate-900">{open}</span>{' '}
                    <span className="text-slate-500">open tasks</span>
                  </span>
                  <span>
                    <span className="font-semibold text-slate-900">{done}</span>{' '}
                    <span className="text-slate-500">done</span>
                  </span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Owns</p>
                  {owned.length === 0 && <p className="text-sm text-slate-400">No active projects</p>}
                  {owned.map((p) => (
                    <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between gap-2 text-sm hover:underline">
                      <span className="truncate">{p.name}</span>
                      <StatusBadge status={p.status} />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
