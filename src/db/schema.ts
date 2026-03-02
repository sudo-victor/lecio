import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const interactions = pgTable("interactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  topic: text("topic").notNull(),
  output: text("output").notNull(),
  useful: boolean("useful"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
