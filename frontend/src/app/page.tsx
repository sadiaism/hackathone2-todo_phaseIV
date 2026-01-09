'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Header';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Todo App</h1>
            <p className="text-lg text-gray-600 mb-8">
              A simple and effective way to manage your tasks
            </p>
            <div className="space-x-4">
              <Link
                href="/auth/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-md transition duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;