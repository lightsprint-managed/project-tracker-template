import Link from 'next/link';
import { eq, ne, sql } from 'drizzle-orm';
import { db, members, tasks } from '@/lib/db';
import { getProjectsWithProgress, percent } from '@/lib/queries';
import { PROJECT_STATUSES } from '@/lib/tracker';
import { daysFromToday } from '@/lib/format';
import { cn } from '@/lib/utils';
import { PageHeader, StatCard } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, DueDate, Progress, StatusBadge } from '@/components/tracker-ui';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const all = await getProjectsWithProgress();
  const active = all.filter((p) => p.status !== 'done');
  const needsAttention = active.filter(
    (p) =>
      p.status === 'at_risk' ||
      p.status === 'off_track' ||
      (p.dueDate !== null && daysFromToday(p.dueDate) < 0)
  );
  const dueSoon = active
    .filter((p) => p.dueDate && daysFromToday(p.dueDate) >= 0 && daysFromToday(p.dueDate) <= 14)
    .length;
  const totalTasks = all.reduce((s, p) => s + p.total, 0);
  const doneTasks = all.reduce((s, p) => s + p.done, 0);

  const workload = await db
    .select({
      id: members.id,
      name: members.name,
      title: members.title,
      open: sql<number>`(count(${tasks.id}) filter (where ${tasks.status} <> 'done'))::int`
    })
    .from(members)
    .leftJoin(tasks, eq(tasks.assigneeId, members.id))
    .groupBy(members.id);
  workload.sort((a, b) => b.open - a.open || a.name.localeCompare(b.name));
  const maxOpen = Math.max(1, ...workload.map((w) => w.open));

  const upcoming = await db
    .select({ id: tasks.id, title: tasks.title, dueDate: tasks.dueDate, projectId: tasks.projectId, status: tasks.status })
    .from(tasks)
    .where(ne(tasks.status, 'done'))
    .orderBy(tasks.dueDate)
    .limit(6);
  const projectName = new Map(all.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="Where every project stands, and what needs attention."
        action={{ href: '/projects/new', label: 'New project' }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active projects" value={active.length} hint={`${all.length - active.length} completed`} />
        <StatCard
          label="Need attention"
          value={<span className={needsAttention.length ? 'text-rose-600' : ''}>{needsAttention.length}</span>}
          hint="At risk, off track or overdue"
        />
        <StatCard label="Due in 14 days" value={dueSoon} hint="Active projects" />
        <StatCard label="Tasks done" value={`${percent(doneTasks, totalTasks)}%`} hint={`${doneTasks} of ${totalTasks} tasks`} />
      </div>

      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" title="Projects by status">
        {PROJECT_STATUSES.map((s) => {
          const n = all.filter((p) => p.status === s.value).length;
          return n ? (
            <div key={s.value} className={s.dot} style={{ width: `${(n / all.length) * 100}%` }} />
          ) : null;
        })}
      </div>
      <div className="-mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
        {PROJECT_STATUSES.map((s) => (
          <span key={s.value} className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', s.dot)} />
            {s.label} · {all.filter((p) => p.status === s.value).length}
          </span>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {needsAttention.length === 0 && (
              <p className="text-sm text-slate-500">Everything is on track.</p>
            )}
            {needsAttention.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="-mx-2 grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-md px-2 py-2.5 hover:bg-slate-50 sm:grid-cols-[1fr_120px_auto]"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar id={p.ownerId} name={p.ownerName} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">{p.name}</span>
                    <span className="block text-xs text-slate-500">
                      Due <DueDate date={p.dueDate} />
                    </span>
                  </span>
                </span>
                <Progress value={percent(p.done, p.total)} className="hidden sm:flex" />
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Open tasks by person</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workload.map((w) => (
              <div key={w.id} className="flex items-center gap-3">
                <Avatar id={w.id} name={w.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate text-slate-700">{w.name}</span>
                    <span className="tabular-nums text-slate-500">{w.open}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-indigo-400" style={{ width: `${(w.open / maxOpen) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {upcoming.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-800">{t.title}</p>
                  <Link href={`/projects/${t.projectId}`} className="text-xs text-slate-500 hover:underline">
                    {projectName.get(t.projectId)}
                  </Link>
                </div>
                <DueDate date={t.dueDate} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
