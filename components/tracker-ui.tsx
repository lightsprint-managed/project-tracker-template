import Link from 'next/link';
import { cn } from '@/lib/utils';
import { avatarColor, priority, projectStatus } from '@/lib/tracker';
import { daysFromToday, formatDate } from '@/lib/format';
import type { Priority, ProjectStatus } from '@/lib/schema';

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = projectStatus(status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium',
        s.badge
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}

export function PriorityLabel({ value }: { value: Priority }) {
  const p = priority(value);
  return <span className={cn('text-xs', p.className)}>{p.label}</span>;
}

export function Avatar({
  id,
  name,
  className
}: {
  id: number | null;
  name: string | null;
  className?: string;
}) {
  if (!name) {
    return (
      <span className={cn('inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed text-xs text-slate-400', className)}>
        ?
      </span>
    );
  }
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      title={name}
      className={cn(
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
        avatarColor(id),
        className
      )}
    >
      {initials}
    </span>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full', value === 100 ? 'bg-emerald-500' : 'bg-indigo-500')}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-slate-500">{value}%</span>
    </div>
  );
}

export function DueDate({
  date,
  done
}: {
  date: string | null;
  done?: boolean;
}) {
  if (!date) return <span className="text-slate-400">—</span>;
  const days = daysFromToday(date);
  const overdue = !done && days < 0;
  const soon = !done && days >= 0 && days <= 7;
  return (
    <span
      className={cn(
        'whitespace-nowrap text-sm',
        overdue ? 'font-medium text-rose-600' : soon ? 'text-amber-700' : 'text-slate-600'
      )}
    >
      {formatDate(date)}
      {overdue && <span className="ml-1 text-xs">({-days}d late)</span>}
    </span>
  );
}

export function ProjectLink({ id, name }: { id: number; name: string }) {
  return (
    <Link href={`/projects/${id}`} className="font-medium text-slate-900 hover:underline">
      {name}
    </Link>
  );
}
