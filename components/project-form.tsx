import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, Select, Textarea } from '@/components/ui/form-fields';
import { PRIORITIES, PROJECT_STATUSES } from '@/lib/tracker';
import type { Project } from '@/lib/schema';

export function ProjectForm({
  action,
  project,
  members,
  cancelHref,
  submitLabel
}: {
  action: (data: FormData) => void | Promise<void>;
  project?: Partial<Project>;
  members: { id: number; name: string }[];
  cancelHref: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label="Project name" htmlFor="name" className="sm:col-span-2">
        <Input id="name" name="name" required defaultValue={project?.name} placeholder="e.g. Website relaunch" />
      </Field>
      <Field label="Description" htmlFor="description" className="sm:col-span-2">
        <Textarea id="description" name="description" defaultValue={project?.description ?? ''} placeholder="What does done look like?" />
      </Field>
      <Field label="Owner" htmlFor="ownerId">
        <Select id="ownerId" name="ownerId" defaultValue={project?.ownerId ?? ''}>
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Status" htmlFor="status">
        <Select id="status" name="status" defaultValue={project?.status ?? 'planning'}>
          {PROJECT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Priority" htmlFor="priority">
        <Select id="priority" name="priority" defaultValue={project?.priority ?? 'medium'}>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start" htmlFor="startDate">
          <Input id="startDate" name="startDate" type="date" defaultValue={project?.startDate ?? ''} />
        </Field>
        <Field label="Due" htmlFor="dueDate">
          <Input id="dueDate" name="dueDate" type="date" defaultValue={project?.dueDate ?? ''} />
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
        <Button asChild variant="outline" type="button">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
