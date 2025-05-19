import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFavoriteSchema, insertWorkoutSchema, insertProgramSchema, insertProgramWorkoutSchema, insertUserProgramSchema, favorites } from "@shared/schema";
import { setupAuth } from "./auth";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // API routes
  const apiRouter = express.Router();
  
  // Get current user endpoint
  apiRouter.get('/me', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Failed to fetch user data' });
    }
  });
  
  // Update user endpoint
  apiRouter.put('/me', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      // Allow updating both profile and fitness information
      const { 
        username, 
        email, 
        firstName,
        lastName,
        gender, 
        age, 
        fitnessLevel, 
        fitnessGoals, 
        preferredWorkoutDays,
        workoutReminders
      } = req.body;
      
      // Check if username already exists
      if (username && username !== req.user!.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: 'Username already taken' });
        }
      }
      
      // Update the user
      const updatedUser = await storage.updateUser(userId, { 
        username, 
        email,
        firstName,
        lastName,
        gender, 
        age: age ? parseInt(age) : undefined, 
        fitnessLevel, 
        fitnessGoals, 
        preferredWorkoutDays,
        workoutReminders: workoutReminders !== undefined ? Boolean(workoutReminders) : undefined
      });
      
      // Update the session user data
      req.user = updatedUser;
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user data' });
    }
  });
  
  // Get statistics
  apiRouter.get('/statistics', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      console.log('Getting statistics for user:', userId);
      const statistics = await storage.getStatistics(userId);
      res.json(statistics);
    } catch (error) {
      console.error('Error getting statistics:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  // Get favorites
  apiRouter.get('/favourites', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      console.log('Getting favorites for user:', userId);
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error('Error getting favorites:', error);
      res.status(500).json({ message: 'Failed to fetch favorites' });
    }
  });

  // Add favorite
  apiRouter.post('/favourites', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const data = {
        ...req.body,
        userId
      };
      const validatedData = insertFavoriteSchema.parse(data);
      const favorite = await storage.addFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error('Error adding favorite:', error);
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Get favorite details (raw records without workout details)
  apiRouter.get('/favourites/details', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      // Get all favorites from storage directly (not resolved)
      const { pool } = require('./db');
      const query = `SELECT * FROM favorites WHERE user_id = $1`;
      const result = await pool.query(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting favorite details:', error);
      res.status(500).json({ message: 'Failed to fetch favorite details' });
    }
  });
  
  // Remove favorite by workout ID - MUST come before the generic :id route
  apiRouter.delete('/favourites/by-workout/:workoutId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const workoutId = parseInt(req.params.workoutId);
      
      if (isNaN(workoutId)) {
        return res.status(400).json({ message: 'Invalid workout ID' });
      }
      
      console.log(`Removing favorite for user:${userId}, workout:${workoutId}`);
      
      try {
        // Najpierw wyszukaj ulubione korzystając ze storage api
        const allFavorites = await storage.getFavorites(userId);
        console.log('All favorites:', allFavorites.map(f => ({ id: f.id, title: f.title })));
        
        // Użyjmy Drizzle ORM zamiast bezpośredniego SQL
        console.log('Sprawdzam dokładnie tabele favorites...');
        
        // Znajdź ulubiony dla tego użytkownika i tego treningu
        const favoritesList = await db
          .select()
          .from(favorites)
          .where(
            and(
              eq(favorites.userId, userId),
              eq(favorites.workoutId, workoutId)
            )
          );
        
        console.log('Find result for specific workout:', favoritesList);
        
        if (favoritesList.length === 0) {
          console.log(`Nie znaleziono ulubionego dla user_id=${userId}, workout_id=${workoutId}`);
          return res.status(404).json({ message: 'Favorite not found' });
        }
        
        const favoriteId = favoritesList[0].id;
        console.log(`Found favorite ID: ${favoriteId}, now removing...`);
        
        // Usuń ulubiony używając Drizzle ORM
        const deleteResult = await db
          .delete(favorites)
          .where(eq(favorites.id, favoriteId))
          .returning();
        
        console.log('Delete result:', deleteResult);
        
        if (deleteResult.length === 0) {
          console.log('Usunięcie nie zwróciło żadnych wierszy - to dziwne');
          return res.status(500).json({ message: 'Failed to delete favorite' });
        }
        
        console.log(`Pomyślnie usunięto ulubiony o ID: ${favoriteId}`);
      } catch (error: any) {
        console.error('Dokładny błąd przy usuwaniu:', error);
        const errorMessage = error.message || 'Nieznany błąd podczas usuwania';
        return res.status(500).json({ message: `Error details: ${errorMessage}` });
      }
      
      res.status(200).json({ success: true, message: 'Favorite removed successfully' });
    } catch (error: any) {
      console.error('Error removing favorite by workout ID:', error);
      const errorMessage = error.message || 'Failed to remove favorite by workout ID';
      res.status(500).json({ message: errorMessage });
    }
  });
  
  // Remove favorite by ID
  apiRouter.delete('/favourites/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFavorite(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ message: 'Failed to remove favorite' });
    }
  });

  // Get workouts (no auth required - public endpoint)
  apiRouter.get('/workouts', async (req: Request, res: Response) => {
    try {
      // If date is provided as a query parameter, filter workouts for that date
      const date = req.query.date as string;
      
      if (date) {
        // In a real app, we would query the database for workouts on this date
        // For now, we'll just return an empty array since we don't have date-specific workouts
        const workouts = await storage.getWorkouts();
        // In a real app, we would filter workouts by date
        // const filteredWorkouts = workouts.filter(workout => workout.date === date);
        res.json([]);
      } else {
        // Return all workouts if no date is specified
        const workouts = await storage.getWorkouts();
        res.json(workouts);
      }
    } catch (error) {
      console.error('Error getting workouts:', error);
      res.status(500).json({ message: 'Failed to fetch workouts' });
    }
  });
  
  // Get workout by ID (no auth required - public endpoint)
  apiRouter.get('/workouts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid workout ID' });
      }
      
      const workout = await storage.getWorkout(id);
      if (!workout) {
        return res.status(404).json({ message: 'Workout not found' });
      }
      
      res.json(workout);
    } catch (error) {
      console.error('Error getting workout by ID:', error);
      res.status(500).json({ message: 'Failed to fetch workout' });
    }
  });
  
  // Get exercises for a workout (no auth required - public endpoint)
  apiRouter.get('/exercises/:workoutId', async (req: Request, res: Response) => {
    try {
      const workoutId = parseInt(req.params.workoutId);
      if (isNaN(workoutId)) {
        return res.status(400).json({ message: 'Invalid workout ID' });
      }
      
      const exercises = await storage.getExercisesByWorkoutId(workoutId);
      res.json(exercises);
    } catch (error) {
      console.error('Error getting exercises by workout ID:', error);
      res.status(500).json({ message: 'Failed to fetch exercises' });
    }
  });
  
  // Get completed workouts
  apiRouter.get('/completedWorkouts', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      console.log('Getting completed workouts for user:', userId);
      const completedWorkouts = await storage.getCompletedWorkouts(userId);
      res.json(completedWorkouts);
    } catch (error) {
      console.error('Error getting completed workouts:', error);
      res.status(500).json({ message: 'Failed to fetch completed workouts' });
    }
  });
  
  // Add completed workout
  apiRouter.post('/completedWorkouts', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const completedWorkout = await storage.addCompletedWorkout({
        userId,
        workoutId: req.body.workoutId
      });
      res.status(201).json(completedWorkout);
    } catch (error) {
      console.error('Error adding completed workout:', error);
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Add workout (admin endpoint in real application)
  apiRouter.post('/workouts', async (req: Request, res: Response) => {
    try {
      const validatedData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.addWorkout(validatedData);
      res.status(201).json(workout);
    } catch (error) {
      console.error('Error adding workout:', error);
      res.status(400).json({ message: 'Invalid request data' });
    }
  });
  
  // Progress tests endpoints
  apiRouter.get('/progressTests', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const progressTests = await storage.getProgressTests(userId);
      res.json(progressTests);
    } catch (error) {
      console.error('Error getting progress tests:', error);
      res.status(500).json({ message: 'Failed to fetch progress tests' });
    }
  });
  
  apiRouter.post('/progressTests', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const progressTest = await storage.addProgressTest({
        ...req.body,
        userId
      });
      res.status(201).json(progressTest);
    } catch (error) {
      console.error('Error adding progress test:', error);
      res.status(400).json({ message: 'Invalid request data' });
    }
  });
  
  // Program endpoints
  // Get all programs (no auth required - public endpoint)
  apiRouter.get('/programs', async (req: Request, res: Response) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      console.error('Error getting programs:', error);
      res.status(500).json({ message: 'Failed to fetch programs' });
    }
  });
  
  // Get a specific program with its associated workouts
  apiRouter.get('/programs/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const programWithWorkouts = await storage.getProgramWithWorkouts(id);
      res.json(programWithWorkouts);
    } catch (error) {
      console.error('Error getting program:', error);
      res.status(404).json({ message: 'Program not found' });
    }
  });
  
  // Add a new program (admin endpoint in real application)
  apiRouter.post('/programs', async (req: Request, res: Response) => {
    try {
      const validatedData = insertProgramSchema.parse(req.body);
      const program = await storage.addProgram(validatedData);
      res.status(201).json(program);
    } catch (error) {
      console.error('Error adding program:', error);
      res.status(400).json({ message: 'Invalid request data' });
    }
  });
  
  // Add a workout to a program (admin endpoint in real application)
  apiRouter.post('/programs/:programId/workouts', async (req: Request, res: Response) => {
    try {
      const programId = parseInt(req.params.programId);
      const validatedData = insertProgramWorkoutSchema.parse({
        ...req.body,
        programId
      });
      const programWorkout = await storage.addProgramWorkout(validatedData);
      res.status(201).json(programWorkout);
    } catch (error) {
      console.error('Error adding workout to program:', error);
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // User-Program endpoints
  apiRouter.get('/user-programs', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const userPrograms = await storage.getUserPrograms(userId);
      res.json(userPrograms);
    } catch (error) {
      console.error('Error getting user programs:', error);
      res.status(500).json({ message: 'Failed to fetch user programs' });
    }
  });
  
  apiRouter.get('/active-program', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const activeProgram = await storage.getActiveUserProgram(userId);
      
      if (!activeProgram) {
        return res.status(404).json({ message: 'No active program found' });
      }
      
      res.json(activeProgram);
    } catch (error) {
      console.error('Error getting active program:', error);
      res.status(500).json({ message: 'Failed to fetch active program' });
    }
  });
  
  apiRouter.post('/programs/:programId/assign', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const programId = parseInt(req.params.programId);
      const userId = req.user!.id;
      
      // Check if program exists
      const program = await storage.getProgram(programId);
      if (!program) {
        return res.status(404).json({ message: 'Program not found' });
      }
      
      // Check if user already has an active program
      const activeProgram = await storage.getActiveUserProgram(userId);
      if (activeProgram) {
        return res.status(400).json({ 
          message: 'User already has an active program',
          activeProgramId: activeProgram.userProgram.id 
        });
      }
      
      // Assign the program to the user
      const userProgram = await storage.assignUserProgram({
        userId,
        programId,
        currentDay: 1,
        isActive: true
      });
      
      // Get program workouts
      const { workouts } = await storage.getProgramWithWorkouts(programId);
      
      // Schedule workouts for the entire program duration, every 3 days
      const startDate = new Date();
      const scheduledWorkouts = [];
      
      // Calculate how many workouts to schedule based on program duration
      // We need to assign workouts for the whole program duration
      const totalWorkoutsNeeded = program.duration;
      
      // Get the real workout days from the program
      let workoutsByDay = [];
      for (let i = 0; i < workouts.length; i++) {
        // Ensure each workout has a proper day assignment
        workoutsByDay.push({
          workout: workouts[i],
          programDay: i + 1  // Assign sequential program days (Day 1, Day 2, Day 3, etc.)
        });
      }
      
      // If we have more days than workouts, repeat the workout sequence
      if (totalWorkoutsNeeded > workouts.length) {
        let currentDay = workouts.length + 1;
        while (currentDay <= totalWorkoutsNeeded) {
          for (let i = 0; i < workouts.length && currentDay <= totalWorkoutsNeeded; i++) {
            workoutsByDay.push({
              workout: workouts[i],
              programDay: currentDay  // Keep program days sequential even when repeating workouts
            });
            currentDay++;
          }
        }
      }
      
      // Now schedule each workout with the correct sequential program day
      for (let i = 0; i < totalWorkoutsNeeded; i++) {
        const { workout, programDay } = workoutsByDay[i];
        
        // Calculate date: every 3 days from start date
        const scheduledDate = new Date(startDate);
        scheduledDate.setDate(startDate.getDate() + (i * 3)); // Every 3 days
        
        const scheduledWorkout = await storage.addScheduledWorkout({
          userId,
          programId,
          workoutId: workout.id,
          programDay: programDay, // Use the properly assigned sequential program day
          scheduledDate,
          isCompleted: false
        });
        
        scheduledWorkouts.push(scheduledWorkout);
      }
      
      res.status(201).json({
        userProgram,
        scheduledWorkouts
      });
    } catch (error) {
      console.error('Error assigning program:', error);
      res.status(500).json({ message: 'Failed to assign program to user' });
    }
  });
  
  apiRouter.put('/user-programs/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { currentDay, isActive, completedAt } = req.body;
      
      const updatedUserProgram = await storage.updateUserProgramProgress(
        id,
        { 
          currentDay: currentDay !== undefined ? parseInt(currentDay) : undefined, 
          isActive: isActive !== undefined ? Boolean(isActive) : undefined, 
          completedAt: completedAt ? new Date(completedAt) : undefined 
        }
      );
      
      res.json(updatedUserProgram);
    } catch (error) {
      console.error('Error updating user program:', error);
      res.status(500).json({ message: 'Failed to update user program' });
    }
  });
  
  apiRouter.post('/user-programs/:id/unsubscribe', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Unsubscribe from program
      const updatedUserProgram = await storage.unsubscribeFromProgram(id);
      
      // Ensure that the user can only unsubscribe from their own programs
      if (updatedUserProgram.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to unsubscribe from this program' });
      }
      
      res.json(updatedUserProgram);
    } catch (error) {
      console.error('Error unsubscribing from program:', error);
      res.status(500).json({ message: 'Failed to unsubscribe from program' });
    }
  });
  
  // Scheduled Workouts endpoints
  apiRouter.get('/scheduled-workouts', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const scheduledWorkouts = await storage.getScheduledWorkouts(userId);
      res.json(scheduledWorkouts);
    } catch (error) {
      console.error('Error getting scheduled workouts:', error);
      res.status(500).json({ message: 'Failed to fetch scheduled workouts' });
    }
  });
  
  apiRouter.get('/scheduled-workouts/date/:date', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const date = new Date(req.params.date);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      
      const scheduledWorkouts = await storage.getScheduledWorkoutsByDate(userId, date);
      res.json(scheduledWorkouts);
    } catch (error) {
      console.error('Error getting scheduled workouts by date:', error);
      res.status(500).json({ message: 'Failed to fetch scheduled workouts' });
    }
  });
  
  apiRouter.get('/scheduled-workouts/range/:startDate/:endDate', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const startDate = new Date(req.params.startDate);
      const endDate = new Date(req.params.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      
      const scheduledWorkouts = await storage.getScheduledWorkoutsByDateRange(userId, startDate, endDate);
      res.json(scheduledWorkouts);
    } catch (error) {
      console.error('Error getting scheduled workouts by date range:', error);
      res.status(500).json({ message: 'Failed to fetch scheduled workouts' });
    }
  });
  
  apiRouter.post('/scheduled-workouts', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { programId, workoutId, programDay, scheduledDate } = req.body;
      
      if (!programId || !workoutId || !programDay || !scheduledDate) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const scheduledWorkout = await storage.addScheduledWorkout({
        userId,
        programId: parseInt(programId),
        workoutId: parseInt(workoutId),
        programDay: parseInt(programDay),
        scheduledDate: new Date(scheduledDate),
        isCompleted: false
      });
      
      res.status(201).json(scheduledWorkout);
    } catch (error) {
      console.error('Error adding scheduled workout:', error);
      res.status(500).json({ message: 'Failed to schedule workout' });
    }
  });
  
  // Endpoint do naprawy brakującej daty w zaplanowanym treningu
  apiRouter.put('/scheduled-workouts/:id/fix', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Pobierz obecny trening
      const allWorkouts = await storage.getScheduledWorkouts(userId);
      const workoutToFix = allWorkouts.find(w => w.id === id);
      
      if (!workoutToFix) {
        return res.status(404).json({ message: 'Scheduled workout not found or not owned by user' });
      }
      
      // Aktualizuj trening bezpośrednio w bazie danych
      // Ponieważ nie ma metody updateScheduledWorkoutDate w storage, użyjemy bezpośrednio bazy danych
      const { pool } = require('./db');
      const updateQuery = `
        UPDATE scheduled_workouts 
        SET scheduled_date = $1
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `;
      
      const updateResult = await pool.query(
        updateQuery, 
        [
          req.body.scheduledDate ? new Date(req.body.scheduledDate) : new Date('2025-05-22T12:00:00.000Z'), 
          id, 
          userId
        ]
      );
      
      if (updateResult.rows.length === 0) {
        return res.status(404).json({ message: 'Failed to update workout date' });
      }
      
      // Konwertujemy dane z bazy na obiekt ScheduledWorkout
      const updatedWorkout = updateResult.rows[0];
      
      res.status(200).json({ message: 'Workout fixed successfully', workout: updatedWorkout });
    } catch (error) {
      console.error('Error fixing scheduled workout:', error);
      res.status(500).json({ message: 'Failed to fix scheduled workout' });
    }
  });

  apiRouter.put('/scheduled-workouts/:id/complete', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      const { isCompleted } = req.body;
      
      if (isCompleted === undefined) {
        return res.status(400).json({ message: 'Missing isCompleted field' });
      }
      
      // Check if this workout exists and belongs to this user
      // Get all workouts for this user
      const allWorkouts = await storage.getScheduledWorkouts(userId);
      const workoutToUpdate = allWorkouts.find(w => w.id === id);
      
      if (!workoutToUpdate) {
        return res.status(404).json({ message: 'Scheduled workout not found or not owned by user' });
      }
      
      console.log(`Updating ONLY workout ID ${id} to isCompleted=${isCompleted}`);
      
      // STEP 1: Mark ONLY this specific workout as completed
      const updatedWorkout = await storage.markScheduledWorkoutCompleted(id, Boolean(isCompleted));
      
      // If marking as incomplete, just return the updated workout
      if (!isCompleted) {
        return res.json({
          updatedWorkout
        });
      }
      
      // STEP 2: Add to completed workouts history
      // Dodajemy scheduledDate do ukończonego treningu dla niezależnego śledzenia
      // Konwertujemy datę do prawidłowego formatu
      const scheduledDate = updatedWorkout.scheduledDate ? new Date(updatedWorkout.scheduledDate) : new Date();
      
      const completedWorkout = await storage.addCompletedWorkout({
        userId,
        workoutId: updatedWorkout.workoutId,
        scheduledDate: scheduledDate
      });
      
      // STEP 3: If this is part of a program, update program progress
      if (updatedWorkout.programId) {
        // Get the active program for this user
        const activeProgram = await storage.getActiveUserProgram(userId);
        
        if (activeProgram && 
            activeProgram.userProgram.programId === updatedWorkout.programId && 
            activeProgram.userProgram.isActive) {
          
          console.log(`Processing workout completion for program day ${updatedWorkout.programDay}, current program day: ${activeProgram.userProgram.currentDay}`);
          
          // If this workout is for the current day or an earlier day, we can advance the program
          if (updatedWorkout.programDay === activeProgram.userProgram.currentDay) {
            // This is today's workout, advance to the next day
            const nextDay = activeProgram.userProgram.currentDay + 1;
            console.log(`Advancing program to day ${nextDay} of ${activeProgram.program.duration}`);
            
            // If it's the last day, mark the program as completed
            if (nextDay > activeProgram.program.duration) {
              console.log(`Program completed! Marking as inactive.`);
              await storage.updateUserProgramProgress(
                activeProgram.userProgram.id,
                { 
                  isActive: false,
                  completedAt: new Date()
                }
              );
            } else {
              // Otherwise advance to the next day
              console.log(`Advancing to day ${nextDay}`);
              await storage.updateUserProgramProgress(
                activeProgram.userProgram.id,
                { currentDay: nextDay }
              );
            }
          } else if (activeProgram.userProgram.currentDay !== null && updatedWorkout.programDay > activeProgram.userProgram.currentDay) {
            // This is a future workout, user is skipping ahead
            // Let's update progress to this day
            console.log(`User completed a future workout (day ${updatedWorkout.programDay}), updating current day.`);
            await storage.updateUserProgramProgress(
              activeProgram.userProgram.id,
              { currentDay: updatedWorkout.programDay }
            );
          } else {
            // This is a previous workout, just log its completion
            console.log(`User completed a previous workout (day ${updatedWorkout.programDay}), no change to current day ${activeProgram.userProgram.currentDay}.`);
          }
          
          // Log the progress update
          console.log(`Program progress updated for user ${userId}, program ${activeProgram.program.id}`);
        }
      }
      
      // Return the updated workout with completed workout info
      res.json({
        updatedWorkout,
        completedWorkout
      });
    } catch (error) {
      console.error('Error updating scheduled workout:', error);
      res.status(500).json({ message: 'Failed to update scheduled workout' });
    }
  });

  // Mount the API router
  app.use('/api', apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
