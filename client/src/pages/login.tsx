import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useLocation } from 'wouter';

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
import { Separator } from '@/components/ui/separator';

// Validation schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would call an authentication API
      console.log('Login data:', data);
      
      // Simulate successful login after short delay
      setTimeout(() => {
        setIsLoading(false);
        setLocation('/'); // Redirect to home page after login
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* Back button */}
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={() => setLocation('/')}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>
      
      {/* Login content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-6">Log in</h1>
          
          {/* Info banner */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              Welcome back! Log in to access your personalized workout programs, 
              track your progress, and continue your fitness journey.
            </p>
          </div>
          
          {/* Login form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        type="email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter your password" 
                          type={showPassword ? 'text' : 'password'} 
                          {...field} 
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-right">
                <a href="#" className="text-sm text-gray-600 hover:text-black">
                  Forgot password?
                </a>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-gray-800" 
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>
            </form>
          </Form>
          
          {/* Social login divider */}
          <div className="flex items-center my-6">
            <Separator className="flex-grow" />
            <span className="px-3 text-sm text-gray-500">OR</span>
            <Separator className="flex-grow" />
          </div>
          
          {/* Social login buttons */}
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full border-gray-300"
              type="button"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12s5.374 12 12 12c6.627 0 12-5.373 12-12s-5.373-12-12-12zm6.001 14.274c.055.925-.069 1.85-.365 2.731-.085.252-.246.476-.462.605-.216.129-.466.169-.708.105-.694-.208-1.387-.448-2.093-.633-.656-.172-1.322-.339-1.994-.454-1.526-.281-3.062-.202-4.58.109-.621.127-1.229.303-1.844.452-.644.154-1.285.327-1.933.461-.212.046-.443.013-.641-.084-.197-.097-.349-.26-.446-.451-.262-.526-.357-1.112-.271-1.689.075-.501.219-1.064.506-1.476.261-.377.628-.658 1.028-.875.618-.336 1.285-.57 1.967-.775.879-.292 1.76-.566 2.724-.576 1.066-.013 2.096.044 3.131.312.845.217 1.615.636 2.398.978.301.13.591.295.871.481.581.383.941.903 1.134 1.539.11.366.175.741.178 1.12zm-11.101-6.605c-.244.505-.299 1.089-.229 1.638.059.469.229.918.473 1.321.244.398.553.739.915 1.007.752.55 1.746.736 2.646.541.374-.081.73-.238 1.053-.446.613-.39 1.083-.95 1.317-1.657.169-.51.217-1.075.115-1.604-.106-.557-.363-1.075-.724-1.508-.085-.102-.184-.191-.273-.286.222.006.443.046.653.139.213.098.406.236.59.379.394.298.708.669.963 1.077.265.434.446.91.53 1.4.107.62.082 1.275-.086 1.881-.248.899-.728 1.684-1.418 2.28-.691.597-1.601.901-2.513.95-1.004.041-2.003-.154-2.9-.592-.893-.432-1.702-1.077-2.257-1.942-.548-.857-.83-1.871-.823-2.879.008-.732.161-1.464.443-2.137.291-.687.727-1.303 1.294-1.8.548-.481 1.196-.845 1.893-1.041.726-.202 1.494-.225 2.23-.078.723.156 1.623.555 2.136 1.124.319.351.577.749.775 1.174.189.39.326.8.422 1.222.021.111.04.222.055.333-.519-.204-1.082-.252-1.621-.159-.544.094-1.052.352-1.482.71-.621.52-1.045 1.235-1.192 2.007zm-1.9 10.831c.813.161 1.654.234 2.475.093.55-.095 1.091-.295 1.587-.539.491-.244.961-.537 1.472-.751.483-.202.999-.352 1.522-.401.511-.031 1.028.049 1.516.175.275.07.543.162.805.265.292.115.593.221.851.385.356.225.627.56.788.956.214.528.253 1.096.165 1.65-.089.552-.293 1.082-.628 1.513-.309.396-.706.718-1.15.94-.438.217-.912.356-1.394.433-.903.141-1.831.113-2.739.022-1.317-.135-2.627-.405-3.896-.82-.503-.163-.997-.35-1.468-.592-.418-.21-.809-.479-1.115-.82-.279-.304-.465-.675-.577-1.067-.112-.392-.147-.805-.115-1.212.061-.665.346-1.329.868-1.75.617-.495 1.416-.71 2.175-.837.286-.034.575-.076.858-.143zm10-4h-6v-2h6v2z"
                  fill="currentColor"
                />
              </svg>
              Continue with Apple
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-gray-300" 
              type="button"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.917 16.083c-2.258 0-4.083-1.825-4.083-4.083s1.825-4.083 4.083-4.083c1.103 0 2.024.402 2.735 1.067l-1.107 1.068c-.304-.292-.834-.63-1.628-.63-1.394 0-2.531 1.155-2.531 2.579 0 1.424 1.138 2.579 2.531 2.579 1.616 0 2.224-1.162 2.316-1.762h-2.316v-1.4h3.855c.036.204.064.408.064.677.001 2.332-1.563 3.988-3.919 3.988zm9.917-3.5h-1.75v1.75h-1.167v-1.75h-1.75v-1.166h1.75v-1.75h1.167v1.75h1.75v1.166z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
          
          {/* Sign up link */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register">
                <span className="text-black font-medium hover:underline cursor-pointer">Sign up</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}