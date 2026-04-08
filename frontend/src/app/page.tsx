'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LandingPage } from '@/components/edulens/LandingPage';
import { RoleSelection } from '@/components/edulens/RoleSelection';
import { Dashboard } from '@/components/edulens/Dashboard';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [roleSelected, setRoleSelected] = useState(false);

  useEffect(() => {
    setRoleSelected(localStorage.getItem('edulens-role-selected') === 'true');
  }, [user?.role]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → Landing page
  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  // Logged in but no role explicitly selected → Role selection
  if (!roleSelected) {
    return <RoleSelection />;
  }

  // Fully onboarded → Dashboard
  return <Dashboard />;
}
