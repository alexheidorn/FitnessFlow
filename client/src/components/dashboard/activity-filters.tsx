import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface ActivityFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
}

export default function ActivityFilters({ filters, onFiltersChange }: ActivityFiltersProps) {
  const [localFilters, setLocalFilters] = useState({
    type: '',
    minDistance: '',
    maxDistance: '',
    minDuration: '',
    maxDuration: '',
    ...filters
  });

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    const cleanedFilters = Object.entries(localFilters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    onFiltersChange(cleanedFilters);
  };

  const clearFilters = () => {
    setLocalFilters({
      type: '',
      minDistance: '',
      maxDistance: '',
      minDuration: '',
      maxDuration: '',
    });
    onFiltersChange({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-charcoal">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Activity Type Filter */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2">Activity Type</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-activities"
                checked={localFilters.type === ''}
                onCheckedChange={(checked) => {
                  if (checked) handleFilterChange('type', '');
                }}
              />
              <Label htmlFor="all-activities" className="text-sm text-gray-600">All Activities</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="running"
                checked={localFilters.type === 'Run'}
                onCheckedChange={(checked) => {
                  if (checked) handleFilterChange('type', 'Run');
                }}
              />
              <Label htmlFor="running" className="text-sm text-gray-600">Running</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cycling"
                checked={localFilters.type === 'Ride'}
                onCheckedChange={(checked) => {
                  if (checked) handleFilterChange('type', 'Ride');
                }}
              />
              <Label htmlFor="cycling" className="text-sm text-gray-600">Cycling</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="swimming"
                checked={localFilters.type === 'Swim'}
                onCheckedChange={(checked) => {
                  if (checked) handleFilterChange('type', 'Swim');
                }}
              />
              <Label htmlFor="swimming" className="text-sm text-gray-600">Swimming</Label>
            </div>
          </div>
        </div>

        {/* Distance Range */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2">Distance Range (km)</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.minDistance}
              onChange={(e) => handleFilterChange('minDistance', e.target.value ? parseFloat(e.target.value) * 1000 : '')}
              className="w-20"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.maxDistance}
              onChange={(e) => handleFilterChange('maxDistance', e.target.value ? parseFloat(e.target.value) * 1000 : '')}
              className="w-20"
            />
          </div>
        </div>

        {/* Duration Range */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2">Duration (minutes)</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.minDuration}
              onChange={(e) => handleFilterChange('minDuration', e.target.value ? parseInt(e.target.value) * 60 : '')}
              className="w-20"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.maxDuration}
              onChange={(e) => handleFilterChange('maxDuration', e.target.value ? parseInt(e.target.value) * 60 : '')}
              className="w-20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={applyFilters}
            className="w-full bg-strava hover:bg-strava/90 text-white"
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
