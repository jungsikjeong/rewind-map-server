import { type InferSelectModel } from 'drizzle-orm';
import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { posts } from '../posts/schema';

export const likes = pgTable('likes', {
  id: uuid('id').primaryKey(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Like = InferSelectModel<typeof likes>;
