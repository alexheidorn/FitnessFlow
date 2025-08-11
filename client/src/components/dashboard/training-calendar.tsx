import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import PlannedActivityModal from "./planned-activity-modal";

interface Activity {
  id: string;
  name: string;
  type: string;
  startDate: string;
}

interface PlannedActivity {
  id: string;
  name: string;
  type: string;
  plannedDate: string;
}

interface TrainingCalendarProps {
  activities: Activity[];
  plannedActivities: PlannedActivity[];
}

export default function TrainingCalendar({ activities, plannedActivities }: TrainingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'run':
      case 'running':
        return 'bg-strava';
      case 'ride':
      case 'cycling':
        return 'bg-accent-blue';
      case 'swim':
      case 'swimming':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getActivitiesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    const dayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.startDate).toISOString().split('T')[0];
      return activityDate === dateString;
    });

    const dayPlannedActivities = plannedActivities.filter(planned => {
      const plannedDate = new Date(planned.plannedDate).toISOString().split('T')[0];
      return plannedDate === dateString;
    });

    return { activities: dayActivities, planned: dayPlannedActivities };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const monthDays = getMonthDays(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-charcoal">Training Calendar</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setSelectedDate(new Date());
                setIsModalOpen(true);
              }}
              className="bg-strava text-white hover:bg-strava/90"
            >
              <Plus className="h-4 w-4 mr-1" />
              Plan Activity
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h4 className="font-semibold text-charcoal">{monthName}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((date, index) => {
                if (!date) {
                  return <div key={index} className="aspect-square p-1"></div>;
                }

                const isToday = date.toDateString() === new Date().toDateString();
                const { activities: dayActivities, planned: dayPlanned } = getActivitiesForDate(date);
                const hasActivities = dayActivities.length > 0 || dayPlanned.length > 0;

                return (
                  <div
                    key={date.toISOString()}
                    className="aspect-square p-1 relative cursor-pointer hover:bg-gray-50 rounded"
                    onClick={() => handleDateClick(date)}
                  >
                    <div className={`text-xs text-center ${
                      isToday 
                        ? 'bg-strava text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' 
                        : ''
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    {hasActivities && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {dayActivities.slice(0, 2).map((activity, i) => (
                          <div
                            key={`activity-${i}`}
                            className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`}
                          />
                        ))}
                        {dayPlanned.slice(0, 2).map((planned, i) => (
                          <div
                            key={`planned-${i}`}
                            className="w-2 h-2 rounded-full bg-gray-300 border border-gray-400"
                          />
                        ))}
                        {(dayActivities.length + dayPlanned.length > 2) && (
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-strava rounded-full"></div>
                  <span className="text-gray-600">Running</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                  <span className="text-gray-600">Cycling</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Swimming</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full border border-gray-400"></div>
                  <span className="text-gray-600">Planned</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <PlannedActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </>
  );
}
