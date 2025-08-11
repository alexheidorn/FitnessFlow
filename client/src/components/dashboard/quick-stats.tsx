import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Activity, Clock, Mountain } from "lucide-react";

interface QuickStatsProps {
  stats?: {
    totalDistance: number;
    totalActivities: number;
    totalDuration: number;
    totalElevation: number;
    avgPace: number;
  };
}

export default function QuickStats({ stats }: QuickStatsProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatPace = (paceInSeconds: number) => {
    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = Math.floor(paceInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
  };

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Distance</p>
              <p className="text-2xl font-bold text-charcoal">{stats.totalDistance.toFixed(1)} km</p>
              <p className="text-success-green text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                This month
              </p>
            </div>
            <div className="w-12 h-12 bg-strava/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-strava" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Activities</p>
              <p className="text-2xl font-bold text-charcoal">{stats.totalActivities}</p>
              <p className="text-success-green text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Total recorded
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-accent-blue" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Pace</p>
              <p className="text-2xl font-bold text-charcoal">
                {stats.avgPace > 0 ? formatPace(stats.avgPace) : "N/A"}
              </p>
              <p className="text-success-green text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Running activities
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Elevation</p>
              <p className="text-2xl font-bold text-charcoal">{Math.round(stats.totalElevation).toLocaleString()} m</p>
              <p className="text-success-green text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Total gained
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Mountain className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
