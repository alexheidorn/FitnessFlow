import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState, useMemo } from "react";

interface Activity {
  id: string;
  name: string;
  type: string;
  distance?: number;
  duration?: number;
  elevationGain?: number;
  averagePace?: number;
  averageSpeed?: number;
  startDate: string;
}

interface ActivityChartsProps {
  activities: Activity[];
}

export default function ActivityCharts({ activities }: ActivityChartsProps) {
  const [distanceView, setDistanceView] = useState<'weekly' | 'monthly'>('weekly');
  const [paceFilter, setPaceFilter] = useState<string>('all');

  const distanceData = useMemo(() => {
    if (!activities.length) return [];

    const groupedData = new Map();
    const now = new Date();
    const daysBack = distanceView === 'weekly' ? 35 : 180; // 5 weeks or 6 months
    
    activities
      .filter(a => {
        const activityDate = new Date(a.startDate);
        const daysDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= daysBack;
      })
      .forEach(activity => {
        const date = new Date(activity.startDate);
        const key = distanceView === 'weekly' 
          ? `Week ${Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7))}`
          : `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!groupedData.has(key)) {
          groupedData.set(key, { period: key, distance: 0 });
        }
        
        const current = groupedData.get(key);
        current.distance += (activity.distance || 0) / 1000; // Convert to km
      });

    return Array.from(groupedData.values()).sort((a, b) => a.period.localeCompare(b.period));
  }, [activities, distanceView]);

  const paceData = useMemo(() => {
    if (!activities.length) return [];

    const filteredActivities = activities.filter(a => {
      if (paceFilter === 'all') return a.averagePace;
      return a.type.toLowerCase() === paceFilter.toLowerCase() && a.averagePace;
    });

    return filteredActivities
      .slice(-10) // Last 10 activities
      .map((activity, index) => ({
        activity: `Activity ${index + 1}`,
        pace: activity.averagePace ? activity.averagePace / 60 : 0, // Convert to minutes per km
        name: activity.name,
        date: new Date(activity.startDate).toLocaleDateString(),
      }));
  }, [activities, paceFilter]);

  const elevationData = useMemo(() => {
    if (!activities.length) return [];

    const weeklyData = new Map();
    const now = new Date();
    
    activities
      .filter(a => {
        const activityDate = new Date(a.startDate);
        const daysDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 42; // Last 6 weeks
      })
      .forEach(activity => {
        const date = new Date(activity.startDate);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
        
        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, { week: weekKey, elevation: 0 });
        }
        
        const current = weeklyData.get(weekKey);
        current.elevation += activity.elevationGain || 0;
      });

    return Array.from(weeklyData.values()).sort((a, b) => a.week.localeCompare(b.week));
  }, [activities]);

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-charcoal">Distance Over Time</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={distanceView === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDistanceView('weekly')}
                  className={distanceView === 'weekly' ? 'bg-strava text-white' : ''}
                >
                  Weekly
                </Button>
                <Button
                  variant={distanceView === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDistanceView('monthly')}
                  className={distanceView === 'monthly' ? 'bg-strava text-white' : ''}
                >
                  Monthly
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={distanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)} km`, 'Distance']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="distance" 
                    stroke="hsl(15.5 100% 50.2%)" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(15.5 100% 50.2%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-charcoal">Average Pace Trends</CardTitle>
              <select 
                className="text-xs border rounded px-2 py-1"
                value={paceFilter}
                onChange={(e) => setPaceFilter(e.target.value)}
              >
                <option value="all">All Activities</option>
                <option value="run">Running</option>
                <option value="ride">Cycling</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="activity" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} min/km`, 'Pace']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return `${payload[0].payload.name} - ${payload[0].payload.date}`;
                      }
                      return label;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pace" 
                    stroke="hsl(209.6 100% 64.3%)" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(209.6 100% 64.3%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-charcoal">Weekly Elevation Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={elevationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${Math.round(value)} m`, 'Elevation Gain']}
                />
                <Bar 
                  dataKey="elevation" 
                  fill="hsl(147.1429 78.5047% 41.9608%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
