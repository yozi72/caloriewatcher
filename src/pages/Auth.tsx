
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/useAuth';

// Define the schemas for login and register
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

// TypeScript types for form data
type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  // Initialize the form with the zodResolver
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onLogin = async (data: LoginValues) => {
    setError(null);
    const { error: loginError } = await signIn(data.email, data.password);
    if (loginError) {
      setError(loginError.message);
    }
  };

  const onRegister = async (data: RegisterValues) => {
    setError(null);
    const { error: registerError } = await signUp(data.email, data.password, data.firstName, data.lastName);
    if (!registerError) {
      setIsLogin(true);
    } else {
      setError(registerError.message);
    }
  };

  const toggleAuthMode = () => {
    setError(null);
    setIsLogin(!isLogin);
  };

  return (
    <AuthLayout
      title={isLogin ? "Welcome back" : "Create an account"}
      subtitle={isLogin ? "Sign in to access your account" : "Register to get started"}
      error={error}
      footer={
        <p className="text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={toggleAuthMode}
            className="text-health-blue hover:underline font-medium"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      }
    >
      {isLogin ? (
        <LoginForm 
          onSubmit={onLogin} 
          loading={loading} 
        />
      ) : (
        <RegisterForm 
          onSubmit={onRegister}
          loading={loading}
        />
      )}
    </AuthLayout>
  );
};

export default Auth;
