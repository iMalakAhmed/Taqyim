"use client";

import React, { useState } from 'react';
import { useLoginMutation } from '../../redux/services/authApi'; // Adjust path as needed
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Assuming the login mutation returns user data or a success indicator
      const result = await login({ email, password }).unwrap();
      console.log('Login successful', result);
      // Redirect to a protected page after successful login
      router.push('/home'); // Adjust redirect path as needed
    } catch (err) {
      console.error('Login failed', err);
      // Handle login error (e.g., display error message to user)
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Login to your account</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
            </div>
             {error && <p className="text-red-500 text-sm mt-2">Error: {'data' in error ? JSON.stringify(error.data) : 'An error occurred'}</p>}
             <p className="text-sm mt-4 text-center">Don't have an account? <a href="/auth/signup" className="text-blue-600 hover:underline">Sign up</a></p>
          </div>
        </form>
      </div>
    </div>
  );
} 