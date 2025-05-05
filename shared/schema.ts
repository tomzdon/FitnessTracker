import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  gender: text("gender"),
  age: integer("age"),
  fitnessLevel: text("fitness_level"),
  fitnessGoals: text("fitness_goals"),
  preferredWorkoutDays: text("preferred_workout_days"),
  workoutReminders: boolean("workout_reminders").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  gender: true,
  age: true,
  fitnessLevel: true,
  fitnessGoals: true,
  preferredWorkoutDays: true,
  workoutReminders: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// We'll define relations after all tables are declared

// Workouts
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  duration: integer("duration").notNull(),  // duration in minutes
  difficulty: text("difficulty").notNull(),  // easy, medium, hard
  type: text("type").notNull(),  // strength, cardio, flexibility, etc.
  day: integer("day"),  // For program workouts: day 1, day 2, etc.
  totalDays: integer("total_days"),  // For program workouts: total number of days
  subtitle: text("subtitle"),  // Secondary title/subtitle
  date: text("date"),  // Date string for content like news/knowledge articles
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
});

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

// Favorites
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  workoutId: integer("workout_id").notNull().references(() => workouts.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// Workout Completion
export const completedWorkouts = pgTable("completed_workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  workoutId: integer("workout_id").notNull().references(() => workouts.id),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertCompletedWorkoutSchema = createInsertSchema(completedWorkouts).omit({
  id: true,
  completedAt: true,
});

export type InsertCompletedWorkout = z.infer<typeof insertCompletedWorkoutSchema>;
export type CompletedWorkout = typeof completedWorkouts.$inferSelect;

// Progress Tests
export const progressTests = pgTable("progress_tests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  result: text("result"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertProgressTestSchema = createInsertSchema(progressTests).omit({
  id: true,
  completedAt: true,
});

export type InsertProgressTest = z.infer<typeof insertProgressTestSchema>;
export type ProgressTest = typeof progressTests.$inferSelect;

// Statistics
export interface Statistics {
  workouts: number;
  streak: number;
  progressTests: number;
}

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  completedWorkouts: many(completedWorkouts),
  favorites: many(favorites),
  progressTests: many(progressTests),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  completedWorkouts: many(completedWorkouts),
  favorites: many(favorites),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  workout: one(workouts, {
    fields: [favorites.workoutId],
    references: [workouts.id],
  }),
}));

export const completedWorkoutsRelations = relations(completedWorkouts, ({ one }) => ({
  user: one(users, {
    fields: [completedWorkouts.userId],
    references: [users.id],
  }),
  workout: one(workouts, {
    fields: [completedWorkouts.workoutId],
    references: [workouts.id],
  }),
}));

export const progressTestsRelations = relations(progressTests, ({ one }) => ({
  user: one(users, {
    fields: [progressTests.userId],
    references: [users.id],
  }),
}));
