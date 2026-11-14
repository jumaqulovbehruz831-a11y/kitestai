import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  username: text('username').notNull().default('user'),
  name: text('name').notNull().default('Foydalanuvchi'),
  role: text('role').notNull().default('user'),
  bio: text('bio').default(''),
  region: text('region').default('Toshkent shahri'),
  district: text('district').default('Yunusobod tumani'),
  institution: text('institution').default('KITEST Ishtirokchisi'),
  avatarUrl: text('avatar_url').default(''),
  rating: integer('rating').notNull().default(0),
  totalScore: integer('total_score').notNull().default(0),
  coins: integer('coins').notNull().default(0),
  stars: integer('stars').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  color: text('color').notNull().default('slate'),
  isPinned: boolean('is_pinned').notNull().default(false),
  driveFileId: text('drive_file_id').default(''),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  author: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));
