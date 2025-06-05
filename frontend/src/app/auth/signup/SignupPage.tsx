"use client";

import React, { useState } from 'react';
import { useSignupMutation } from '../../redux/services/authApi'; // Adjust path as needed
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signup, { isLoading, error }] = useSignupMutation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Assuming the signup mutation returns user data or a success indicator
      const result = await signup({ email, password }).unwrap();
      console.log('Signup successful', result);
      // Optionally redirect to a confirmation page or login page
      router.push('/auth/login'); // Adjust redirect path as needed
    } catch (err) {
      console.error('Signup failed', err);
      // Handle signup error (e.g., display error message to user)
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Create an account</h3>
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
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">Error: {'data' in error ? JSON.stringify(error.data) : 'An error occurred'}</p>}
            <p className="text-sm mt-4 text-center">Already have an account? <a href="/auth/login" className="text-blue-600 hover:underline">Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
} 