import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Settings, LogOut } from "lucide-react";
import { initiateStravaAuth, logout, isAuthenticated } from "@/lib/strava-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface HeaderProps {
  user?: any;
}

export default function Header({ user }: HeaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('sessionToken');
      const response = await fetch('/api/strava/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to sync');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Unable to sync with Strava",
        variant: "destructive",
      });
    }
  });

  const handleStravaConnect = async () => {
    try {
      const authUrl = await initiateStravaAuth();
      window.location.href = authUrl;
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Strava",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Unable to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-strava rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-charcoal">TrainingLog</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated() && user ? (
              <>
                {user.isStravaConnected ? (
                  <Badge variant="outline" className="bg-success-green/10 text-success-green border-success-green">
                    <div className="w-2 h-2 bg-success-green rounded-full mr-2"></div>
                    Strava Connected
                  </Badge>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleStravaConnect}
                    className="text-strava border-strava hover:bg-strava/10"
                  >
                    Connect Strava
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending || !user.isStravaConnected}
                  className="bg-strava text-white border-strava hover:bg-strava/90"
                >
                  {syncMutation.isPending ? "Syncing..." : "Sync Strava"}
                </Button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-charcoal">{user.username}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="p-2"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                onClick={handleStravaConnect}
                className="bg-strava text-white hover:bg-strava/90"
              >
                Connect with Strava
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
