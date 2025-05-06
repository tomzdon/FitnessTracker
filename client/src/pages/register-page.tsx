import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Redirect } from 'wouter';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, ArrowRight, Check, UserCircle2, Dumbbell, Heart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

// Define schemas for each step
const accountInfoSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

const personalInfoSchema = z.object({
  firstName: z.string().min(1, {
    message: 'First name is required.',
  }),
  lastName: z.string().min(1, {
    message: 'Last name is required.',
  }),
  gender: z.string().min(1, {
    message: 'Please select your gender.',
  }),
  age: z.coerce.number().int().positive({
    message: 'Please enter a valid age.',
  }),
});

const preferencesSchema = z.object({
  fitnessLevel: z.string().min(1, {
    message: 'Please select your fitness level.',
  }),
  fitnessGoals: z.string().min(1, {
    message: 'Please select your fitness goal.',
  }),
  preferredWorkoutDays: z.string().min(1, {
    message: 'Please select your preferred workout days.',
  }),
  workoutReminders: z.boolean().default(true),
});

type AccountInfoFormValues = z.infer<typeof accountInfoSchema>;
type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export default function RegisterPage() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [formData, setFormData] = useState<{
    accountInfo?: AccountInfoFormValues;
    personalInfo?: PersonalInfoFormValues;
    preferences?: PreferencesFormValues;
  }>({});
  
  const { user, registerMutation } = useAuth();
  
  // Setup forms for each step
  const accountForm = useForm<AccountInfoFormValues>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });
  
  const personalForm = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: '',
      age: undefined,
    },
  });
  
  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      fitnessLevel: '',
      fitnessGoals: '',
      preferredWorkoutDays: '',
      workoutReminders: true,
    },
  });
  
  const steps = [
    {
      id: 'account',
      name: 'Account',
      icon: <UserCircle2 className="h-5 w-5" />,
      description: 'Create your account',
    },
    {
      id: 'personal',
      name: 'Personal',
      icon: <Heart className="h-5 w-5" />,
      description: 'Your information',
    },
    {
      id: 'preferences',
      name: 'Preferences',
      icon: <Dumbbell className="h-5 w-5" />,
      description: 'Fitness preferences',
    },
  ];
  
  const onSubmitAccountInfo = (data: AccountInfoFormValues) => {
    setFormData((prev) => ({ ...prev, accountInfo: data }));
    setActiveStep(1);
  };
  
  const onSubmitPersonalInfo = (data: PersonalInfoFormValues) => {
    setFormData((prev) => ({ ...prev, personalInfo: data }));
    setActiveStep(2);
  };
  
  const onSubmitPreferences = (data: PreferencesFormValues) => {
    setFormData((prev) => ({ ...prev, preferences: data }));
    
    // Combine all data and register
    if (formData.accountInfo && formData.personalInfo) {
      registerMutation.mutate({
        ...formData.accountInfo,
        ...formData.personalInfo,
        ...data
      });
    }
  };
  
  // Handle redirect inside the render cycle, after all hooks have run
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Left side - registration form */}
      <div className="w-full lg:w-1/2 p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Join CGX.tv</h1>
            <p className="text-gray-500 mt-2">Create your account to start your fitness journey</p>
          </div>
          
          {/* Progress steps */}
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 
                    ${activeStep >= index 
                      ? 'bg-primary border-primary text-white' 
                      : 'border-gray-300 text-gray-500'}`}
                >
                  {activeStep > index ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="mt-2 text-xs font-medium">{step.name}</span>
              </div>
            ))}
          </div>
          
          <Tabs value={activeStep.toString()} className="w-full">
            {/* Step 1: Account Information */}
            <TabsContent value="0">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Create your login credentials</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...accountForm}>
                    <form onSubmit={accountForm.handleSubmit(onSubmitAccountInfo)} className="space-y-4">
                      <FormField
                        control={accountForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter a username" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your unique username for CGX.tv
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accountForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              We'll never share your email with anyone else
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accountForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 6 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => window.location.href = '/auth'}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                  </Button>
                  <Button onClick={accountForm.handleSubmit(onSubmitAccountInfo)}>
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Step 2: Personal Information */}
            <TabsContent value="1">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Tell us about yourself</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...personalForm}>
                    <form onSubmit={personalForm.handleSubmit(onSubmitPersonalInfo)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={personalForm.control}
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
                          control={personalForm.control}
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
                      
                      <FormField
                        control={personalForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-row space-x-4"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="male" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Male
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="female" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Female
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
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
                        control={personalForm.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Your age" 
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
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveStep(0)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={personalForm.handleSubmit(onSubmitPersonalInfo)}>
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Step 3: Fitness Preferences */}
            <TabsContent value="2">
              <Card>
                <CardHeader>
                  <CardTitle>Fitness Preferences</CardTitle>
                  <CardDescription>Customize your fitness journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...preferencesForm}>
                    <form onSubmit={preferencesForm.handleSubmit(onSubmitPreferences)} className="space-y-4">
                      <FormField
                        control={preferencesForm.control}
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
                              This helps us suggest appropriate workouts
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={preferencesForm.control}
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
                              This helps us personalize your workout recommendations
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={preferencesForm.control}
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
                              We'll create a schedule based on your availability
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={preferencesForm.control}
                        name="workoutReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Workout Reminders
                              </FormLabel>
                              <FormDescription>
                                Receive notifications for your scheduled workouts
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
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    onClick={preferencesForm.handleSubmit(onSubmitPreferences)}
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>Complete Registration</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right side - hero section */}
      <div className="hidden lg:block lg:w-1/2 bg-primary">
        <div className="h-full flex flex-col items-center justify-center text-white p-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to CGX.tv</h1>
          <p className="text-xl mb-8 text-center">
            Your personalized fitness journey starts here
          </p>
          <div className="max-w-md">
            <ul className="space-y-4">
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 mt-0.5" />
                <span>Access to premium workout videos and programs</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 mt-0.5" />
                <span>Track your progress and see real results</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 mt-0.5" />
                <span>Personalized workout recommendations</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 mt-0.5" />
                <span>Connect with a community of fitness enthusiasts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}