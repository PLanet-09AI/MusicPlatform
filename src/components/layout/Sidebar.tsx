import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Library, PlusCircle, Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { user } = useAuthStore();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/browse' },
    { icon: Library, label: 'Library', path: '/library' },
  ];

  const playlists = [
    { name: 'Liked Songs', path: '/playlist/liked', icon: Heart },
    // Add more playlists here
  ];

  return (
    <div className="w-64 bg-primary-black/90 backdrop-blur-sm p-6 flex flex-col gap-6">
      <nav className="space-y-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => cn(
              'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
              'hover:bg-primary-gray/10',
              isActive && 'bg-primary-gray/10 text-accent-blue'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-primary-gray/20 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Your Library</h3>
          <button className="p-1 hover:text-accent-blue transition-colors">
            <PlusCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {playlists.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => cn(
                'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
                'hover:bg-primary-gray/10',
                isActive && 'bg-primary-gray/10'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;