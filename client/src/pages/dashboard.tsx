import { useQuery } from "@tanstack/react-query";
import Header from "@/components/navigation/header";
import QuickStats from "@/components/dashboard/quick-stats";
import ActivityCharts from "@/components/dashboard/activity-charts";
import RecentActivities from "@/components/dashboard/recent-activities";
import TrainingCalendar from "@/components/dashboard/training-calendar";
import ActivityFilters from "@/components/dashboard/activity-filters";
import GoalsWidget from "@/components/dashboard/goals-widget";
import { isAuthenticated, getSessionToken } from "@/lib/strava-auth";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [filters, setFilters] = useState({});
  
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    enabled: isAuthenticated(),
    queryFn: async () => {
      const token = getSessionToken();
      const response = await fetch("/api/user", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    }
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["/api/activities", filters],
    enabled: isAuthenticated(),
    queryFn: async () => {
      const token = getSessionToken();
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      
      const response = await fetch(`/api/activities?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    }
  });

  const { data: plannedActivities = [] } = useQuery({
    queryKey: ["/api/planned-activities"],
    enabled: isAuthenticated(),
    queryFn: async () => {
      const token = getSessionToken();
      const response = await fetch("/api/planned-activities", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch planned activities');
      return response.json();
    }
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated(),
    queryFn: async () => {
      const token = getSessionToken();
      const response = await fetch("/api/stats", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  return (
    <div className="min-h-screen bg-light-grey">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-charcoal">Training Dashboard</h2>
              <p className="text-gray-600 mt-1">Track your progress and plan ahead</p>
            </div>
          </div>

          <QuickStats stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <ActivityCharts activities={activities} />
            <RecentActivities activities={activities} />
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <TrainingCalendar 
              activities={activities} 
              plannedActivities={plannedActivities} 
            />
            <ActivityFilters filters={filters} onFiltersChange={setFilters} />
            <GoalsWidget stats={stats} />
          </div>
        </div>
      </main>
    </div>
  );
}
