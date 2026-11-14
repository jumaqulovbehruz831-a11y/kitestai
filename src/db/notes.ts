import { db } from './index.ts';
import { notes, users } from './schema.ts';
import { desc, eq, and } from 'drizzle-orm';

export async function getUserNotesByUid(uid: string) {
  try {
    const rows = await db
      .select({
        id: notes.id,
        userId: notes.userId,
        title: notes.title,
        content: notes.content,
        color: notes.color,
        isPinned: notes.isPinned,
        driveFileId: notes.driveFileId,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .innerJoin(users, eq(notes.userId, users.id))
      .where(eq(users.uid, uid))
      .orderBy(desc(notes.isPinned), desc(notes.updatedAt));
    return rows;
  } catch (error) {
    console.error('Failed to query notes:', error);
    throw new Error('Eslatmalarni olishda xatolik yuz berdi.', { cause: error });
  }
}

export async function createNoteForSqlUser(
  userId: number,
  data: {
    title: string;
    content: string;
    color?: string;
    isPinned?: boolean;
    driveFileId?: string;
  }
) {
  try {
    const result = await db
      .insert(notes)
      .values({
        userId,
        title: data.title,
        content: data.content,
        color: data.color || 'slate',
        isPinned: Boolean(data.isPinned),
        driveFileId: data.driveFileId || '',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to create note:', error);
    throw new Error('Eslatmani saqlashda xatolik yuz berdi.', { cause: error });
  }
}

export async function updateNoteForSqlUser(
  noteId: number,
  userId: number,
  data: {
    title?: string;
    content?: string;
    color?: string;
    isPinned?: boolean;
    driveFileId?: string;
  }
) {
  try {
    const result = await db
      .update(notes)
      .set({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
        ...(data.driveFileId !== undefined ? { driveFileId: data.driveFileId } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Failed to update note:', error);
    throw new Error('Eslatmani yangilashda xatolik yuz berdi.', { cause: error });
  }
}

export async function deleteNoteForSqlUser(noteId: number, userId: number) {
  try {
    const result = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw new Error('Eslatmani o‘chirishda xatolik yuz berdi.', { cause: error });
  }
}
