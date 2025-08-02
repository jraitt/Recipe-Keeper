import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
    };
    token: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const authService = {
  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Get current user profile
  async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout user (client-side)
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  // Get stored user
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  },

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  // Request password reset
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  // Verify reset token
  async verifyResetToken(token: string): Promise<{ success: boolean; data: { valid: boolean; email?: string } }> {
    const response = await api.get(`/auth/verify-reset-token/${token}`);
    return response.data;
  },
};