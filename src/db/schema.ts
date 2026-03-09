import {
  integer,
  pgTable,
  varchar,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ============================================================================
// SHARED / LOOKUP TABLES
// ============================================================================

export const stepTypes = pgTable("step_types", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 50 }).notNull().unique(),
});

// ============================================================================
// RECIPE SYSTEM
// ============================================================================

export const recipes = pgTable(
  "recipes",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    parentRecipeId: integer("parent_recipe_id"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    {
      parentRecipeFk: {
        columns: [table.parentRecipeId],
        foreignColumns: [table.id],
        name: "recipes_parent_recipe_id_fkey",
      },
    },
  ]
);

export const recipeSteps = pgTable("recipe_steps", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  stepTypeId: integer("step_type_id")
    .notNull()
    .references(() => stepTypes.id),
  sortOrder: integer("sort_order").notNull(),
  instruction: text("instruction").notNull(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipeStepId: integer("recipe_step_id")
    .notNull()
    .references(() => recipeSteps.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  grams: integer("grams").notNull(),
});

// ============================================================================
// BAKE SYSTEM
// ============================================================================

export const bakeSessions = pgTable("bake_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  recipeId: integer("recipe_id").references(() => recipes.id, {
    onDelete: "set null",
  }),
  status: varchar("status", { length: 50 }).notNull().default("in_progress"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const bakeSteps = pgTable("bake_steps", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => bakeSessions.id, { onDelete: "cascade" }),
  stepTypeId: integer("step_type_id")
    .notNull()
    .references(() => stepTypes.id),
  customLabel: varchar("custom_label", { length: 255 }),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

export const bakeIngredients = pgTable("bake_ingredients", {
  id: serial("id").primaryKey(),
  bakeStepId: integer("bake_step_id")
    .notNull()
    .references(() => bakeSteps.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  grams: integer("grams").notNull(),
});

// ============================================================================
// SOCIAL SYSTEM
// ============================================================================

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  bakeStepId: integer("bake_step_id")
    .notNull()
    .references(() => bakeSteps.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 512 }).notNull(),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: integer("target_id").notNull(),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

