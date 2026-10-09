import type { Priority, ProjectStatus, TaskStatus } from './schema';

// Status/priority vocabulary adapted from the shadcn/ui "Tasks" example
// (shadcn-ui/ui, MIT) with project health states (on track / at risk / off track).

export const PROJECT_STATUSES: {
  value: ProjectStatus;
  label: string;
  dot: string;
  badge: string;
}[] = [
  { value: 'planning', label: 'Planning', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'on_track', label: 'On track', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'at_risk', label: 'At risk', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'off_track', label: 'Off track', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'done', label: 'Done', dot: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
];

export function projectStatus(status: ProjectStatus) {
  return PROJECT_STATUSES.find((s) => s.value === status) ?? PROJECT_STATUSES[0];
}

export const PRIORITIES: { value: Priority; label: string; className: string }[] = [
  { value: 'low', label: 'Low', className: 'text-slate-500' },
  { value: 'medium', label: 'Medium', className: 'text-sky-700' },
  { value: 'high', label: 'High', className: 'text-rose-700 font-medium' }
];

export function priority(p: Priority) {
  return PRIORITIES.find((x) => x.value === p) ?? PRIORITIES[1];
}

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' }
];

/** Rotating avatar colours, picked by member id. */
const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700'
];

export function avatarColor(id: number | null | undefined) {
  return AVATAR_COLORS[(id ?? 0) % AVATAR_COLORS.length];
}
