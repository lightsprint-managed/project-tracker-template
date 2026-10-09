import Link from 'next/link';
import { getProjectsWithProgress, percent } from '@/lib/queries';
import { PROJECT_STATUSES } from '@/lib/tracker';
import { cn } from '@/lib/utils';
import { EmptyState, PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar, DueDate, PriorityLabel, Progress, ProjectLink, StatusBadge } from '@/components/tracker-ui';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const all = await getProjectsWithProgress();
  const rows = status ? all.filter((p) => p.status === status) : all;

  const tabs = [{ value: '', label: 'All', count: all.length }].concat(
    PROJECT_STATUSES.map((s) => ({
      value: s.value,
      label: s.label,
      count: all.filter((p) => p.status === s.value).length
    }))
  );

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Every project, its owner, progress and deadline."
        action={{ href: '/projects/new', label: 'New project' }}
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={t.value ? `/projects?status=${t.value}` : '/projects'}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition',
              (status ?? '') === t.value
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:border-slate-300'
            )}
          >
            {t.label} <span className="opacity-60">{t.count}</span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState>No projects with this status.</EmptyState>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Priority</TableHead>
                <TableHead className="hidden w-40 lg:table-cell">Progress</TableHead>
                <TableHead className="text-right">Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-xs">
                    <ProjectLink id={p.id} name={p.name} />
                    <p className="truncate text-xs text-slate-500">{p.description}</p>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <Avatar id={p.ownerId} name={p.ownerName} />
                      <span className="hidden text-sm text-slate-700 xl:inline">{p.ownerName ?? 'Unassigned'}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <PriorityLabel value={p.priority} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Progress value={percent(p.done, p.total)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DueDate date={p.dueDate} done={p.status === 'done'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
