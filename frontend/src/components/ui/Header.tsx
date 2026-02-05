'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import Button from './Button';

const Header: React.FC = () => {
  const { state, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/40 backdrop-blur-xl border-b border-white/30 shadow-lg shadow-indigo-100/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-xl group-hover:shadow-indigo-500/30 transition-all duration-300 transform group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                  TodoFlow
                </span>
                <p className="text-xs text-indigo-600/60 -mt-1 ml-0.5">Streamline Your Productivity</p>
              </div>
            </Link>

            <nav className="hidden md:ml-16 md:flex md:space-x-2">
              {state.isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-indigo-50/50 hover:text-indigo-700 text-indigo-700/80 hover:scale-105"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => router.push('/chat')}
                    className="px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-indigo-50/50 hover:text-indigo-700 text-indigo-700/80 hover:scale-105 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                    <span className="sr-only">AI Chat</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-indigo-50/50 hover:text-indigo-700 text-indigo-700/80 hover:scale-105"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-indigo-50/50 hover:text-indigo-700 text-indigo-700/80 hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {state.isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block">

                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100/50 to-purple-100/50 flex items-center justify-center border-2 border-white/50 shadow-md backdrop-blur-sm">
                  <span className="text-sm font-semibold text-indigo-600">
                    Hi
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-indigo-700/80 hover:text-red-600 border-indigo-200/50 hover:bg-red-50/50 hover:shadow-md transition-all duration-200 bg-white/30 backdrop-blur-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="text-indigo-700/80 hover:text-indigo-700 border-indigo-200/50 hover:bg-indigo-50/50 hover:shadow-md transition-all duration-200 font-medium px-6 bg-white/30 backdrop-blur-sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    variant="default"
                    className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium px-6 transform hover:scale-105"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;