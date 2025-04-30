import React from 'react';
import Header from '@/components/Header';

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
    {/* Header */}
    <Header />
    <div className="flex items-center justify-center min-h-screen min-w-full bg-gradient-to-b from-blue-900 to-blue-800">
      <div className="w-full max-w-md p-8 bg-blue-950 text-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Login</h2>
        <p className="text-sm mb-6">Enter your credentials to access your account</p>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email or Username
            </label>
            <input
              type="text"
              id="email"
              className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email or username"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <a href="/forgot-password" className="text-sm text-blue-400 hover:underline">
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded"
          >
            Log In
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
    </div>
  );
};

export default LoginPage;