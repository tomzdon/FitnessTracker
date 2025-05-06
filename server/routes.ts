import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFavoriteSchema, insertWorkoutSchema, insertProgramSchema, insertProgramWorkoutSchema } from "@shared/schema";
import { setupAuth } from "./auth";

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

  // Remove favorite
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

  // Mount the API router
  app.use('/api', apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
