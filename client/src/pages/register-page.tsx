import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Step 1: Account Information
const accountInfoSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Step 2: Personal Information
const personalInfoSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  gender: z.string().min(1, { message: "Please select your gender" }),
  age: z.coerce.number().int().min(16, { message: "You must be at least 16 years old" }),
});

// Step 3: Fitness Preferences
const preferencesSchema = z.object({
  fitnessLevel: z.string().min(1, { message: "Please select your fitness level" }),
  fitnessGoals: z.string().min(1, { message: "Please select your fitness goals" }),
  preferredWorkoutDays: z.string().min(1, { message: "Please select your preferred workout days" }),
  workoutReminders: z.boolean().default(true),
});

type AccountInfoFormValues = z.infer<typeof accountInfoSchema>;
type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export default function RegisterPage() {
  const { user, registerMutation } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<{
    accountInfo?: AccountInfoFormValues;
    personalInfo?: PersonalInfoFormValues;
    preferences?: PreferencesFormValues;
  }>({});

  // If user is already logged in, redirect to home page
  if (user) {
    return <Redirect to="/" />;
  }

  // Account Info form
  const accountInfoForm = useForm<AccountInfoFormValues>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Personal Info form
  const personalInfoForm = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "",
      age: undefined,
    },
  });

  // Preferences form
  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      fitnessLevel: "",
      fitnessGoals: "",
      preferredWorkoutDays: "",
      workoutReminders: true,
    },
  });

  // Step 1 submission
  const onSubmitAccountInfo = (data: AccountInfoFormValues) => {
    setFormData({ ...formData, accountInfo: data });
    setStep(2);
  };

  // Step 2 submission
  const onSubmitPersonalInfo = (data: PersonalInfoFormValues) => {
    setFormData({ ...formData, personalInfo: data });
    setStep(3);
  };

  // Step 3 submission - final step
  const onSubmitPreferences = (data: PreferencesFormValues) => {
    const completeFormData = {
      ...formData,
      preferences: data
    };
    setFormData(completeFormData);
    
    // Combine all form data and submit
    if (completeFormData.accountInfo && completeFormData.personalInfo && completeFormData.preferences) {
      const { confirmPassword, ...accountData } = completeFormData.accountInfo;
      const registrationData = {
        ...accountData,
        ...completeFormData.personalInfo,
        ...completeFormData.preferences
      };
      
      registerMutation.mutate(registrationData);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create Your Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join the CGX Fitness community and start your fitness journey today.
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between">
              <div className="text-sm font-medium">Account</div>
              <div className="text-sm font-medium">Personal</div>
              <div className="text-sm font-medium">Preferences</div>
            </div>
            <div className="relative mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-primary transition-all duration-300" 
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Step 1: Account Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Create your login credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...accountInfoForm}>
                  <form onSubmit={accountInfoForm.handleSubmit(onSubmitAccountInfo)} className="space-y-4">
                    <FormField
                      control={accountInfoForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountInfoForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="example@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountInfoForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountInfoForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between pt-2">
                      <Link href="/auth">
                        <Button type="button" variant="outline">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Login
                        </Button>
                      </Link>
                      <Button type="submit">
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Personal Information */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Tell us a bit about yourself
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...personalInfoForm}>
                  <form onSubmit={personalInfoForm.handleSubmit(onSubmitPersonalInfo)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={personalInfoForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={personalInfoForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={personalInfoForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="male" />
                                </FormControl>
                                <FormLabel className="font-normal">Male</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="female" />
                                </FormControl>
                                <FormLabel className="font-normal">Female</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">Other</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalInfoForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="25" 
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between pt-2">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button type="submit">
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Fitness Preferences */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Fitness Preferences</CardTitle>
                <CardDescription>
                  Customize your fitness experience
                </CardDescription>
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
                                <SelectValue placeholder="Select your primary goal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weight-loss">Weight Loss</SelectItem>
                              <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                              <SelectItem value="endurance">Endurance</SelectItem>
                              <SelectItem value="strength">Strength</SelectItem>
                              <SelectItem value="flexibility">Flexibility</SelectItem>
                              <SelectItem value="general-fitness">General Fitness</SelectItem>
                            </SelectContent>
                          </Select>
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
                                <SelectValue placeholder="Select your preferred schedule" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekdays">Weekdays</SelectItem>
                              <SelectItem value="weekends">Weekends</SelectItem>
                              <SelectItem value="3-days">3 days a week</SelectItem>
                              <SelectItem value="5-days">5 days a week</SelectItem>
                              <SelectItem value="everyday">Every day</SelectItem>
                            </SelectContent>
                          </Select>
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
                            <FormLabel className="text-base">Workout Reminders</FormLabel>
                            <FormDescription>
                              Receive reminders for your scheduled workouts
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
                    <div className="flex justify-between pt-2">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button 
                        type="submit"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating account...
                          </>
                        ) : "Complete Registration"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Hero section */}
      <div className="relative hidden flex-1 w-0 lg:block bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-8 py-6 text-white">
            <h2 className="text-3xl font-bold mb-4">Join the CGX Fitness Family</h2>
            <p className="text-lg mb-6">
              Create your profile to unlock personalized workouts, track your progress, and connect with a community of fitness enthusiasts.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="mr-2">✓</span> Personalized workout plans
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Progress tracking & analytics
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Expert-designed fitness programs
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Community challenges & support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}