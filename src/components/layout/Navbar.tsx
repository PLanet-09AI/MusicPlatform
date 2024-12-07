import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music2, User, LogOut, BarChart2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Button from '../ui/Button';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-primary-black/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Music2 className="h-6 w-6 text-accent-blue" />
            <span className="text-xl font-bold">MusicHub</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/browse" className="hover:text-accent-blue transition">
              Browse
            </Link>
            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'artist') && (
                  <Link to="/admin" className="hover:text-accent-blue transition flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    {user.role === 'artist' ? 'Artist Dashboard' : 'Admin'}
                  </Link>
                )}
                <Link to="/profile" className="hover:text-accent-blue transition">
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:text-accent-red transition"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                size="sm"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;