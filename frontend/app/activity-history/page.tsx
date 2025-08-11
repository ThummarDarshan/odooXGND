"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, LogIn, Edit3 } from 'lucide-react';
import { Navigation } from '@/components/navigation';

interface Activity {
  id: number;
  title: string;
  message: string;
  created_at: string;
  type: string;
  priority?: string;
  is_read?: boolean;
}

interface UserInfo {
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
}

const ActivityHistoryPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [notifRes, userRes] = await Promise.all([
          api.get('/notifications?limit=10'),
          api.get('/auth/me'),
        ]);
        setActivities(notifRes.notifications || []);
        setUserInfo(userRes.user || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load activity history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Find last login notification
  const lastLogin = activities.find(a => a.title.toLowerCase().includes('last login'));
  // Find only the latest profile update log
  const profileUpdate = activities.find(a => a.title.toLowerCase().includes('profile update'));
  // Only show latest 5 logs (excluding last login and profile update)
  const latestLogs = activities
    .filter(a => !a.title.toLowerCase().includes('last login') && !a.title.toLowerCase().includes('profile update'))
    .slice(0, 5);

  return (
    <>
      <Navigation />
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <User className="w-5 h-5 text-blue-600" />
              Account Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {userInfo && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-muted-foreground">
                <span><b>Name:</b> {userInfo.first_name} {userInfo.last_name}</span>
                <span className="hidden sm:inline">|</span>
                <span><b>Email:</b> {userInfo.email}</span>
                <span className="hidden sm:inline">|</span>
                <span><b>Account Created:</b> {new Date(userInfo.created_at).toLocaleString()}</span>
              </div>
            )}
            {lastLogin && (
              <div className="flex items-center gap-2 text-xs mt-2">
                <LogIn className="w-4 h-4 text-green-600" />
                <span>Last Login: {new Date(lastLogin.created_at).toLocaleString()}</span>
              </div>
            )}
            {profileUpdate && (
              <div className="flex items-center gap-2 text-xs mt-2">
                <Edit3 className="w-4 h-4 text-yellow-600" />
                <span>Profile Updated: {new Date(profileUpdate.created_at).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Clock className="w-5 h-5 text-purple-600" />
              Recent Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : latestLogs.length === 0 ? (
              <div className="text-center text-gray-500">No recent activity found.</div>
            ) : (
              <ul className="divide-y divide-border">
                {latestLogs.map((activity) => (
                  <li key={activity.id} className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <div>
                      <span className="font-medium text-foreground">{activity.title}</span>
                      <div className="text-gray-600 text-sm">{activity.message}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 sm:mt-0">
                      <Badge variant={activity.priority === 'high' ? 'destructive' : activity.priority === 'low' ? 'secondary' : 'default'}>
                        {activity.priority || 'medium'}
                      </Badge>
                      <span className="text-gray-500 text-xs whitespace-nowrap">{new Date(activity.created_at).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ActivityHistoryPage;
