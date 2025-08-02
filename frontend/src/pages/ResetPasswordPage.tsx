import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/auth';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }

      try {
        const response = await authService.verifyResetToken(token);
        if (response.success && response.data.valid) {
          setTokenValid(true);
          setUserEmail(response.data.email || '');
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        setTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      
      await authService.resetPassword({
        token,
        newPassword: data.newPassword,
      });
      
      setIsSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to reset password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Reset Link
          </h1>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Password Reset Successfully
          </h1>
          <p className="text-gray-600 mb-6">
            Your password has been reset. You will be redirected to the login page shortly.
          </p>
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Reset Your Password
      </h1>
      {userEmail && (
        <p className="text-center text-gray-600 mb-8">
          Creating a new password for <strong>{userEmail}</strong>
        </p>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <div className="relative">
            <input
              {...register('newPassword')}
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Confirm your new password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
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