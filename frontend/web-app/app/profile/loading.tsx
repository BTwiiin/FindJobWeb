"use client";

import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col md:flex-row fixed h-screen w-screen animate-pulse">
      {/* Left (Profile) Section */}
      <div className="flex-none md:w-1/3 p-4 overflow-y-auto hide-scrollbar pb-32 bg-white">
        <div className="flex flex-col items-center">
          {/* Avatar Placeholder */}
          <div className="rounded-full w-32 h-32 bg-gray-200 mb-4" />
          {/* Name Placeholder */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
          {/* Email Placeholder */}
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>

        {/* Profile Fields */}
        <div className="mt-6 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>

        {/* Edit Profile Button */}
        <div className="mt-8">
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>

        {/* Recent Job Requests List */}
        <div className="mt-8">
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
          <ul className="space-y-4">
            <li className="bg-gray-100 p-4 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </li>
            <li className="bg-gray-100 p-4 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </li>
          </ul>
        </div>
      </div>

      {/* Right (Calendar) Section */}
      <div className="flex-shrink md:w-2/3 flex flex-col overflow-hidden bg-white">
        {/* Calendar Placeholder */}
        <div className="flex-1 bg-gray-200" />
      </div>
    </div>
  );
}
