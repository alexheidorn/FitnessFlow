import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  stravaId: text("strava_id").unique(),
  stravaAccessToken: text("strava_access_token"),
  stravaRefreshToken: text("strava_refresh_token"),
  stravaTokenExpiry: timestamp("strava_token_expiry"),
  isStravaConnected: boolean("is_strava_connected").default(false),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  stravaId: text("strava_id"),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'Run', 'Ride', 'Swim', etc.
  distance: real("distance"), // in meters
  duration: integer("duration"), // in seconds
  elevationGain: real("elevation_gain"), // in meters
  averagePace: real("average_pace"), // in seconds per km
  averageSpeed: real("average_speed"), // in km/h
  averageHeartRate: integer("average_heart_rate"),
  startDate: timestamp("start_date").notNull(),
  isFromStrava: boolean("is_from_strava").default(false),
});

export const plannedActivities = pgTable("planned_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  plannedDate: timestamp("planned_date").notNull(),
  plannedDistance: real("planned_distance"), // in meters
  plannedDuration: integer("planned_duration"), // in seconds
  notes: text("notes"),
  isCompleted: boolean("is_completed").default(false),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  stravaId: true,
  isFromStrava: true,
});

export const insertPlannedActivitySchema = createInsertSchema(plannedActivities).omit({
  id: true,
  isCompleted: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertPlannedActivity = z.infer<typeof insertPlannedActivitySchema>;
export type PlannedActivity = typeof plannedActivities.$inferSelect;

export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
