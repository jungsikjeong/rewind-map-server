import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const emotionTags = pgTable('emotion_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  emoji: text('emoji'), // 예: "😢"
  color: text('color'), // 예: "#FFC0CB"
  description: text('description'),
});
