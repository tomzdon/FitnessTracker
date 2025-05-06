import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import EmptyWorkoutHistory from '@/components/profile/EmptyWorkoutHistory';
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User as SelectUser } from "@shared/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Define profile form schema
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const [activeTab, setActiveTab] = useState('account');
  const { user, updateUserMutation, logoutMutation } = useAuth();
  
  // Setup form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      email: "",
    },
    values: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateUserMutation.mutate(data);
  }
  
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
      
      <ProfileHeader 
        user={user} 
        onEditProfile={() => setActiveTab('account')} 
      />
      
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
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your email address for communications.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={updateUserMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </Form>
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