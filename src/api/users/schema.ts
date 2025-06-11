import { relations } from 'drizzle-orm';
import { date, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { posts } from '../posts/schema';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  avatar: text('avatar'),
  nickname: text('nickname').unique().notNull(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
});

export const userRelations = relations(users, ({ many, one }) => ({
  posts: many(posts),
  profile: one(profile),
}));

export const profile = pgTable('profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  birthdate: date('birthdate'),
  biography: text('biography'),
  userId: uuid('user_id').references(() => users.id),
});

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(users, { fields: [profile.userId], references: [users.id] }),
}));

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
