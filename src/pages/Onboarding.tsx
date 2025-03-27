
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const onboardingSchema = z.object({
  age: z.number().min(18, { message: "Must be at least 18 years old" }).max(120),
  gender: z.enum(["male", "female", "other"]),
  height: z.number().min(100, { message: "Height must be at least 100 cm" }).max(250),
  weight: z.number().min(30, { message: "Weight must be at least 30 kg" }).max(300),
  weightGoal: z.number().min(30, { message: "Weight goal must be at least 30 kg" }).max(300),
  exerciseFrequency: z.number().min(0).max(7),
  preferredWorkouts: z.string().array().optional(),
  dailyCalorieGoal: z.number().min(1000).max(5000),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

const Onboarding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      age: 30,
      gender: "male",
      height: 170,
      weight: 70,
      weightGoal: 70,
      exerciseFrequency: 3,
      preferredWorkouts: [],
      dailyCalorieGoal: 2000,
    },
  });

  const onSubmit = async (values: OnboardingForm) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You need to be logged in to complete onboarding",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          age: values.age,
          gender: values.gender,
          height: values.height,
          weight: values.weight,
          weight_goal: values.weightGoal,
          exercise_frequency: values.exerciseFrequency,
          preferred_workouts: values.preferredWorkouts,
          daily_calorie_goal: values.dailyCalorieGoal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your health profile has been saved successfully",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  // Redirect if not logged in
  if (!user && !loading) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-subtle p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-gray-500 mt-2">Help us personalize your experience</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weightGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Goal (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="exerciseFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Frequency (days per week): {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      defaultValue={[field.value]}
                      max={7}
                      step={1}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dailyCalorieGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Calorie Goal</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-health-blue">
              Save Profile
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Onboarding;
