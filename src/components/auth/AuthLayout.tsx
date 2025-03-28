
import React, { ReactNode } from 'react';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  error: string | null;
  children: ReactNode;
  footer: ReactNode;
};

export const AuthLayout = ({ title, subtitle, error, children, footer }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-subtle max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
          <p className="text-gray-500">{subtitle}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {children}

        <div className="text-center pt-4">
          {footer}
        </div>
      </div>
    </div>
  );
};
