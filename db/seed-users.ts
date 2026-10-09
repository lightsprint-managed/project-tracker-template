import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { hash } from 'bcryptjs';
import { users } from '../lib/schema';

/** Ensure the demo admin account exists (admin@admin.com / password). */
export async function seedAdminUser(db: PostgresJsDatabase) {
  const passwordHash = await hash('password', 12);
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, 'admin@admin.com'))
    .limit(1);

  if (existing) {
    console.log('Admin user already exists.');
    return;
  }
  await db.insert(users).values({
    name: 'Admin',
    email: 'admin@admin.com',
    passwordHash,
    role: 'admin'
  });
  console.log('Seeded admin user (admin@admin.com / password).');
}
