import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { count } from 'drizzle-orm';
import { members, projects, tasks } from '../lib/schema';
import { seedAdminUser } from './seed-users';

// Sample data so a new tracker opens on a realistic portfolio. All people are
// fictional. Dates are relative to the day the seed runs.

function day(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

const MEMBERS = [
  { name: 'Ava Thompson', title: 'Engineering Manager', email: 'ava@example.com' },
  { name: 'Noah Kim', title: 'Product Designer', email: 'noah@example.com' },
  { name: 'Lena Fischer', title: 'Product Manager', email: 'lena@example.com' },
  { name: 'Diego Alvarez', title: 'Backend Engineer', email: 'diego@example.com' },
  { name: 'Zara Patel', title: 'Marketing Lead', email: 'zara@example.com' },
  { name: 'Sam Okoro', title: 'Frontend Engineer', email: 'sam@example.com' },
  { name: 'Mei Chen', title: 'Data Analyst', email: 'mei@example.com' }
];

type P = {
  name: string;
  description: string;
  owner: number;
  status: 'planning' | 'on_track' | 'at_risk' | 'off_track' | 'done';
  priority: 'low' | 'medium' | 'high';
  start: number;
  due: number;
  // [title, assignee, status, dueOffset]
  tasks: [string, number, 'todo' | 'in_progress' | 'done', number][];
};

const PROJECTS: P[] = [
  {
    name: 'Mobile app v2 launch',
    description: 'Ship the redesigned iOS and Android apps with offline mode and the new onboarding.',
    owner: 0, status: 'on_track', priority: 'high', start: -45, due: 21,
    tasks: [
      ['Finalize onboarding screens', 1, 'done', -20],
      ['Offline sync for drafts', 3, 'done', -6],
      ['Push notification preferences', 5, 'in_progress', 4],
      ['App Store screenshots & copy', 4, 'todo', 12],
      ['Beta feedback triage', 2, 'in_progress', 7],
      ['Release checklist sign-off', 0, 'todo', 19]
    ]
  },
  {
    name: 'Pricing page refresh',
    description: 'New plans, annual billing toggle and a comparison table.',
    owner: 4, status: 'at_risk', priority: 'high', start: -20, due: 6,
    tasks: [
      ['Plan comparison copy', 4, 'done', -8],
      ['Design annual toggle', 1, 'in_progress', 1],
      ['Billing API: annual prices', 3, 'todo', 3],
      ['Legal review of terms', 2, 'todo', 5]
    ]
  },
  {
    name: 'Data warehouse migration',
    description: 'Move reporting from the legacy warehouse to the new stack with zero downtime.',
    owner: 6, status: 'off_track', priority: 'medium', start: -60, due: -3,
    tasks: [
      ['Inventory legacy tables', 6, 'done', -40],
      ['Build ingestion pipelines', 3, 'in_progress', -10],
      ['Backfill 2 years of events', 6, 'todo', -2],
      ['Switch dashboards over', 6, 'todo', 10]
    ]
  },
  {
    name: 'Customer onboarding emails',
    description: 'A five-step lifecycle sequence for new sign-ups.',
    owner: 4, status: 'on_track', priority: 'medium', start: -10, due: 30,
    tasks: [
      ['Map the lifecycle journey', 2, 'done', -5],
      ['Write email copy', 4, 'in_progress', 8],
      ['Build templates', 5, 'todo', 15],
      ['Set up A/B test', 6, 'todo', 25]
    ]
  },
  {
    name: 'SOC 2 readiness',
    description: 'Policies, evidence collection and auditor kickoff.',
    owner: 0, status: 'planning', priority: 'high', start: 7, due: 75,
    tasks: [
      ['Pick a compliance platform', 0, 'in_progress', 10],
      ['Draft access-control policy', 3, 'todo', 30],
      ['Schedule auditor kickoff', 2, 'todo', 45]
    ]
  },
  {
    name: 'Design system tokens',
    description: 'Unify colors, spacing and typography tokens across web and mobile.',
    owner: 1, status: 'done', priority: 'low', start: -70, due: -14,
    tasks: [
      ['Audit existing styles', 1, 'done', -50],
      ['Define token scale', 1, 'done', -35],
      ['Publish token package', 5, 'done', -16]
    ]
  },
  {
    name: 'Self-serve analytics',
    description: 'Let customers build their own charts from saved queries.',
    owner: 2, status: 'on_track', priority: 'medium', start: -25, due: 45,
    tasks: [
      ['Customer interviews', 2, 'done', -15],
      ['Query builder prototype', 5, 'in_progress', 10],
      ['Chart rendering service', 3, 'todo', 25],
      ['Usage tracking', 6, 'todo', 35]
    ]
  },
  {
    name: 'Support help center',
    description: 'Searchable docs and an in-app help widget.',
    owner: 2, status: 'at_risk', priority: 'low', start: -15, due: 12,
    tasks: [
      ['Choose help center tool', 2, 'done', -9],
      ['Migrate top 30 articles', 4, 'in_progress', 4],
      ['In-app widget', 5, 'todo', 10]
    ]
  }
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  const [{ value }] = await db.select({ value: count() }).from(projects);
  if (value > 0) {
    console.log(`Skipping tracker seed: projects table already has ${value} rows.`);
  } else {
    console.log('Seeding project tracker sample data...');
    let taskCount = 0;
    await db.transaction(async (tx) => {
      const people = await tx.insert(members).values(MEMBERS).returning({ id: members.id });
      for (const p of PROJECTS) {
        const [project] = await tx
          .insert(projects)
          .values({
            name: p.name,
            description: p.description,
            ownerId: people[p.owner].id,
            status: p.status,
            priority: p.priority,
            startDate: day(p.start),
            dueDate: day(p.due)
          })
          .returning({ id: projects.id });
        await tx.insert(tasks).values(
          p.tasks.map(([title, assignee, status, due]) => ({
            title,
            status,
            projectId: project.id,
            assigneeId: people[assignee].id,
            dueDate: day(due)
          }))
        );
        taskCount += p.tasks.length;
      }
    });
    console.log(
      `Seeded ${MEMBERS.length} members, ${PROJECTS.length} projects, ${taskCount} tasks.`
    );
  }

  await seedAdminUser(db);
  await client.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
