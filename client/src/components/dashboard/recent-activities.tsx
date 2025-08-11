import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Bike, Waves, Clock, MapPin, TrendingUp, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface ActivityData {
  id: string;
  name: string;
  type: string;
  distance?: number;
  duration?: number;
  elevationGain?: number;
  averagePace?: number;
  averageSpeed?: number;
  startDate: string;
  isFromStrava?: boolean;
}

interface RecentActivitiesProps {
  activities: ActivityData[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'run':
      case 'running':
        return <Activity className="h-6 w-6 text-strava" />;
      case 'ride':
      case 'cycling':
        return <Bike className="h-6 w-6 text-accent-blue" />;
      case 'swim':
      case 'swimming':
        return <Waves className="h-6 w-6 text-purple-600" />;
      default:
        return <Activity className="h-6 w-6 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'run':
      case 'running':
        return 'bg-strava/10';
      case 'ride':
      case 'cycling':
        return 'bg-accent-blue/10';
      case 'swim':
      case 'swimming':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatPace = (paceInSeconds: number) => {
    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = Math.floor(paceInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
  };

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const recentActivities = activities.slice(0, 10);

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-charcoal">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
            <p className="text-gray-600 mb-4">Connect with Strava or add your first activity to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-charcoal">Recent Activities</CardTitle>
          <Button variant="ghost" size="sm" className="text-strava hover:text-strava/80">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${getActivityColor(activity.type)} rounded-lg flex items-center justify-center`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-charcoal">{activity.name}</h4>
                      {activity.isFromStrava && (
                        <Badge variant="outline" className="text-xs text-strava border-strava">
                          Strava
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{formatDate(activity.startDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  {activity.distance && (
                    <div className="text-center">
                      <p className="text-gray-600">Distance</p>
                      <p className="font-semibold">{formatDistance(activity.distance)} km</p>
                    </div>
                  )}
                  {activity.duration && (
                    <div className="text-center">
                      <p className="text-gray-600">Duration</p>
                      <p className="font-semibold">{formatDuration(activity.duration)}</p>
                    </div>
                  )}
                  {activity.averagePace && activity.type.toLowerCase() === 'run' ? (
                    <div className="text-center">
                      <p className="text-gray-600">Pace</p>
                      <p className="font-semibold">{formatPace(activity.averagePace)}</p>
                    </div>
                  ) : activity.averageSpeed ? (
                    <div className="text-center">
                      <p className="text-gray-600">Speed</p>
                      <p className="font-semibold">{activity.averageSpeed.toFixed(1)} km/h</p>
                    </div>
                  ) : null}
                  <Button variant="ghost" size="sm" className="p-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
