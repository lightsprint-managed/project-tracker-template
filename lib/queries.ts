import 'server-only';

import { asc, eq, sql } from 'drizzle-orm';
import { db, members, projects, tasks } from './db';

/** Every project with its owner and task progress. */
export async function getProjectsWithProgress() {
  const progress = db
    .select({
      projectId: tasks.projectId,
      total: sql<number>`count(*)::int`.as('total'),
      done: sql<number>`(count(*) filter (where ${tasks.status} = 'done'))::int`.as('done')
    })
    .from(tasks)
    .groupBy(tasks.projectId)
    .as('progress');

  return db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      priority: projects.priority,
      startDate: projects.startDate,
      dueDate: projects.dueDate,
      ownerId: members.id,
      ownerName: members.name,
      total: sql<number>`coalesce(${progress.total}, 0)`,
      done: sql<number>`coalesce(${progress.done}, 0)`
    })
    .from(projects)
    .leftJoin(members, eq(projects.ownerId, members.id))
    .leftJoin(progress, eq(progress.projectId, projects.id))
    .orderBy(asc(projects.dueDate));
}

export type ProjectRow = Awaited<ReturnType<typeof getProjectsWithProgress>>[number];

export function percent(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export async function getMemberOptions() {
  return db
    .select({ id: members.id, name: members.name })
    .from(members)
    .orderBy(asc(members.name));
}
