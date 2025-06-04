import { relations } from 'drizzle-orm';
import { date, integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { posts } from '../posts/schema';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  nickname: text('nickname').unique(),
  password: text('password'),
});

export const userRelations = relations(users, ({ many, one }) => ({
  posts: many(posts),
  profile: one(profile),
}));

export const profile = pgTable('profile', {
  id: serial('id').primaryKey(),
  birthdate: date('birthdate'),
  biography: text('biography'),
  userId: integer('user_id').references(() => users.id),
});

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(users, { fields: [profile.userId], references: [users.id] }),
}));
