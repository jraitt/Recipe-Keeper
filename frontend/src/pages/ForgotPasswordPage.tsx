import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService, ForgotPasswordRequest } from '../services/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.forgotPassword(data);
      setIsSubmitted(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to send password reset email';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h1>
          <p className="text-gray-600 mb-6">
            If an account with that email exists, we've sent you a password reset link.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Don't see the email? Check your spam folder or try again.
          </p>
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Forgot Password?
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-500 text-sm"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};