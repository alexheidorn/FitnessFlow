import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertActivitySchema, insertPlannedActivitySchema, insertUserSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
  const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
  const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/strava/callback`;

  // Helper function to get current user from session
  async function getCurrentUser(req: any) {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionToken) return null;
    
    const session = await storage.getSession(sessionToken);
    if (!session) return null;
    
    return await storage.getUser(session.userId);
  }

  // Auth routes
  app.get("/api/auth/strava", (req, res) => {
    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
      return res.status(500).json({ 
        error: "Strava credentials not configured",
        message: "Please set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET environment variables"
      });
    }

    console.log('Strava redirect URI:', STRAVA_REDIRECT_URI);
    
    const authUrl = `https://www.strava.com/oauth/authorize?` +
      `client_id=${STRAVA_CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}&` +
      `approval_prompt=force&` +
      `scope=read,activity:read_all`;
    
    res.json({ authUrl, redirectUri: STRAVA_REDIRECT_URI });
  });

  // Handle Strava OAuth callback redirect
  app.get("/api/auth/strava/callback", async (req, res) => {
    try {
      const { code, error } = req.query;
      
      if (error) {
        return res.redirect(`/?error=${encodeURIComponent('Strava authorization failed')}`);
      }
      
      if (!code) {
        return res.redirect(`/?error=${encodeURIComponent('No authorization code received')}`);
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
        }),
      });
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        return res.redirect(`/?error=${encodeURIComponent('Failed to exchange code for token')}`);
      }

      // Check if user exists
      let user = await storage.getUserByStravaId(tokenData.athlete.id.toString());
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          username: tokenData.athlete.username || `strava_${tokenData.athlete.id}`,
          stravaId: tokenData.athlete.id.toString(),
          stravaAccessToken: tokenData.access_token,
          stravaRefreshToken: tokenData.refresh_token,
          stravaTokenExpiry: new Date(tokenData.expires_at * 1000),
          isStravaConnected: true,
        });
      } else {
        // Update existing user
        user = await storage.updateUser(user.id, {
          stravaAccessToken: tokenData.access_token,
          stravaRefreshToken: tokenData.refresh_token,
          stravaTokenExpiry: new Date(tokenData.expires_at * 1000),
          isStravaConnected: true,
        });
      }

      // Create session
      const sessionToken = randomUUID();
      await storage.createSession({
        userId: user!.id,
        sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Redirect to frontend with session token
      res.redirect(`/?token=${sessionToken}&success=true`);
    } catch (error) {
      console.error('Strava auth error:', error);
      res.redirect(`/?error=${encodeURIComponent('Authentication failed')}`);
    }
  });

  app.post("/api/auth/strava/callback", async (req, res) => {
    try {
      const { code } = req.body;
      
      // Exchange code for access token
      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
        }),
      });
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        return res.status(400).json({ message: "Failed to exchange code for token" });
      }

      // Check if user exists
      let user = await storage.getUserByStravaId(tokenData.athlete.id.toString());
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          username: tokenData.athlete.username || `strava_${tokenData.athlete.id}`,
          stravaId: tokenData.athlete.id.toString(),
          stravaAccessToken: tokenData.access_token,
          stravaRefreshToken: tokenData.refresh_token,
          stravaTokenExpiry: new Date(tokenData.expires_at * 1000),
          isStravaConnected: true,
        });
      } else {
        // Update existing user
        user = await storage.updateUser(user.id, {
          stravaAccessToken: tokenData.access_token,
          stravaRefreshToken: tokenData.refresh_token,
          stravaTokenExpiry: new Date(tokenData.expires_at * 1000),
          isStravaConnected: true,
        });
      }

      // Create session
      const sessionToken = randomUUID();
      await storage.createSession({
        userId: user!.id,
        sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      res.json({ 
        sessionToken,
        user: user
      });
    } catch (error) {
      console.error('Strava auth error:', error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.replace('Bearer ', '');
      if (sessionToken) {
        await storage.deleteSession(sessionToken);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Sync Strava activities
  app.post("/api/strava/sync", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user || !user.stravaAccessToken) {
        return res.status(401).json({ message: "Not authenticated or Strava not connected" });
      }

      // Fetch activities from Strava
      const activitiesResponse = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=50', {
        headers: {
          'Authorization': `Bearer ${user.stravaAccessToken}`,
        },
      });

      if (!activitiesResponse.ok) {
        return res.status(400).json({ message: "Failed to fetch Strava activities" });
      }

      const stravaActivities = await activitiesResponse.json();

      // Store activities
      const savedActivities = [];
      for (const stravaActivity of stravaActivities) {
        // Check if activity already exists
        const existingActivities = await storage.getActivities(user.id);
        const exists = existingActivities.some(a => a.stravaId === stravaActivity.id.toString());
        
        if (!exists) {
          const activity = await storage.createActivity({
            userId: user.id,
            name: stravaActivity.name,
            type: stravaActivity.type,
            distance: stravaActivity.distance,
            duration: stravaActivity.moving_time,
            elevationGain: stravaActivity.total_elevation_gain,
            averagePace: stravaActivity.average_speed ? 1000 / stravaActivity.average_speed : null,
            averageSpeed: stravaActivity.average_speed ? stravaActivity.average_speed * 3.6 : null,
            averageHeartRate: stravaActivity.average_heartrate,
            startDate: new Date(stravaActivity.start_date),
          });
          
          // Update with Strava-specific data
          await storage.updateActivity(activity.id, {
            stravaId: stravaActivity.id.toString(),
            isFromStrava: true,
          });
          
          savedActivities.push(activity);
        }
      }

      res.json({ 
        message: `Synced ${savedActivities.length} new activities`,
        activities: savedActivities 
      });
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({ message: "Sync failed" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const filters: any = {};
      if (req.query.type) filters.type = req.query.type;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
      if (req.query.minDistance) filters.minDistance = parseFloat(req.query.minDistance as string);
      if (req.query.maxDistance) filters.maxDistance = parseFloat(req.query.maxDistance as string);
      if (req.query.minDuration) filters.minDuration = parseInt(req.query.minDuration as string);
      if (req.query.maxDuration) filters.maxDuration = parseInt(req.query.maxDuration as string);

      const activities = await storage.getActivities(user.id, filters);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const validatedData = insertActivitySchema.parse({
        ...req.body,
        userId: user.id,
      });

      const activity = await storage.createActivity(validatedData);
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const activity = await storage.getActivity(req.params.id);
      if (!activity || activity.userId !== user.id) {
        return res.status(404).json({ message: "Activity not found" });
      }

      await storage.deleteActivity(req.params.id);
      res.json({ message: "Activity deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Planned activity routes
  app.get("/api/planned-activities", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const plannedActivities = await storage.getPlannedActivities(user.id);
      res.json(plannedActivities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch planned activities" });
    }
  });

  app.post("/api/planned-activities", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const validatedData = insertPlannedActivitySchema.parse({
        ...req.body,
        userId: user.id,
      });

      const plannedActivity = await storage.createPlannedActivity(validatedData);
      res.json(plannedActivity);
    } catch (error) {
      res.status(400).json({ message: "Invalid planned activity data" });
    }
  });

  app.put("/api/planned-activities/:id", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const plannedActivity = await storage.getPlannedActivity(req.params.id);
      if (!plannedActivity || plannedActivity.userId !== user.id) {
        return res.status(404).json({ message: "Planned activity not found" });
      }

      const updatedActivity = await storage.updatePlannedActivity(req.params.id, req.body);
      res.json(updatedActivity);
    } catch (error) {
      res.status(500).json({ message: "Failed to update planned activity" });
    }
  });

  app.delete("/api/planned-activities/:id", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const plannedActivity = await storage.getPlannedActivity(req.params.id);
      if (!plannedActivity || plannedActivity.userId !== user.id) {
        return res.status(404).json({ message: "Planned activity not found" });
      }

      await storage.deletePlannedActivity(req.params.id);
      res.json({ message: "Planned activity deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete planned activity" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const activities = await storage.getActivities(user.id);
      
      // Calculate stats
      const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0) / 1000; // Convert to km
      const totalActivities = activities.length;
      const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
      const totalElevation = activities.reduce((sum, a) => sum + (a.elevationGain || 0), 0);
      
      // Calculate average pace (in seconds per km)
      const runningActivities = activities.filter(a => a.type === 'Run' && a.averagePace);
      const avgPace = runningActivities.length > 0 
        ? runningActivities.reduce((sum, a) => sum + (a.averagePace || 0), 0) / runningActivities.length
        : 0;

      res.json({
        totalDistance,
        totalActivities,
        totalDuration,
        totalElevation,
        avgPace,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // User info route
  app.get("/api/user", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
