import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, Mail, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { signUp } from '@/lib/auth/service';
import { getAuthErrorMessage } from '@/lib/auth/errors';
import type { SignupFormData } from '@/lib/auth/validation';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signUp(formData);
      navigate('/');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(getAuthErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-navy px-4">
      <div className="max-w-md w-full space-y-8 bg-primary-black/50 p-8 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <Logo className="h-12 w-12" />
          <h2 className="mt-6 text-3xl font-bold">Create an account</h2>
          <p className="mt-2 text-primary-gray">Join our music community</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <div className="mt-1 relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-gray" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-primary-gray/30 rounded-md bg-primary-black/50 placeholder-primary-gray focus:outline-none focus:ring-accent-blue focus:border-accent-blue"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-gray" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-primary-gray/30 rounded-md bg-primary-black/50 placeholder-primary-gray focus:outline-none focus:ring-accent-blue focus:border-accent-blue"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-gray" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-primary-gray/30 rounded-md bg-primary-black/50 placeholder-primary-gray focus:outline-none focus:ring-accent-blue focus:border-accent-blue"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-gray" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-primary-gray/30 rounded-md bg-primary-black/50 placeholder-primary-gray focus:outline-none focus:ring-accent-blue focus:border-accent-blue"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>

          <div className="text-center text-sm">
            <span className="text-primary-gray">Already have an account? </span>
            <Link
              to="/login"
              className="text-accent-blue hover:text-accent-blue/80 font-medium"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;