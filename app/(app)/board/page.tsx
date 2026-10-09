import Link from 'next/link';
import { getProjectsWithProgress, percent } from '@/lib/queries';
import { PROJECT_STATUSES } from '@/lib/tracker';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { Avatar, DueDate, PriorityLabel, Progress } from '@/components/tracker-ui';

export const dynamic = 'force-dynamic';

export default async function BoardPage() {
  const all = await getProjectsWithProgress();
  return (
    <div>
      <PageHeader
        title="Board"
        description="Projects grouped by health. Open one to update its status."
        action={{ href: '/projects/new', label: 'New project' }}
      />
      <div className="-mx-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
        <div className="grid min-w-[1050px] grid-cols-5 gap-3">
          {PROJECT_STATUSES.map((s) => {
            const col = all.filter((p) => p.status === s.value);
            return (
              <section key={s.value} className="rounded-lg bg-slate-100/70 p-2">
                <header className="flex items-center gap-1.5 px-1.5 pb-2 pt-1 text-sm font-medium text-slate-700">
                  <span className={cn('h-2 w-2 rounded-full', s.dot)} />
                  {s.label}
                  <span className="ml-auto text-xs font-normal text-slate-400">{col.length}</span>
                </header>
                <div className="space-y-2">
                  {col.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="block space-y-2.5 rounded-md border bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow"
                    >
                      <p className="text-sm font-medium leading-snug text-slate-900">{p.name}</p>
                      <Progress value={percent(p.done, p.total)} />
                      <div className="flex items-center justify-between gap-2">
                        <Avatar id={p.ownerId} name={p.ownerName} />
                        <PriorityLabel value={p.priority} />
                      </div>
                      <div className="text-xs">
                        <DueDate date={p.dueDate} done={p.status === 'done'} />
                      </div>
                    </Link>
                  ))}
                  {col.length === 0 && <p className="py-6 text-center text-xs text-slate-400">Nothing here</p>}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
