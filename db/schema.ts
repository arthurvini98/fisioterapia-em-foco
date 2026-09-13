import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
export const lessons = sqliteTable('lesson_progress', {
  userId: text('user_id').notNull(), lessonId: text('lesson_id').notNull(),
  currentStep: integer('current_step').notNull().default(0),
  completedSteps: text('completed_steps').notNull().default('[]'),
  updatedAt: integer('updated_at').notNull(),
}, t => [primaryKey({columns: [t.userId, t.lessonId]})]);
export const reviews = sqliteTable('review_events', {
  userId: text('user_id').notNull(), eventId: text('event_id').notNull(),
  structureId: text('structure_id').notNull(), correct: integer('correct').notNull(),
  createdAt: integer('created_at').notNull(),
}, t => [primaryKey({columns:[t.userId,t.eventId]}), index('idx_reviews_user_structure_time').on(t.userId,t.structureId,t.createdAt)]);

export const notes = sqliteTable('structure_notes', {
 userId:text('user_id').notNull(),structureId:text('structure_id').notNull(),
 body:text('body').notNull().default(''),version:integer('version').notNull().default(1),updatedAt:integer('updated_at').notNull(),
},t=>[primaryKey({columns:[t.userId,t.structureId]})]);
