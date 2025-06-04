import { type InferSelectModel, relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { likes } from '../likes/schema';

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  views: integer('views').default(0),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  authorId: integer('author_id').notNull(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  emotionTag: text('emotion_tag').notNull(),
});

export const postsRelations = relations(posts, ({ many }) => ({
  likes: many(likes),
}));

export type Post = InferSelectModel<typeof posts>;
