import React, { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LoginPageProps {
  onBypassLogin: () => void;
}

export default function LoginPage({ onBypassLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Authentication successful - the parent component should handle this
        // via supabase.auth.onAuthStateChange
        console.log('Login successful:', data.user);
        onBypassLogin(); // This will trigger the parent to check auth state
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">DS</span>
          </div>
          <h1 className="text-2xl font-semibold text-purple-400 mb-2">DePuy Synthes ERP</h1>
          <p className="text-gray-400">Enterprise Resource Planning System</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-12"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-600 bg-gray-800 text-purple-600" />
              <span className="ml-2 text-sm text-gray-400">Remember me</span>
            </label>
            <a href="#" className="text-sm text-purple-400 hover:text-purple-300">
              Forgot password?
            </a>
          </div>
          
          <div className="space-y-3">
            <button 
              type="submit" 
              className="btn-primary w-full flex items-center justify-center space-x-2"
              disabled={loading}
            >
              <LogIn size={18} />
              <span>{loading ? 'Signing in...' : 'Login'}</span>
            </button>
            
            <button 
              type="button" 
              onClick={onBypassLogin}
              className="btn-secondary w-full"
              disabled={loading}
            >
              Bypass Login (Development)
            </button>
          </div>
        </form>
        
        <div className="text-center mt-8 text-xs text-gray-500">
          © 2024 DePuy Synthes. All rights reserved.
        </div>
      </div>
    </div>
  );
}