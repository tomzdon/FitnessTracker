import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import EmptyWorkoutHistory from '@/components/profile/EmptyWorkoutHistory';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('workout-history');
  
  // Fetch user statistics
  const { data: statistics = { workouts: 0, streak: 0, progressTests: 0 } } = useQuery({
    queryKey: ['/api/statistics'],
  });
  
  // Fetch user completed workouts
  const { data: completedWorkouts = [] } = useQuery<any[]>({
    queryKey: ['/api/completedWorkouts'],
    queryFn: async () => {
      const response = await fetch('/api/completedWorkouts');
      if (!response.ok) {
        throw new Error('Failed to fetch completed workouts');
      }
      return response.json();
    }
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-8">Settings</h1>
      
      <ProfileHeader />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="workout-history">Workout History</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Notifications</TabsTrigger>
          <TabsTrigger value="more">More</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-6">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <p>Your account settings will appear here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="workout-history" className="mt-6">
          {completedWorkouts.length === 0 ? (
            <EmptyWorkoutHistory />
          ) : (
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Your Workout History</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Workout history items would go here */}
                <p>Workout history will appear here.</p>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="subscription" className="mt-6">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
            <p>Your subscription information will appear here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="privacy" className="mt-6">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Privacy & Notification Settings</h2>
            <p>Your privacy and notification settings will appear here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="more" className="mt-6">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Additional Settings</h2>
            <p>More settings will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}