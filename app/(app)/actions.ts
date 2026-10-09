'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  db,
  members,
  priorityEnum,
  projectStatusEnum,
  projects,
  taskStatusEnum,
  tasks
} from '@/lib/db';

// The sample app lets anyone edit records so the preview works without
// signing in. To restrict writes, check `await auth()` from '@/lib/auth' here.

const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));
const optionalInt = optional.transform((v) => (v === null ? null : Number(v)));

function form(data: FormData) {
  return Object.fromEntries(data.entries());
}

// --- Projects --------------------------------------------------------------

const projectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: optional,
  ownerId: optionalInt,
  status: z.enum(projectStatusEnum.enumValues),
  priority: z.enum(priorityEnum.enumValues),
  startDate: optional,
  dueDate: optional
});

export async function createProject(data: FormData) {
  const values = projectSchema.parse(form(data));
  const [row] = await db.insert(projects).values(values).returning({ id: projects.id });
  revalidatePath('/', 'layout');
  redirect(`/projects/${row.id}`);
}

export async function updateProject(id: number, data: FormData) {
  const values = projectSchema.parse(form(data));
  await db
    .update(projects)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(projects.id, id));
  revalidatePath('/', 'layout');
  redirect(`/projects/${id}`);
}

export async function setProjectStatus(id: number, data: FormData) {
  const status = z.enum(projectStatusEnum.enumValues).parse(data.get('status'));
  await db.update(projects).set({ status, updatedAt: new Date() }).where(eq(projects.id, id));
  revalidatePath('/', 'layout');
}

export async function deleteProject(id: number) {
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath('/', 'layout');
  redirect('/projects');
}

// --- Tasks -----------------------------------------------------------------

const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  assigneeId: optionalInt,
  dueDate: optional
});

export async function addTask(projectId: number, data: FormData) {
  const values = taskSchema.parse(form(data));
  await db.insert(tasks).values({ ...values, projectId });
  revalidatePath('/', 'layout');
}

export async function setTaskStatus(id: number, data: FormData) {
  const status = z.enum(taskStatusEnum.enumValues).parse(data.get('status'));
  await db.update(tasks).set({ status }).where(eq(tasks.id, id));
  revalidatePath('/', 'layout');
}

export async function deleteTask(id: number) {
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath('/', 'layout');
}

// --- Members ---------------------------------------------------------------

const memberSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  title: optional,
  email: optional
});

export async function createMember(data: FormData) {
  const values = memberSchema.parse(form(data));
  await db.insert(members).values(values);
  revalidatePath('/', 'layout');
}
