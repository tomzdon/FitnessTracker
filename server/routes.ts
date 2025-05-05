import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFavoriteSchema, insertWorkoutSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Get statistics
  apiRouter.get('/statistics', async (req: Request, res: Response) => {
    try {
      const statistics = await storage.getStatistics(1); // Hardcoded user ID for now
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  // Get favorites
  apiRouter.get('/favourites', async (req: Request, res: Response) => {
    try {
      const favorites = await storage.getFavorites(1); // Hardcoded user ID for now
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch favorites' });
    }
  });

  // Add favorite
  apiRouter.post('/favourites', async (req: Request, res: Response) => {
    try {
      const validatedData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Remove favorite
  apiRouter.delete('/favourites/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFavorite(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove favorite' });
    }
  });

  // Get workouts
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
      res.status(500).json({ message: 'Failed to fetch workouts' });
    }
  });
  
  // Get completed workouts
  apiRouter.get('/completedWorkouts', async (req: Request, res: Response) => {
    try {
      const completedWorkouts = await storage.getCompletedWorkouts(1); // Hardcoded user ID for now
      res.json(completedWorkouts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch completed workouts' });
    }
  });

  // Add workout
  apiRouter.post('/workouts', async (req: Request, res: Response) => {
    try {
      const validatedData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.addWorkout(validatedData);
      res.status(201).json(workout);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Mount the API router
  app.use('/api', apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
