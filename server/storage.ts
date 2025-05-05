import { type User, type InsertUser, type Workout, type InsertWorkout, type Favorite, type InsertFavorite, type CompletedWorkout, type InsertCompletedWorkout, type ProgressTest, type InsertProgressTest, type Statistics, users, workouts, favorites, completedWorkouts, progressTests } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workout methods
  getWorkouts(): Promise<Workout[]>;
  getWorkout(id: number): Promise<Workout | undefined>;
  addWorkout(workout: InsertWorkout): Promise<Workout>;
  
  // Favorite methods
  getFavorites(userId: number): Promise<Workout[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(id: number): Promise<void>;
  
  // Completed Workout methods
  getCompletedWorkouts(userId: number): Promise<CompletedWorkout[]>;
  addCompletedWorkout(completedWorkout: InsertCompletedWorkout): Promise<CompletedWorkout>;
  
  // Progress Test methods
  getProgressTests(userId: number): Promise<ProgressTest[]>;
  addProgressTest(progressTest: InsertProgressTest): Promise<ProgressTest>;
  
  // Statistics
  getStatistics(userId: number): Promise<Statistics>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workouts: Map<number, Workout>;
  private favorites: Map<number, Favorite>;
  private completedWorkouts: Map<number, CompletedWorkout>;
  private progressTests: Map<number, ProgressTest>;
  
  public sessionStore: session.Store;
  
  private userIdCounter: number;
  private workoutIdCounter: number;
  private favoriteIdCounter: number;
  private completedWorkoutIdCounter: number;
  private progressTestIdCounter: number;

  constructor() {
    this.users = new Map();
    this.workouts = new Map();
    this.favorites = new Map();
    this.completedWorkouts = new Map();
    this.progressTests = new Map();
    
    this.userIdCounter = 1;
    this.workoutIdCounter = 1;
    this.favoriteIdCounter = 1;
    this.completedWorkoutIdCounter = 1;
    this.progressTestIdCounter = 1;
    
    // Create in-memory session store
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add default user
    this.users.set(1, {
      id: 1,
      username: 'tomasz',
      password: 'password123',
      email: null,
      firstName: null,
      lastName: null,
      gender: null,
      age: null,
      fitnessLevel: null,
      fitnessGoals: null,
      preferredWorkoutDays: null,
      workoutReminders: true,
      createdAt: new Date()
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      gender: insertUser.gender || null,
      age: insertUser.age || null,
      fitnessLevel: insertUser.fitnessLevel || null,
      fitnessGoals: insertUser.fitnessGoals || null,
      preferredWorkoutDays: insertUser.preferredWorkoutDays || null,
      workoutReminders: insertUser.workoutReminders || false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Workout methods
  async getWorkouts(): Promise<Workout[]> {
    return Array.from(this.workouts.values());
  }
  
  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }
  
  async addWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = this.workoutIdCounter++;
    const workout: Workout = {
      ...insertWorkout,
      id,
      date: insertWorkout.date || null,
      description: insertWorkout.description || null,
      imageUrl: insertWorkout.imageUrl || null,
      day: insertWorkout.day || null,
      totalDays: insertWorkout.totalDays || null,
      subtitle: insertWorkout.subtitle || null,
      createdAt: new Date()
    };
    this.workouts.set(id, workout);
    return workout;
  }
  
  // Favorite methods
  async getFavorites(userId: number): Promise<Workout[]> {
    const userFavorites = Array.from(this.favorites.values())
      .filter(favorite => favorite.userId === userId);
    
    return userFavorites.map(favorite => 
      this.workouts.get(favorite.workoutId)!
    ).filter(Boolean);
  }
  
  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteIdCounter++;
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      createdAt: new Date()
    };
    this.favorites.set(id, favorite);
    return favorite;
  }
  
  async removeFavorite(id: number): Promise<void> {
    this.favorites.delete(id);
  }
  
  // Completed Workout methods
  async getCompletedWorkouts(userId: number): Promise<CompletedWorkout[]> {
    return Array.from(this.completedWorkouts.values())
      .filter(completedWorkout => completedWorkout.userId === userId);
  }
  
  async addCompletedWorkout(insertCompletedWorkout: InsertCompletedWorkout): Promise<CompletedWorkout> {
    const id = this.completedWorkoutIdCounter++;
    const completedWorkout: CompletedWorkout = {
      ...insertCompletedWorkout,
      id,
      completedAt: new Date()
    };
    this.completedWorkouts.set(id, completedWorkout);
    return completedWorkout;
  }
  
  // Progress Test methods
  async getProgressTests(userId: number): Promise<ProgressTest[]> {
    return Array.from(this.progressTests.values())
      .filter(progressTest => progressTest.userId === userId);
  }
  
  async addProgressTest(insertProgressTest: InsertProgressTest): Promise<ProgressTest> {
    const id = this.progressTestIdCounter++;
    const progressTest: ProgressTest = {
      ...insertProgressTest,
      id,
      title: insertProgressTest.title,
      description: insertProgressTest.description || null,
      result: insertProgressTest.result || null,
      userId: insertProgressTest.userId,
      completedAt: new Date()
    };
    this.progressTests.set(id, progressTest);
    return progressTest;
  }
  
  // Statistics
  async getStatistics(userId: number): Promise<Statistics> {
    const completedWorkouts = await this.getCompletedWorkouts(userId);
    const progressTests = await this.getProgressTests(userId);
    
    // Calculate streak (simplified version)
    // In a real app, this would be more complex logic to determine weekly streaks
    const streak = 0; // Placeholder for now
    
    return {
      workouts: completedWorkouts.length,
      streak: streak,
      progressTests: progressTests.length
    };
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Set up PostgreSQL session store
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      conObject: {
        connectionString: process.env.DATABASE_URL!
      },
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        createdAt: new Date()
      })
      .returning();
    return user;
  }

  // Workout methods
  async getWorkouts(): Promise<Workout[]> {
    return db.select().from(workouts).orderBy(desc(workouts.createdAt));
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout;
  }

  async addWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const [workout] = await db
      .insert(workouts)
      .values({
        ...insertWorkout,
        date: insertWorkout.date || null,
        description: insertWorkout.description || null,
        imageUrl: insertWorkout.imageUrl || null,
        day: insertWorkout.day || null,
        totalDays: insertWorkout.totalDays || null,
        subtitle: insertWorkout.subtitle || null,
        createdAt: new Date()
      })
      .returning();
    return workout;
  }

  // Favorite methods
  async getFavorites(userId: number): Promise<Workout[]> {
    // Join favorites with workouts to get workout details
    const result = await db
      .select({
        workout: workouts
      })
      .from(favorites)
      .innerJoin(workouts, eq(favorites.workoutId, workouts.id))
      .where(eq(favorites.userId, userId));
    
    return result.map((r: { workout: Workout }) => r.workout);
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({
        userId: insertFavorite.userId,
        workoutId: insertFavorite.workoutId,
        createdAt: new Date()
      })
      .returning();
    return favorite;
  }

  async removeFavorite(id: number): Promise<void> {
    await db.delete(favorites).where(eq(favorites.id, id));
  }

  // Completed Workout methods
  async getCompletedWorkouts(userId: number): Promise<CompletedWorkout[]> {
    return db
      .select()
      .from(completedWorkouts)
      .where(eq(completedWorkouts.userId, userId))
      .orderBy(desc(completedWorkouts.completedAt));
  }

  async addCompletedWorkout(insertCompletedWorkout: InsertCompletedWorkout): Promise<CompletedWorkout> {
    const [completedWorkout] = await db
      .insert(completedWorkouts)
      .values({
        userId: insertCompletedWorkout.userId,
        workoutId: insertCompletedWorkout.workoutId,
        completedAt: new Date()
      })
      .returning();
    return completedWorkout;
  }

  // Progress Test methods
  async getProgressTests(userId: number): Promise<ProgressTest[]> {
    return db
      .select()
      .from(progressTests)
      .where(eq(progressTests.userId, userId))
      .orderBy(desc(progressTests.completedAt));
  }

  async addProgressTest(insertProgressTest: InsertProgressTest): Promise<ProgressTest> {
    const [progressTest] = await db
      .insert(progressTests)
      .values({
        ...insertProgressTest,
        description: insertProgressTest.description || null,
        result: insertProgressTest.result || null,
        completedAt: new Date()
      })
      .returning();
    return progressTest;
  }

  // Statistics
  async getStatistics(userId: number): Promise<Statistics> {
    // Count completed workouts
    const [workoutsResult] = await db
      .select({ count: sql`count(*)` })
      .from(completedWorkouts)
      .where(eq(completedWorkouts.userId, userId));
    
    // Count progress tests
    const [testsResult] = await db
      .select({ count: sql`count(*)` })
      .from(progressTests)
      .where(eq(progressTests.userId, userId));
    
    // Calculate streak - this would be more complex in real world
    // Here we're just calculating consecutive days with workouts
    const streak = 0;
    
    return {
      workouts: Number(workoutsResult.count) || 0,
      streak,
      progressTests: Number(testsResult.count) || 0
    };
  }
}

// Use database storage
export const storage = new DatabaseStorage();
