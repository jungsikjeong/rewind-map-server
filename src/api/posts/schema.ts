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
import { emotionTags } from '../emotion-tags/schema';

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  views: integer('views').default(0),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  authorId: uuid('author_id').notNull(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  emotionTagId: uuid('emotion_tag_id')
    .notNull()
    .references(() => emotionTags.id),
  revisitAt: timestamp('revisit_at'),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  likes: many(likes),
  emotionTag: one(emotionTags, {
    fields: [posts.emotionTagId],
    references: [emotionTags.id],
  }),
}));

export type Post = InferSelectModel<typeof posts>;
