import axios from 'axios';
import { authService } from '../services/auth.service';

// User type definition
export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
};

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  name: string;
}

// Global count to avoid multiple error logs in console
let errorLogCount = 0;

export const getCurrentUser = async (): Promise<User> => {
  try {
    // First try to get user from auth service if it's already authenticated
    if (authService.isAuthenticated && authService.currentUser) {
      return authService.currentUser;
    }
    
    // If not cached, check auth through the service (which handles caching)
    const isAuth = await authService.checkAuth();
    if (isAuth && authService.currentUser) {
      return authService.currentUser;
    }
    
    // Only make a direct API call if necessary
    const response = await axios.get('/api/auth/me', {
      timeout: 3000, // Short timeout to fail fast
    });
    
    const userData = response.data.data || response.data;
    
    if (!userData || typeof userData !== 'object' || !userData.role) {
      throw new Error('Invalid user data format');
    }
    
    return userData as User;
  } catch (error) {
    // Limit error logging to avoid console spam
    if (errorLogCount < 2) {
      console.error('Error fetching user data:', error);
      errorLogCount++;
    }
    throw error;
  }
};

export const loginUser = async (credentials: { email: string, password: string }): Promise<User> => {
  try {
    const response = await axios.post('/api/auth/login', credentials);
    const userData = response.data.data || response.data;
    
    if (!userData || typeof userData !== 'object' || !userData.role) {
      throw new Error('Invalid user data format');
    }
    
    // Update auth service after successful login
    await authService.checkAuth();
    
    // Reset error count on successful login
    errorLogCount = 0;
    
    return userData as User;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await axios.post('/api/auth/logout');
    // Clear auth service state after logout
    authService.clearAuth();
  } catch (error) {
    console.error('Error logging out:', error);
    // Still clear auth locally even if API logout fails
    authService.clearAuth();
    throw error;
  }
};

export const signupUser = async (userData: { name: string, email: string, password: string }): Promise<User> => {
  try {
    const response = await axios.post('/api/auth/signup', userData);
    const newUser = response.data.data || response.data;
    
    if (!newUser || typeof newUser !== 'object' || !newUser.role) {
      throw new Error('Invalid user data format');
    }
    
    // Update auth service after successful signup
    await authService.checkAuth();
    
    return newUser as User;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}; 