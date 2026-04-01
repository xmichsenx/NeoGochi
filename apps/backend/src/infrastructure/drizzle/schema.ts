import { pgTable, uuid, varchar, integer, real, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const graveyard = pgTable('graveyard', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 30 }).notNull(),
  startingClass: varchar('starting_class', { length: 20 }).notNull(),
  finalLevel: integer('final_level').notNull(),
  daysSurvived: real('days_survived').notNull(),
  causeOfDeath: varchar('cause_of_death', { length: 100 }).notNull(),
  statsSnapshot: jsonb('stats_snapshot').notNull(),
  diedAt: timestamp('died_at', { withTimezone: true }).notNull().defaultNow(),
});
