
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  // Reset form errors when switching between login and register
  useEffect(() => {
    setFormError(null);
  }, [isLogin]);

  const handleLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setFormError(null);
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        setFormError(error.message);
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setFormError(error.message || "An unexpected error occurred");
    }
  };

  const handleRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setFormError(null);
    try {
      const { error } = await signUp(values.email, values.password, values.firstName, values.lastName);
      if (error) {
        setFormError(error.message);
      } else {
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Register error:", error);
      setFormError(error.message || "An unexpected error occurred");
    }
  };

  // Types to match the schema from the form components
  type loginSchema = {
    email: string;
    password: string;
  };

  type registerSchema = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
  };

  // Redirect to home if already logged in
  if (user && !loading) {
    return <Navigate to="/" />;
  }

  return (
    <AuthLayout
      title="HealthHub"
      subtitle={isLogin ? "Sign in to your account" : "Create your account"}
      error={formError}
      footer={
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-health-blue hover:underline"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      }
    >
      {isLogin ? (
        <LoginForm onSubmit={handleLoginSubmit} loading={loading} />
      ) : (
        <RegisterForm onSubmit={handleRegisterSubmit} loading={loading} />
      )}
    </AuthLayout>
  );
};

export default Auth;
