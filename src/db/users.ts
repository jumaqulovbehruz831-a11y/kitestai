import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateSqlUser(params: {
  uid: string;
  email: string;
  name?: string;
  username?: string;
  role?: string;
  avatarUrl?: string;
}) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid: params.uid,
        email: params.email,
        name: params.name || params.email.split('@')[0] || 'Foydalanuvchi',
        username:
          params.username ||
          params.email
            .split('@')[0]
            .replace(/[^a-z0-9_]/gi, '_')
            .toLowerCase() ||
          'user',
        role: params.role || 'user',
        avatarUrl: params.avatarUrl || '',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: params.email,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database user upsert failed:', error);
    throw new Error('Foydalanuvchi bazasini yangilashda xatolik yuz berdi.', {
      cause: error,
    });
  }
}

export async function getSqlUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid));
    return rows[0] || null;
  } catch (error) {
    console.error('Database getSqlUserByUid failed:', error);
    throw new Error('Foydalanuvchi maʼlumotini olishda xatolik.', { cause: error });
  }
}

export async function getSqlUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Database query failed:', error);
    throw new Error('Maʼlumotlar bazasidan olishda xatolik yuz berdi.', {
      cause: error,
    });
  }
}
