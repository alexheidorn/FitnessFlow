import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GoalsWidgetProps {
  stats?: {
    totalDistance: number;
    totalActivities: number;
    totalElevation: number;
  };
}

export default function GoalsWidget({ stats }: GoalsWidgetProps) {
  // Monthly goals (these could be user-configurable in a real app)
  const goals = {
    distance: 1000, // km
    activities: 50,
    elevation: 15000, // meters
  };

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-charcoal">Monthly Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const distanceProgress = Math.min((stats.totalDistance / goals.distance) * 100, 100);
  const activitiesProgress = Math.min((stats.totalActivities / goals.activities) * 100, 100);
  const elevationProgress = Math.min((stats.totalElevation / goals.elevation) * 100, 100);

  const distanceRemaining = Math.max(goals.distance - stats.totalDistance, 0);
  const activitiesRemaining = Math.max(goals.activities - stats.totalActivities, 0);
  const elevationRemaining = Math.max(goals.elevation - stats.totalElevation, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-charcoal">Monthly Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Distance Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Distance</span>
            <span className="text-sm text-gray-600">
              {stats.totalDistance.toFixed(0)} / {goals.distance} km
            </span>
          </div>
          <Progress value={distanceProgress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {distanceRemaining > 0 ? `${distanceRemaining.toFixed(0)} km to goal` : 'Goal achieved! 🎉'}
          </p>
        </div>

        {/* Activities Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Activities</span>
            <span className="text-sm text-gray-600">
              {stats.totalActivities} / {goals.activities}
            </span>
          </div>
          <Progress value={activitiesProgress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {activitiesRemaining > 0 ? `${activitiesRemaining} activities to goal` : 'Goal achieved! 🎉'}
          </p>
        </div>

        {/* Elevation Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Elevation</span>
            <span className="text-sm text-gray-600">
              {Math.round(stats.totalElevation).toLocaleString()} / {goals.elevation.toLocaleString()} m
            </span>
          </div>
          <Progress value={elevationProgress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {elevationRemaining > 0 ? `${Math.round(elevationRemaining).toLocaleString()} m to goal` : 'Goal achieved! 🎉'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
