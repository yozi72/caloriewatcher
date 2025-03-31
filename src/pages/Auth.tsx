
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';

import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
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
  const { signIn, signUp, user } = useAuth();
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
    await signIn(data.email, data.password);
  };

  const onRegister = async (data: RegisterValues) => {
    await signUp(data.email, data.password, data.firstName, data.lastName);
    setIsLogin(true);
  };

  const toggleAuthMode = () => setIsLogin(!isLogin);

  return (
    <AuthLayout>
      {isLogin ? (
        <LoginForm form={loginForm} onLogin={onLogin} toggleAuthMode={toggleAuthMode} />
      ) : (
        <RegisterForm form={registerForm} onRegister={onRegister} toggleAuthMode={toggleAuthMode} />
      )}
    </AuthLayout>
  );
};

export default Auth;
