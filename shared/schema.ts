import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Workouts
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  duration: integer("duration").notNull(),  // duration in minutes
  difficulty: text("difficulty").notNull(),  // easy, medium, hard
  type: text("type").notNull(),  // strength, cardio, flexibility, etc.
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
