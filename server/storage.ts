import { type User, type InsertUser, type Workout, type InsertWorkout, type Favorite, type InsertFavorite, type CompletedWorkout, type InsertCompletedWorkout, type ProgressTest, type InsertProgressTest, type Program, type InsertProgram, type ProgramWorkout, type InsertProgramWorkout, type UserProgram, type InsertUserProgram, type ScheduledWorkout, type InsertScheduledWorkout, type Statistics, type Exercise, users, workouts, favorites, completedWorkouts, progressTests, programs, programWorkouts, userPrograms, scheduledWorkouts, exercises } from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: { 
    username?: string, 
    email?: string, 
    firstName?: string,
    lastName?: string,
    gender?: string, 
    age?: number, 
    fitnessLevel?: string, 
    fitnessGoals?: string, 
    preferredWorkoutDays?: string,
    workoutReminders?: boolean
  }): Promise<User>;
  
  // Workout methods
  getWorkouts(): Promise<Workout[]>;
  getWorkout(id: number): Promise<Workout | undefined>;
  addWorkout(workout: InsertWorkout): Promise<Workout>;
  
  // Exercise methods
  getExercisesByWorkoutId(workoutId: number): Promise<Exercise[]>;
  
  // Program methods
  getPrograms(): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  getProgramWithWorkouts(id: number): Promise<{program: Program, workouts: Workout[]}>;
  addProgram(program: InsertProgram): Promise<Program>;
  addProgramWorkout(programWorkout: InsertProgramWorkout): Promise<ProgramWorkout>;
  
  // User-Program methods
  getUserPrograms(userId: number): Promise<UserProgram[]>;
  getActiveUserProgram(userId: number): Promise<{userProgram: UserProgram, program: Program, workouts: Workout[]} | undefined>;
  assignUserProgram(userProgram: InsertUserProgram): Promise<UserProgram>;
  updateUserProgramProgress(id: number, data: { currentDay?: number, isActive?: boolean, completedAt?: Date }): Promise<UserProgram>;
  unsubscribeFromProgram(userProgramId: number): Promise<UserProgram>;
  
  // Scheduled Workout methods
  getScheduledWorkouts(userId: number): Promise<ScheduledWorkout[]>;
  getScheduledWorkoutsByDate(userId: number, date: Date): Promise<ScheduledWorkout[]>;
  getScheduledWorkoutsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ScheduledWorkout[]>;
  addScheduledWorkout(scheduledWorkout: InsertScheduledWorkout): Promise<ScheduledWorkout>;
  markScheduledWorkoutCompleted(id: number, isCompleted: boolean): Promise<ScheduledWorkout>;
  deleteScheduledWorkoutsForProgram(userId: number, programId: number): Promise<void>;
  
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
  private programs: Map<number, Program>;
  private programWorkouts: Map<number, ProgramWorkout>;
  private userPrograms: Map<number, UserProgram>;
  private favorites: Map<number, Favorite>;
  private completedWorkouts: Map<number, CompletedWorkout>;
  private progressTests: Map<number, ProgressTest>;
  private scheduledWorkouts: Map<number, ScheduledWorkout>;
  
  public sessionStore: session.Store;
  
  private userIdCounter: number;
  private workoutIdCounter: number;
  private programIdCounter: number;
  private programWorkoutIdCounter: number;
  private userProgramIdCounter: number;
  private favoriteIdCounter: number;
  private completedWorkoutIdCounter: number;
  private progressTestIdCounter: number;
  private scheduledWorkoutIdCounter: number;

  constructor() {
    this.users = new Map();
    this.workouts = new Map();
    this.programs = new Map();
    this.programWorkouts = new Map();
    this.userPrograms = new Map();
    this.favorites = new Map();
    this.completedWorkouts = new Map();
    this.progressTests = new Map();
    this.scheduledWorkouts = new Map();
    
    this.userIdCounter = 1;
    this.workoutIdCounter = 1;
    this.programIdCounter = 1;
    this.programWorkoutIdCounter = 1;
    this.userProgramIdCounter = 1;
    this.favoriteIdCounter = 1;
    this.completedWorkoutIdCounter = 1;
    this.progressTestIdCounter = 1;
    this.scheduledWorkoutIdCounter = 1;
    
    // Create in-memory session store
    const MemoryStore = createMemoryStore(session);
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
  
  async updateUser(id: number, userData: { 
    username?: string, 
    email?: string, 
    firstName?: string,
    lastName?: string,
    gender?: string, 
    age?: number, 
    fitnessLevel?: string, 
    fitnessGoals?: string, 
    preferredWorkoutDays?: string,
    workoutReminders?: boolean
  }): Promise<User> {
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const updatedUser: User = {
      ...existingUser,
      username: userData.username || existingUser.username,
      email: userData.email !== undefined ? userData.email : existingUser.email,
      firstName: userData.firstName !== undefined ? userData.firstName : existingUser.firstName,
      lastName: userData.lastName !== undefined ? userData.lastName : existingUser.lastName,
      gender: userData.gender !== undefined ? userData.gender : existingUser.gender,
      age: userData.age !== undefined ? userData.age : existingUser.age,
      fitnessLevel: userData.fitnessLevel !== undefined ? userData.fitnessLevel : existingUser.fitnessLevel,
      fitnessGoals: userData.fitnessGoals !== undefined ? userData.fitnessGoals : existingUser.fitnessGoals,
      preferredWorkoutDays: userData.preferredWorkoutDays !== undefined ? userData.preferredWorkoutDays : existingUser.preferredWorkoutDays,
      workoutReminders: userData.workoutReminders !== undefined ? userData.workoutReminders : existingUser.workoutReminders,
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
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
  
  // Exercise methods
  async getExercisesByWorkoutId(workoutId: number): Promise<Exercise[]> {
    // In memory implementation - we'll return mock exercises
    // In a real application with a database, this would fetch from the exercises table
    return [
      {
        id: 1,
        workoutId,
        name: "Squats",
        sets: 3,
        reps: 12,
        restTime: 60,
        weight: "70",
        description: "Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then return to starting position.",
        order: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        workoutId,
        name: "Push-ups",
        sets: 3,
        reps: 10,
        restTime: 60,
        weight: null,
        description: "Start in plank position with hands shoulder-width apart, lower your chest to the floor, then push back up.",
        order: 2,
        createdAt: new Date()
      },
      {
        id: 3,
        workoutId,
        name: "Lunges",
        sets: 3,
        reps: 10,
        restTime: 60,
        weight: "20",
        description: "Step forward with one leg, lower your body until both knees are bent at 90 degrees, then return to starting position.",
        order: 3,
        createdAt: new Date()
      },
      {
        id: 4,
        workoutId,
        name: "Plank",
        sets: 3,
        reps: 1,
        restTime: 60,
        weight: null,
        description: "Hold forearm plank position with core engaged for 30-60 seconds.",
        order: 4,
        createdAt: new Date()
      }
    ];
  }
  
  // Program methods
  async getPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values());
  }
  
  async getProgram(id: number): Promise<Program | undefined> {
    return this.programs.get(id);
  }
  
  async getProgramWithWorkouts(id: number): Promise<{program: Program, workouts: Workout[]}> {
    const program = this.programs.get(id);
    if (!program) {
      throw new Error('Program not found');
    }
    
    // Get all program workouts for this program
    const programWorkoutEntries = Array.from(this.programWorkouts.values())
      .filter(pw => pw.programId === id)
      .sort((a, b) => a.day - b.day); // Sort by day
    
    // Get the actual workouts
    const workoutsForProgram = programWorkoutEntries
      .map(pw => this.workouts.get(pw.workoutId)!)
      .filter(Boolean);
    
    return {
      program,
      workouts: workoutsForProgram
    };
  }
  
  async addProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = this.programIdCounter++;
    const program: Program = {
      ...insertProgram,
      id,
      description: insertProgram.description || null,
      imageUrl: insertProgram.imageUrl || null,
      category: insertProgram.category || null,
      createdAt: new Date()
    };
    this.programs.set(id, program);
    return program;
  }
  
  async addProgramWorkout(insertProgramWorkout: InsertProgramWorkout): Promise<ProgramWorkout> {
    const id = this.programWorkoutIdCounter++;
    const programWorkout: ProgramWorkout = {
      ...insertProgramWorkout,
      id,
      createdAt: new Date()
    };
    this.programWorkouts.set(id, programWorkout);
    return programWorkout;
  }
  
  // User-Program methods
  async getUserPrograms(userId: number): Promise<UserProgram[]> {
    return Array.from(this.userPrograms.values())
      .filter(userProgram => userProgram.userId === userId);
  }
  
  async getActiveUserProgram(userId: number): Promise<{userProgram: UserProgram, program: Program, workouts: Workout[]} | undefined> {
    // Find active user program
    const activeUserProgram = Array.from(this.userPrograms.values())
      .find(up => up.userId === userId && up.isActive);
      
    if (!activeUserProgram) {
      return undefined;
    }
    
    // Get program
    const program = this.programs.get(activeUserProgram.programId);
    if (!program) {
      return undefined;
    }
    
    // Get workouts for the program
    const { workouts } = await this.getProgramWithWorkouts(program.id);
    
    return {
      userProgram: activeUserProgram,
      program,
      workouts
    };
  }
  
  async assignUserProgram(userProgram: InsertUserProgram): Promise<UserProgram> {
    // First, deactivate any active programs for this user
    const userPrograms = await this.getUserPrograms(userProgram.userId);
    userPrograms.forEach(up => {
      if (up.isActive) {
        up.isActive = false;
        this.userPrograms.set(up.id, up);
      }
    });
    
    // Create new user program
    const id = this.userProgramIdCounter++;
    const newUserProgram: UserProgram = {
      ...userProgram,
      id,
      startedAt: new Date(),
      currentDay: userProgram.currentDay || 1,
      isActive: userProgram.isActive !== undefined ? userProgram.isActive : true,
      completedAt: userProgram.completedAt || null,
      unsubscribedAt: null,
      createdAt: new Date()
    };
    
    this.userPrograms.set(id, newUserProgram);
    return newUserProgram;
  }
  
  async updateUserProgramProgress(id: number, data: { currentDay?: number, isActive?: boolean, completedAt?: Date }): Promise<UserProgram> {
    const userProgram = this.userPrograms.get(id);
    if (!userProgram) {
      throw new Error('User program not found');
    }
    
    const updatedUserProgram: UserProgram = {
      ...userProgram,
      currentDay: data.currentDay !== undefined ? data.currentDay : userProgram.currentDay,
      isActive: data.isActive !== undefined ? data.isActive : userProgram.isActive,
      completedAt: data.completedAt !== undefined ? data.completedAt : userProgram.completedAt
    };
    
    this.userPrograms.set(id, updatedUserProgram);
    return updatedUserProgram;
  }
  
  async unsubscribeFromProgram(userProgramId: number): Promise<UserProgram> {
    const userProgram = this.userPrograms.get(userProgramId);
    if (!userProgram) {
      throw new Error('User program not found');
    }
    
    const updatedUserProgram: UserProgram = {
      ...userProgram,
      isActive: false,
      unsubscribedAt: new Date()
    };
    
    this.userPrograms.set(userProgramId, updatedUserProgram);
    
    // Also delete all scheduled workouts for this program
    await this.deleteScheduledWorkoutsForProgram(userProgram.userId, userProgram.programId);
    
    return updatedUserProgram;
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
  
  // Scheduled Workout methods
  async getScheduledWorkouts(userId: number): Promise<ScheduledWorkout[]> {
    return Array.from(this.scheduledWorkouts.values())
      .filter(sw => sw.userId === userId);
  }
  
  async getScheduledWorkoutsByDate(userId: number, date: Date): Promise<ScheduledWorkout[]> {
    const scheduledDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return Array.from(this.scheduledWorkouts.values())
      .filter(sw => {
        const swDate = new Date(sw.scheduledDate.getFullYear(), sw.scheduledDate.getMonth(), sw.scheduledDate.getDate());
        return sw.userId === userId && swDate.getTime() === scheduledDate.getTime();
      });
  }
  
  async getScheduledWorkoutsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ScheduledWorkout[]> {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    return Array.from(this.scheduledWorkouts.values())
      .filter(sw => {
        const swDate = new Date(sw.scheduledDate.getFullYear(), sw.scheduledDate.getMonth(), sw.scheduledDate.getDate());
        return sw.userId === userId && swDate.getTime() >= start.getTime() && swDate.getTime() <= end.getTime();
      });
  }
  
  async addScheduledWorkout(scheduledWorkout: InsertScheduledWorkout): Promise<ScheduledWorkout> {
    const id = this.scheduledWorkoutIdCounter++;
    const workout: ScheduledWorkout = {
      ...scheduledWorkout,
      id,
      isCompleted: scheduledWorkout.isCompleted || false,
      createdAt: new Date()
    };
    this.scheduledWorkouts.set(id, workout);
    return workout;
  }
  
  async markScheduledWorkoutCompleted(id: number, isCompleted: boolean): Promise<ScheduledWorkout> {
    const scheduledWorkout = this.scheduledWorkouts.get(id);
    if (!scheduledWorkout) {
      throw new Error('Scheduled workout not found');
    }
    
    const updatedWorkout: ScheduledWorkout = {
      ...scheduledWorkout,
      isCompleted: isCompleted
    };
    
    this.scheduledWorkouts.set(id, updatedWorkout);
    return updatedWorkout;
  }
  
  async deleteScheduledWorkoutsForProgram(userId: number, programId: number): Promise<void> {
    // Get all scheduled workouts for this user and program
    const workouts = Array.from(this.scheduledWorkouts.values())
      .filter(sw => sw.userId === userId && sw.programId === programId);
    
    // Delete each one
    workouts.forEach(sw => {
      this.scheduledWorkouts.delete(sw.id);
    });
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
    // Use PostgreSQL for session storage
    const PgSessionStore = connectPg(session);
    
    // Create the session store with the pool from db.ts
    try {
      this.sessionStore = new PgSessionStore({
        pool,
        createTableIfMissing: true,
        tableName: 'session'
      });
      console.log("Using PostgreSQL session store");
    } catch (error) {
      console.error("Failed to initialize PostgreSQL session store:", error);
      // Fallback to memory store
      const MemoryStore = createMemoryStore(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
      console.log("Falling back to memory session store");
    }
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
  
  async updateUser(id: number, userData: { 
    username?: string, 
    email?: string, 
    firstName?: string,
    lastName?: string,
    gender?: string, 
    age?: number, 
    fitnessLevel?: string, 
    fitnessGoals?: string, 
    preferredWorkoutDays?: string,
    workoutReminders?: boolean
  }): Promise<User> {
    // Build update object with only the fields that are provided
    const updateData: Partial<User> = {};
    if (userData.username !== undefined) updateData.username = userData.username;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.firstName !== undefined) updateData.firstName = userData.firstName;
    if (userData.lastName !== undefined) updateData.lastName = userData.lastName;
    if (userData.gender !== undefined) updateData.gender = userData.gender;
    if (userData.age !== undefined) updateData.age = userData.age;
    if (userData.fitnessLevel !== undefined) updateData.fitnessLevel = userData.fitnessLevel;
    if (userData.fitnessGoals !== undefined) updateData.fitnessGoals = userData.fitnessGoals;
    if (userData.preferredWorkoutDays !== undefined) updateData.preferredWorkoutDays = userData.preferredWorkoutDays;
    if (userData.workoutReminders !== undefined) updateData.workoutReminders = userData.workoutReminders;
    
    // Update the user in the database
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
      
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    return updatedUser;
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
  
  // Exercise methods
  async getExercisesByWorkoutId(workoutId: number): Promise<Exercise[]> {
    return db.select().from(exercises).where(eq(exercises.workoutId, workoutId)).orderBy(asc(exercises.order));
  }
  
  // Program methods
  async getPrograms(): Promise<Program[]> {
    return db.select().from(programs).orderBy(desc(programs.createdAt));
  }
  
  async getProgram(id: number): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program;
  }
  
  async getProgramWithWorkouts(id: number): Promise<{program: Program, workouts: Workout[]}> {
    // Get the program
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    if (!program) {
      throw new Error('Program not found');
    }
    
    // Get workouts related to this program
    const programWorkoutEntries = await db
      .select({
        pw: programWorkouts,
        workout: workouts
      })
      .from(programWorkouts)
      .innerJoin(workouts, eq(programWorkouts.workoutId, workouts.id))
      .where(eq(programWorkouts.programId, id))
      .orderBy(programWorkouts.day);
    
    const workoutsForProgram = programWorkoutEntries.map(entry => entry.workout);
    
    return {
      program,
      workouts: workoutsForProgram
    };
  }
  
  async addProgram(insertProgram: InsertProgram): Promise<Program> {
    const [program] = await db
      .insert(programs)
      .values({
        ...insertProgram,
        description: insertProgram.description || null,
        imageUrl: insertProgram.imageUrl || null,
        category: insertProgram.category || null,
        createdAt: new Date()
      })
      .returning();
    return program;
  }
  
  async addProgramWorkout(insertProgramWorkout: InsertProgramWorkout): Promise<ProgramWorkout> {
    const [programWorkout] = await db
      .insert(programWorkouts)
      .values({
        ...insertProgramWorkout,
        createdAt: new Date()
      })
      .returning();
    return programWorkout;
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
  
  // User-Program methods
  async getUserPrograms(userId: number): Promise<UserProgram[]> {
    return db
      .select()
      .from(userPrograms)
      .where(eq(userPrograms.userId, userId))
      .orderBy(desc(userPrograms.createdAt));
  }
  
  async getActiveUserProgram(userId: number): Promise<{userProgram: UserProgram, program: Program, workouts: Workout[]} | undefined> {
    // Find active user program
    const [activeUserProgram] = await db
      .select()
      .from(userPrograms)
      .where(and(
        eq(userPrograms.userId, userId),
        eq(userPrograms.isActive, true)
      ));
      
    if (!activeUserProgram) {
      return undefined;
    }
    
    // Get program details
    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, activeUserProgram.programId));
      
    if (!program) {
      return undefined;
    }
    
    // Get workouts for the program
    const { workouts } = await this.getProgramWithWorkouts(program.id);
    
    return {
      userProgram: activeUserProgram,
      program,
      workouts
    };
  }
  
  async assignUserProgram(insertUserProgram: InsertUserProgram): Promise<UserProgram> {
    // First, deactivate any active programs for this user
    await db
      .update(userPrograms)
      .set({ isActive: false })
      .where(and(
        eq(userPrograms.userId, insertUserProgram.userId),
        eq(userPrograms.isActive, true)
      ));
    
    // Create new user program
    const [newUserProgram] = await db
      .insert(userPrograms)
      .values({
        ...insertUserProgram,
        startedAt: new Date(),
        currentDay: insertUserProgram.currentDay || 1,
        isActive: insertUserProgram.isActive !== undefined ? insertUserProgram.isActive : true,
        completedAt: insertUserProgram.completedAt || null,
        createdAt: new Date()
      })
      .returning();
      
    return newUserProgram;
  }
  
  async updateUserProgramProgress(id: number, data: { currentDay?: number, isActive?: boolean, completedAt?: Date }): Promise<UserProgram> {
    // Build update object with only the fields that are provided
    const updateData: Partial<UserProgram> = {};
    if (data.currentDay !== undefined) updateData.currentDay = data.currentDay;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt;
    
    // Update the user program in the database
    const [updatedUserProgram] = await db
      .update(userPrograms)
      .set(updateData)
      .where(eq(userPrograms.id, id))
      .returning();
      
    if (!updatedUserProgram) {
      throw new Error('User program not found');
    }
    
    return updatedUserProgram;
  }
  
  async unsubscribeFromProgram(userProgramId: number): Promise<UserProgram> {
    // Update user program to be inactive and mark as unsubscribed
    const [updatedUserProgram] = await db
      .update(userPrograms)
      .set({ 
        isActive: false,
        unsubscribedAt: new Date()
      })
      .where(eq(userPrograms.id, userProgramId))
      .returning();
    
    if (!updatedUserProgram) {
      throw new Error('User program not found');
    }
    
    // Delete all scheduled workouts for this program
    await this.deleteScheduledWorkoutsForProgram(updatedUserProgram.userId, updatedUserProgram.programId);
    
    return updatedUserProgram;
  }
  
  // Scheduled Workout methods
  async getScheduledWorkouts(userId: number): Promise<ScheduledWorkout[]> {
    return db
      .select()
      .from(scheduledWorkouts)
      .where(eq(scheduledWorkouts.userId, userId))
      .orderBy(scheduledWorkouts.scheduledDate);
  }
  
  async getScheduledWorkoutsByDate(userId: number, date: Date): Promise<ScheduledWorkout[]> {
    // Convert date to ISO string format without time (YYYY-MM-DD)
    const dateString = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      .toISOString().split('T')[0];
    
    // Use SQL to compare just the date portion
    return db
      .select()
      .from(scheduledWorkouts)
      .where(and(
        eq(scheduledWorkouts.userId, userId),
        sql`DATE(${scheduledWorkouts.scheduledDate}) = ${dateString}`
      ));
  }
  
  async getScheduledWorkoutsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ScheduledWorkout[]> {
    // Convert dates to ISO string format without time (YYYY-MM-DD)
    const startDateString = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      .toISOString().split('T')[0];
    const endDateString = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      .toISOString().split('T')[0];
    
    // Use SQL to compare date ranges
    return db
      .select()
      .from(scheduledWorkouts)
      .where(and(
        eq(scheduledWorkouts.userId, userId),
        sql`DATE(${scheduledWorkouts.scheduledDate}) >= ${startDateString}`,
        sql`DATE(${scheduledWorkouts.scheduledDate}) <= ${endDateString}`
      ))
      .orderBy(scheduledWorkouts.scheduledDate);
  }
  
  async addScheduledWorkout(scheduledWorkout: InsertScheduledWorkout): Promise<ScheduledWorkout> {
    const [newScheduledWorkout] = await db
      .insert(scheduledWorkouts)
      .values({
        ...scheduledWorkout,
        isCompleted: scheduledWorkout.isCompleted || false,
        createdAt: new Date()
      })
      .returning();
    
    return newScheduledWorkout;
  }
  
  async markScheduledWorkoutCompleted(id: number, isCompleted: boolean): Promise<ScheduledWorkout> {
    const [updatedWorkout] = await db
      .update(scheduledWorkouts)
      .set({ isCompleted: isCompleted })
      .where(eq(scheduledWorkouts.id, id))
      .returning();
    
    if (!updatedWorkout) {
      throw new Error('Scheduled workout not found');
    }
    
    return updatedWorkout;
  }
  
  async deleteScheduledWorkoutsForProgram(userId: number, programId: number): Promise<void> {
    await db
      .delete(scheduledWorkouts)
      .where(and(
        eq(scheduledWorkouts.userId, userId),
        eq(scheduledWorkouts.programId, programId)
      ));
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
// Create and initialize the database storage
const dbStorage = new DatabaseStorage();

// Export the storage
export const storage = dbStorage;
