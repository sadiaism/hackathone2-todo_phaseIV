'use client';

import React from 'react';
import { useAuth } from '../../lib/auth/auth-context';
import Card from '../ui/Card';

const UserProfile: React.FC = () => {
  const { state } = useAuth();

  if (!state.isAuthenticated || !state.currentUser) {
    return (
      <Card>
        <p className="text-center text-gray-500">Please log in to view your profile</p>
      </Card>
    );
  }

  const { currentUser } = state;

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">User Profile</h3>
      <div className="space-y-2">
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="text-gray-900">{currentUser.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Member Since</label>
          <p className="text-gray-900">{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    </Card>
  );
};

export default UserProfile;