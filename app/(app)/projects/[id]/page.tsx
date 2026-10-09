import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, eq, sql } from 'drizzle-orm';
import { db, members, projects, tasks } from '@/lib/db';
import { getMemberOptions, percent } from '@/lib/queries';
import { PROJECT_STATUSES, TASK_STATUSES } from '@/lib/tracker';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/form-fields';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteButton } from '@/components/delete-button';
import { ProjectForm } from '@/components/project-form';
import { Avatar, DueDate, PriorityLabel, Progress, StatusBadge } from '@/components/tracker-ui';
import {
  addTask,
  deleteProject,
  deleteTask,
  setProjectStatus,
  setTaskStatus,
  updateProject
} from '../../actions';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const id = Number((await params).id);
  const editing = (await searchParams).edit === '1';
  if (!Number.isInteger(id)) notFound();

  const [row] = await db
    .select({ project: projects, owner: members })
    .from(projects)
    .leftJoin(members, eq(projects.ownerId, members.id))
    .where(eq(projects.id, id))
    .limit(1);
  if (!row) notFound();
  const p = row.project;
  const memberOptions = await getMemberOptions();

  if (editing) {
    return (
      <div className="max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit project</h1>
        <Card>
          <CardContent className="pt-6">
            <ProjectForm
              action={updateProject.bind(null, id)}
              project={p}
              members={memberOptions}
              cancelHref={`/projects/${id}`}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const taskRows = await db
    .select({ task: tasks, assignee: members })
    .from(tasks)
    .leftJoin(members, eq(tasks.assigneeId, members.id))
    .where(eq(tasks.projectId, id))
    // In progress first, then to do, then done; soonest due first within each.
    .orderBy(
      sql`case ${tasks.status} when 'in_progress' then 0 when 'todo' then 1 else 2 end`,
      asc(tasks.dueDate)
    );
  const done = taskRows.filter((t) => t.task.status === 'done').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <Link href="/projects" className="text-xs text-slate-500 hover:underline">
            ← All projects
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{p.name}</h1>
            <StatusBadge status={p.status} />
          </div>
          {p.description && <p className="mt-1.5 text-sm text-slate-600">{p.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${id}?edit=1`}>Edit</Link>
          </Button>
          <form action={deleteProject.bind(null, id)}>
            <DeleteButton what="project" />
          </form>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Info label="Owner">
          <span className="flex items-center gap-2">
            <Avatar id={row.owner?.id ?? null} name={row.owner?.name ?? null} />
            <span className="text-sm">{row.owner?.name ?? 'Unassigned'}</span>
          </span>
        </Info>
        <Info label="Due">
          <DueDate date={p.dueDate} done={p.status === 'done'} />
          <p className="text-xs text-slate-400">Started {formatDate(p.startDate)}</p>
        </Info>
        <Info label="Priority">
          <PriorityLabel value={p.priority} />
        </Info>
        <Info label="Progress">
          <Progress value={percent(done, taskRows.length)} />
          <p className="mt-1 text-xs text-slate-400">
            {done} of {taskRows.length} tasks done
          </p>
        </Info>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Status update</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {PROJECT_STATUSES.map((s) => (
            <form key={s.value} action={setProjectStatus.bind(null, id)}>
              <input type="hidden" name="status" value={s.value} />
              <button
                type="submit"
                disabled={s.value === p.status}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition',
                  s.value === p.status
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:border-slate-400'
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', s.dot)} />
                {s.label}
              </button>
            </form>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={addTask.bind(null, id)} className="flex flex-wrap gap-2 rounded-lg border bg-slate-50 p-3">
            <Input name="title" required placeholder="Add a task…" className="min-w-[200px] flex-1 bg-white" />
            <Select name="assigneeId" defaultValue="" className="w-44 bg-white">
              <option value="">Unassigned</option>
              {memberOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
            <Input name="dueDate" type="date" className="w-40 bg-white" aria-label="Due date" />
            <Button type="submit">Add task</Button>
          </form>

          <ul className="divide-y">
            {taskRows.map(({ task, assignee }) => (
              <li key={task.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <form action={setTaskStatus.bind(null, task.id)}>
                  <input type="hidden" name="status" value={task.status === 'done' ? 'todo' : 'done'} />
                  <button
                    type="submit"
                    aria-label={task.status === 'done' ? 'Mark as not done' : 'Mark as done'}
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded border text-xs',
                      task.status === 'done'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 bg-white hover:border-slate-500'
                    )}
                  >
                    {task.status === 'done' ? '✓' : ''}
                  </button>
                </form>
                <span className={cn('min-w-0 flex-1 text-sm', task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800')}>
                  {task.title}
                </span>
                {task.status !== 'done' && (
                  <form action={setTaskStatus.bind(null, task.id)}>
                    <input type="hidden" name="status" value={task.status === 'todo' ? 'in_progress' : 'todo'} />
                    <button
                      type="submit"
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-xs',
                        task.status === 'in_progress'
                          ? 'border-sky-200 bg-sky-50 text-sky-700'
                          : 'bg-white text-slate-500 hover:border-slate-300'
                      )}
                      title="Toggle in progress"
                    >
                      {TASK_STATUSES.find((s) => s.value === task.status)?.label}
                    </button>
                  </form>
                )}
                <Avatar id={assignee?.id ?? null} name={assignee?.name ?? null} />
                <span className="w-32 text-right">
                  <DueDate date={task.dueDate} done={task.status === 'done'} />
                </span>
                <form action={deleteTask.bind(null, task.id)}>
                  <button type="submit" className="text-xs text-slate-400 hover:text-rose-600" aria-label="Delete task">
                    ✕
                  </button>
                </form>
              </li>
            ))}
            {taskRows.length === 0 && <li className="py-4 text-sm text-slate-500">No tasks yet.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      {children}
    </div>
  );
}
