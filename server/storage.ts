import { type User, type InsertUser, type Activity, type InsertActivity, type PlannedActivity, type InsertPlannedActivity, type UserSession, type InsertUserSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByStravaId(stravaId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Activity operations
  getActivities(userId: string, filters?: ActivityFilters): Promise<Activity[]>;
  getActivity(id: string): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: string, updates: Partial<Activity>): Promise<Activity | undefined>;
  deleteActivity(id: string): Promise<boolean>;

  // Planned activity operations
  getPlannedActivities(userId: string): Promise<PlannedActivity[]>;
  getPlannedActivity(id: string): Promise<PlannedActivity | undefined>;
  createPlannedActivity(activity: InsertPlannedActivity): Promise<PlannedActivity>;
  updatePlannedActivity(id: string, updates: Partial<PlannedActivity>): Promise<PlannedActivity | undefined>;
  deletePlannedActivity(id: string): Promise<boolean>;

  // Session operations
  createSession(session: InsertUserSession): Promise<UserSession>;
  getSession(sessionToken: string): Promise<UserSession | undefined>;
  deleteSession(sessionToken: string): Promise<boolean>;
  deleteUserSessions(userId: string): Promise<void>;
}

export interface ActivityFilters {
  type?: string;
  startDate?: Date;
  endDate?: Date;
  minDistance?: number;
  maxDistance?: number;
  minDuration?: number;
  maxDuration?: number;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private activities: Map<string, Activity>;
  private plannedActivities: Map<string, PlannedActivity>;
  private sessions: Map<string, UserSession>;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.plannedActivities = new Map();
    this.sessions = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByStravaId(stravaId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.stravaId === stravaId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      stravaId: insertUser.stravaId || null,
      stravaAccessToken: insertUser.stravaAccessToken || null,
      stravaRefreshToken: insertUser.stravaRefreshToken || null,
      stravaTokenExpiry: insertUser.stravaTokenExpiry || null,
      isStravaConnected: insertUser.isStravaConnected || false
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Activity operations
  async getActivities(userId: string, filters?: ActivityFilters): Promise<Activity[]> {
    let activities = Array.from(this.activities.values()).filter(
      (activity) => activity.userId === userId
    );

    if (filters) {
      if (filters.type) {
        activities = activities.filter(a => a.type === filters.type);
      }
      if (filters.startDate) {
        activities = activities.filter(a => new Date(a.startDate) >= filters.startDate!);
      }
      if (filters.endDate) {
        activities = activities.filter(a => new Date(a.startDate) <= filters.endDate!);
      }
      if (filters.minDistance !== undefined) {
        activities = activities.filter(a => (a.distance || 0) >= filters.minDistance!);
      }
      if (filters.maxDistance !== undefined) {
        activities = activities.filter(a => (a.distance || 0) <= filters.maxDistance!);
      }
      if (filters.minDuration !== undefined) {
        activities = activities.filter(a => (a.duration || 0) >= filters.minDuration!);
      }
      if (filters.maxDuration !== undefined) {
        activities = activities.filter(a => (a.duration || 0) <= filters.maxDuration!);
      }
    }

    return activities.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  async getActivity(id: string): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = { 
      ...insertActivity, 
      id,
      stravaId: null,
      isFromStrava: false,
      distance: insertActivity.distance || null,
      duration: insertActivity.duration || null,
      elevationGain: insertActivity.elevationGain || null,
      averagePace: insertActivity.averagePace || null,
      averageSpeed: insertActivity.averageSpeed || null,
      averageHeartRate: insertActivity.averageHeartRate || null
    };
    this.activities.set(id, activity);
    return activity;
  }

  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;
    
    const updatedActivity = { ...activity, ...updates };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteActivity(id: string): Promise<boolean> {
    return this.activities.delete(id);
  }

  // Planned activity operations
  async getPlannedActivities(userId: string): Promise<PlannedActivity[]> {
    return Array.from(this.plannedActivities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());
  }

  async getPlannedActivity(id: string): Promise<PlannedActivity | undefined> {
    return this.plannedActivities.get(id);
  }

  async createPlannedActivity(insertPlannedActivity: InsertPlannedActivity): Promise<PlannedActivity> {
    const id = randomUUID();
    const plannedActivity: PlannedActivity = { 
      ...insertPlannedActivity, 
      id,
      isCompleted: false,
      plannedDistance: insertPlannedActivity.plannedDistance || null,
      plannedDuration: insertPlannedActivity.plannedDuration || null,
      notes: insertPlannedActivity.notes || null
    };
    this.plannedActivities.set(id, plannedActivity);
    return plannedActivity;
  }

  async updatePlannedActivity(id: string, updates: Partial<PlannedActivity>): Promise<PlannedActivity | undefined> {
    const plannedActivity = this.plannedActivities.get(id);
    if (!plannedActivity) return undefined;
    
    const updatedPlannedActivity = { ...plannedActivity, ...updates };
    this.plannedActivities.set(id, updatedPlannedActivity);
    return updatedPlannedActivity;
  }

  async deletePlannedActivity(id: string): Promise<boolean> {
    return this.plannedActivities.delete(id);
  }

  // Session operations
  async createSession(insertSession: InsertUserSession): Promise<UserSession> {
    const id = randomUUID();
    const session: UserSession = { ...insertSession, id };
    this.sessions.set(session.sessionToken, session);
    return session;
  }

  async getSession(sessionToken: string): Promise<UserSession | undefined> {
    const session = this.sessions.get(sessionToken);
    if (!session) return undefined;
    
    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      this.sessions.delete(sessionToken);
      return undefined;
    }
    
    return session;
  }

  async deleteSession(sessionToken: string): Promise<boolean> {
    return this.sessions.delete(sessionToken);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    Array.from(this.sessions.entries()).forEach(([token, session]) => {
      if (session.userId === userId) {
        this.sessions.delete(token);
      }
    });
  }
}

export const storage = new MemStorage();
