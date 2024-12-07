import React, { useState } from 'react';
import { BarChart3, Users, CreditCard, Music } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import SongManagement from './SongManagement';
import UserManagement from './UserManagement';
import TransactionHistory from './TransactionHistory';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';

type Tab = 'analytics' | 'songs' | 'users' | 'transactions';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('analytics');

  const tabs = [
    {
      id: 'analytics' as Tab,
      label: 'Analytics',
      icon: BarChart3,
      component: AnalyticsDashboard,
      roles: ['admin', 'artist']
    },
    {
      id: 'songs' as Tab,
      label: 'Songs',
      icon: Music,
      component: SongManagement,
      roles: ['admin', 'artist']
    },
    {
      id: 'users' as Tab,
      label: 'Users',
      icon: Users,
      component: UserManagement,
      roles: ['admin']
    },
    {
      id: 'transactions' as Tab,
      label: 'Transactions',
      icon: CreditCard,
      component: TransactionHistory,
      roles: ['admin', 'artist']
    }
  ];

  // Filter tabs based on user role
  const allowedTabs = tabs.filter(tab => tab.roles.includes(user?.role || ''));
  
  // If current tab is not allowed, switch to first allowed tab
  if (!allowedTabs.find(tab => tab.id === activeTab)) {
    setActiveTab(allowedTabs[0]?.id || 'analytics');
  }

  const ActiveComponent = allowedTabs.find(tab => tab.id === activeTab)?.component || AnalyticsDashboard;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">
          {user?.role === 'artist' ? 'Artist Dashboard' : 'Admin Dashboard'}
        </h1>
        <nav className="flex gap-4">
          {allowedTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                activeTab === id
                  ? 'bg-accent-blue/20 text-accent-blue'
                  : 'bg-primary-black/50 hover:bg-primary-black/70'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <ActiveComponent />
    </div>
  );
};

export default AdminDashboard;