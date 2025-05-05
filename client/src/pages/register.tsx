import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Step 1 validation schema - Basic account info
const accountInfoSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Step 2 validation schema - Personal info
const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  gender: z.string().min(1, { message: 'Please select a gender' }),
  age: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: 'Please enter a valid age',
  }),
  fitnessLevel: z.string().min(1, { message: 'Please select your fitness level' }),
});

// Step 3 validation schema - Preferences
const preferencesSchema = z.object({
  fitnessGoals: z.string().min(3, { message: 'Please describe your fitness goals' }),
  preferredWorkoutDays: z.string().min(1, { message: 'Please select your preferred workout days' }),
  workoutReminders: z.boolean().optional(),
});

type AccountInfoFormValues = z.infer<typeof accountInfoSchema>;
type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state for all steps
  const [formData, setFormData] = useState<{
    accountInfo?: AccountInfoFormValues;
    personalInfo?: PersonalInfoFormValues;
    preferences?: PreferencesFormValues;
  }>({});

  // Step 1 form - Account info
  const accountInfoForm = useForm<AccountInfoFormValues>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Step 2 form - Personal info
  const personalInfoForm = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: '',
      age: '',
      fitnessLevel: '',
    },
  });

  // Step 3 form - Preferences
  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      fitnessGoals: '',
      preferredWorkoutDays: '',
      workoutReminders: true,
    },
  });

  // Submit handlers for each step
  const onSubmitAccountInfo = (data: AccountInfoFormValues) => {
    setFormData({ ...formData, accountInfo: data });
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  const onSubmitPersonalInfo = (data: PersonalInfoFormValues) => {
    setFormData({ ...formData, personalInfo: data });
    setCurrentStep(3);
    window.scrollTo(0, 0);
  };

  const onSubmitPreferences = (data: PreferencesFormValues) => {
    setFormData({ ...formData, preferences: data });
    
    // Combine all form data and submit
    const fullFormData = {
      ...formData.accountInfo,
      ...formData.personalInfo,
      ...data,
    };
    
    console.log('Registration data:', fullFormData);
    
    // In a real app, we would submit to an API here
    // For now, we'll just redirect to login after a short delay
    setTimeout(() => {
      setLocation('/login');
    }, 1000);
  };

  // Go back to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    } else {
      setLocation('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8f9fa]">
      {/* Left panel with image (visible on medium screens and up) */}
      <div 
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://source.unsplash.com/random/1200x1600/?fitness)' 
        }}
      />
      
      {/* Right panel with form */}
      <div className="flex-1 flex flex-col p-6 md:p-10 md:overflow-y-auto">
        {/* Top navigation */}
        <div className="mb-8">
          <button 
            onClick={goToPreviousStep}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>
        
        {/* Form container */}
        <div className="max-w-lg mx-auto w-full bg-white rounded-lg shadow-sm p-8 mb-8">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">
                {currentStep === 1 && 'Create your account'}
                {currentStep === 2 && 'Personal info'}
                {currentStep === 3 && 'Your preferences'}
              </h1>
              <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-black h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Step 1: Account Information */}
          {currentStep === 1 && (
            <>
              <Form {...accountInfoForm}>
                <form onSubmit={accountInfoForm.handleSubmit(onSubmitAccountInfo)} className="space-y-5">
                  <FormField
                    control={accountInfoForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={accountInfoForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
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
                          <Input placeholder="Create a strong password" type="password" {...field} />
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
                          <Input placeholder="Confirm your password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-black hover:bg-gray-800 mt-4"
                  >
                    Continue
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-sm text-gray-600">
                <p>
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </>
          )}
          
          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <>
              <Form {...personalInfoForm}>
                <form onSubmit={personalInfoForm.handleSubmit(onSubmitPersonalInfo)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={personalInfoForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your first name" {...field} />
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
                            <Input placeholder="Your last name" {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Input placeholder="Your age" type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={personalInfoForm.control}
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
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-black hover:bg-gray-800 mt-4"
                  >
                    Continue
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-sm text-gray-600">
                <p>
                  We collect this information to personalize your workout experience and provide
                  you with the most relevant content.
                </p>
              </div>
            </>
          )}
          
          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <>
              <Form {...preferencesForm}>
                <form onSubmit={preferencesForm.handleSubmit(onSubmitPreferences)} className="space-y-5">
                  <FormField
                    control={preferencesForm.control}
                    name="fitnessGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What are your fitness goals?</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Lose weight, build muscle, improve endurance" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={preferencesForm.control}
                    name="preferredWorkoutDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred workout days</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred days" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekdays">Weekdays</SelectItem>
                            <SelectItem value="weekends">Weekends</SelectItem>
                            <SelectItem value="everyday">Everyday</SelectItem>
                            <SelectItem value="custom">Custom schedule</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-black hover:bg-gray-800 mt-4"
                  >
                    Complete Registration
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-sm text-gray-600">
                <p>
                  You can always change your preferences later from your profile settings.
                  This helps us create a personalized workout plan for you.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}