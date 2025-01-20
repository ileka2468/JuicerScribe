import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Welcome to</span>
            <span className="block text-indigo-600 dark:text-indigo-400">JuicerScribe</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Earn money by transcribing xQc's content. Join our community of transcribers and help make content more accessible.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Earn Money</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Get paid for every minute of content you transcribe accurately.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Flexible Schedule</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Work whenever you want. Claim videos and transcribe at your own pace.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Join Community</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Be part of a growing community of transcribers and earn rewards.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Make a Difference</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Your transcriptions help train AI models to provide real-time subtitles for deaf viewers during xQc's live streams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}