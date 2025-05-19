import { pgTable, text, serial, integer, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
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

// Exercises
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull().references(() => workouts.id),
  name: text("name").notNull(),
  description: text("description"),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  restTime: integer("rest_time").notNull(), // rest time in seconds
  weight: text("weight"), // weight in kg
  order: integer("order").notNull(), // order in the workout
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

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
  // We'll track completion by the scheduled date for each workout rather than by ID reference
  scheduledDate: timestamp("scheduled_date"),
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

// Programs
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  duration: integer("duration").notNull(), // total duration in days
  category: text("category"), // strength, cardio, flexibility, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
  createdAt: true,
});

export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;

// Program Workouts Junction Table
export const programWorkouts = pgTable("program_workouts", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull().references(() => programs.id),
  workoutId: integer("workout_id").notNull().references(() => workouts.id),
  day: integer("day").notNull(), // day number in the program sequence
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProgramWorkoutSchema = createInsertSchema(programWorkouts).omit({
  id: true,
  createdAt: true,
});

export type InsertProgramWorkout = z.infer<typeof insertProgramWorkoutSchema>;
export type ProgramWorkout = typeof programWorkouts.$inferSelect;

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  completedWorkouts: many(completedWorkouts),
  favorites: many(favorites),
  progressTests: many(progressTests),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  completedWorkouts: many(completedWorkouts),
  favorites: many(favorites),
  programWorkouts: many(programWorkouts),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [exercises.workoutId],
    references: [workouts.id],
  }),
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

export const programsRelations = relations(programs, ({ many }) => ({
  programWorkouts: many(programWorkouts)
}));

export const programWorkoutsRelations = relations(programWorkouts, ({ one }) => ({
  program: one(programs, {
    fields: [programWorkouts.programId],
    references: [programs.id],
  }),
  workout: one(workouts, {
    fields: [programWorkouts.workoutId],
    references: [workouts.id],
  }),
}));

// User Programs - to track which programs users are currently enrolled in
export const userPrograms = pgTable("user_programs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  programId: integer("program_id").notNull().references(() => programs.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  currentDay: integer("current_day").default(1),
  isActive: boolean("is_active").default(true),
  completedAt: timestamp("completed_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserProgramSchema = createInsertSchema(userPrograms).omit({
  id: true,
  createdAt: true,
});

export type InsertUserProgram = z.infer<typeof insertUserProgramSchema>;
export type UserProgram = typeof userPrograms.$inferSelect;

// Define userPrograms relations
export const userProgramsRelations = relations(userPrograms, ({ one }) => ({
  user: one(users, {
    fields: [userPrograms.userId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [userPrograms.programId],
    references: [programs.id],
  }),
}));

// Update users relations to include userPrograms
export const updatedUsersRelations = relations(users, ({ many }) => ({
  completedWorkouts: many(completedWorkouts),
  favorites: many(favorites),
  progressTests: many(progressTests),
  userPrograms: many(userPrograms),
}));

// Update programs relations to include userPrograms
export const updatedProgramsRelations = relations(programs, ({ many }) => ({
  programWorkouts: many(programWorkouts),
  userPrograms: many(userPrograms),
}));

// Session - managed by connect-pg-simple
// Scheduled Workouts - to track workouts scheduled on specific dates for users
export const scheduledWorkouts = pgTable("scheduled_workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  programId: integer("program_id").notNull().references(() => programs.id),
  workoutId: integer("workout_id").notNull().references(() => workouts.id),
  programDay: integer("program_day").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScheduledWorkoutSchema = createInsertSchema(scheduledWorkouts).omit({
  id: true,
  createdAt: true,
});

export type InsertScheduledWorkout = z.infer<typeof insertScheduledWorkoutSchema>;
export type ScheduledWorkout = typeof scheduledWorkouts.$inferSelect;

// Define scheduledWorkouts relations
export const scheduledWorkoutsRelations = relations(scheduledWorkouts, ({ one }) => ({
  user: one(users, {
    fields: [scheduledWorkouts.userId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [scheduledWorkouts.programId],
    references: [programs.id],
  }),
  workout: one(workouts, {
    fields: [scheduledWorkouts.workoutId],
    references: [workouts.id],
  }),
}));

// Update users relations to include scheduledWorkouts
export const updatedUsersRelationsWithSchedule = relations(users, ({ many }) => ({
  completedWorkouts: many(completedWorkouts),
  favorites: many(favorites),
  progressTests: many(progressTests),
  userPrograms: many(userPrograms),
  scheduledWorkouts: many(scheduledWorkouts),
}));

export const session = pgTable("session", {
  sid: varchar("sid").primaryKey().notNull(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});
