import { type User, type InsertUser, type Workout, type InsertWorkout, type Favorite, type InsertFavorite, type CompletedWorkout, type InsertCompletedWorkout, type ProgressTest, type InsertProgressTest, type Statistics } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workouts: Map<number, Workout>;
  private favorites: Map<number, Favorite>;
  private completedWorkouts: Map<number, CompletedWorkout>;
  private progressTests: Map<number, ProgressTest>;
  
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
    
    // Add default user
    this.users.set(1, {
      id: 1,
      username: 'tomasz',
      password: 'password123'
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
    const user: User = { ...insertUser, id };
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

export const storage = new MemStorage();
