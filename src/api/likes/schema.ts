import { type InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';
import { posts } from '../posts/schema';

export const likes = pgTable('likes', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .notNull()
    .references(() => posts.id),
  userId: integer('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Like = InferSelectModel<typeof likes>;
