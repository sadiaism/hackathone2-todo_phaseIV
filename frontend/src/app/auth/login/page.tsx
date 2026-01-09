'use client';

import React from 'react';
import LoginForm from '../../../components/auth/LoginForm';
import Header from '../../../components/ui/Header';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;