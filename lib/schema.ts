import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  serial,
  varchar,
  integer,
  date,
  index
} from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const roleEnum = pgEnum('role', ['user', 'admin']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type SelectUser = typeof users.$inferSelect;

// ---------------------------------------------------------------------------
// Project tracker
// ---------------------------------------------------------------------------

/** People who own projects and tasks (separate from login accounts). */
export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const projectStatusEnum = pgEnum('project_status', [
  'planning',
  'on_track',
  'at_risk',
  'off_track',
  'done'
]);

export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high']);

export const projects = pgTable(
  'projects',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    ownerId: integer('owner_id').references(() => members.id, { onDelete: 'set null' }),
    status: projectStatusEnum('status').default('planning').notNull(),
    priority: priorityEnum('priority').default('medium').notNull(),
    startDate: date('start_date', { mode: 'string' }),
    dueDate: date('due_date', { mode: 'string' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (t) => ({ ownerIdx: index('projects_owner_idx').on(t.ownerId) })
);

export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done']);

export const tasks = pgTable(
  'tasks',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    assigneeId: integer('assignee_id').references(() => members.id, { onDelete: 'set null' }),
    status: taskStatusEnum('status').default('todo').notNull(),
    dueDate: date('due_date', { mode: 'string' }),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (t) => ({
    projectIdx: index('tasks_project_idx').on(t.projectId),
    assigneeIdx: index('tasks_assignee_idx').on(t.assigneeId)
  })
);

export type Member = typeof members.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
export type Priority = (typeof priorityEnum.enumValues)[number];
export type TaskStatus = (typeof taskStatusEnum.enumValues)[number];
