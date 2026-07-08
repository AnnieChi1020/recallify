import {
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const decks = pgTable("decks", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  title: text().notNull(),
  sourceText: text("source_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const cards = pgTable("cards", {
  id: uuid().primaryKey().defaultRandom(),
  deckId: uuid("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  type: text().notNull(),
  question: text().notNull(),
  answer: text().notNull(),
  options: jsonb(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const cardStates = pgTable("card_states", {
  cardId: uuid("card_id")
    .primaryKey()
    .references(() => cards.id, { onDelete: "cascade" }),
  easeFactor: real("ease_factor").notNull().default(2.5),
  intervalDays: integer("interval_days").notNull().default(0),
  repetitions: integer().notNull().default(0),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid().primaryKey().defaultRandom(),
  cardId: uuid("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  rating: integer().notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).defaultNow(),
});
