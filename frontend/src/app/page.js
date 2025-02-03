'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveTokens } from '../utils/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const { access_token, refresh_token } = await res.json();
        saveTokens(access_token, refresh_token);
        router.push('/dashboard');
      } else {
        const { error } = await res.json();
        setError(error || 'Login failed.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-96">
        <h1 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-white">Login to Strong Dashboard 🏋🏼</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border rounded-lg mb-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border rounded-lg mb-6 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />

        <button
          type="submit"
          className="w-full bg-indigo-500 dark:bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-600 dark:hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
} 
