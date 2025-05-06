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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define profile form schema
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  gender: z.string().optional(),
  age: z.coerce.number().int().positive().optional(),
  fitnessLevel: z.string().optional(),
  fitnessGoals: z.string().optional(),
  preferredWorkoutDays: z.string().optional(),
  workoutReminders: z.boolean().optional(),
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
      firstName: "",
      lastName: "",
      gender: "",
      age: undefined,
      fitnessLevel: "",
      fitnessGoals: "",
      preferredWorkoutDays: "",
      workoutReminders: true,
    },
    values: {
      username: user?.username || "",
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      gender: user?.gender || "",
      age: user?.age || undefined,
      fitnessLevel: user?.fitnessLevel || "",
      fitnessGoals: user?.fitnessGoals || "",
      preferredWorkoutDays: user?.preferredWorkoutDays || "",
      workoutReminders: user?.workoutReminders || true,
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
        <TabsList className="grid grid-cols-6 w-full max-w-2xl mx-auto mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
          <TabsTrigger value="workout-history">History</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
        
        <TabsContent value="fitness" className="mt-6">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Fitness Profile</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="male" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Male
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="female" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Female
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="other" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Other
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Age" 
                            {...field}
                            onChange={(e) => {
                              // Handle empty input
                              const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="fitnessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your fitness level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This helps us suggest appropriate workouts.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fitnessGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness Goals</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your primary fitness goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weight_loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                          <SelectItem value="endurance">Endurance</SelectItem>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="flexibility">Flexibility</SelectItem>
                          <SelectItem value="general_fitness">General Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This helps us personalize your workout recommendations.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferredWorkoutDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Workout Days</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select how many days you want to work out" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-2">1-2 days per week</SelectItem>
                          <SelectItem value="3-4">3-4 days per week</SelectItem>
                          <SelectItem value="5-6">5-6 days per week</SelectItem>
                          <SelectItem value="everyday">Every day</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        We'll create a schedule based on your availability.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="workoutReminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Workout Reminders
                        </FormLabel>
                        <FormDescription>
                          Receive notifications for your scheduled workouts.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
            
            <div className="border-t mt-8 pt-6">
              <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
              <Button 
                variant="destructive"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="w-full md:w-auto"
              >
                {logoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing Out...
                  </>
                ) : (
                  "Sign Out"
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}