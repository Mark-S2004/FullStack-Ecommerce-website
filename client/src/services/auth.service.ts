import axios from 'axios';
import { User } from '../api/auth';

// Simple auth state manager to handle authentication state
class AuthService {
  private static instance: AuthService;
  private _currentUser: User | null = null;
  private _isAuthenticated = false;
  private _isLoading = false;
  private _lastCheckTime = 0;
  private _pendingCheck: Promise<boolean> | null = null;
  private readonly LOCAL_STORAGE_KEY = 'auth_user';

  private constructor() {
    // Initialize with saved state if available
    this.loadFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Load auth data from localStorage
  private loadFromStorage(): void {
    try {
      const storedUser = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (storedUser) {
        this._currentUser = JSON.parse(storedUser) as User;
        this._isAuthenticated = true;
      }
    } catch (error) {
      console.log('Failed to load user from storage');
      this.clearStorage();
    }
  }

  // Save auth data to localStorage
  private saveToStorage(): void {
    if (this._currentUser) {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this._currentUser));
    } else {
      this.clearStorage();
    }
  }

  // Clear localStorage
  private clearStorage(): void {
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
  }

  // Check if the user is authenticated by calling the /me endpoint
  public async checkAuth(): Promise<boolean> {
    // If we checked auth recently (within 10 seconds), return cached result
    const now = Date.now();
    if (now - this._lastCheckTime < 10000) {
      return this._isAuthenticated;
    }

    // If there's already a check in progress, return that promise
    if (this._pendingCheck) {
      return this._pendingCheck;
    }

    this._isLoading = true;
    
    // Create a new promise for this check and store it
    this._pendingCheck = new Promise<boolean>(async (resolve) => {
      try {
        const response = await axios.get('/api/auth/me', { 
          // Don't retry failed requests
          timeout: 5000 
        });
        
        const userData = response.data.data || response.data;
        if (userData && userData.role) {
          this._currentUser = userData as User;
          this._isAuthenticated = true;
          this.saveToStorage();
        } else {
          this._currentUser = null;
          this._isAuthenticated = false;
          this.clearStorage();
        }
      } catch (error) {
        this._currentUser = null;
        this._isAuthenticated = false;
        this.clearStorage();
        // Quiet logging - just log once that we're not authenticated
        console.log('Not authenticated');
      } finally {
        this._isLoading = false;
        this._lastCheckTime = Date.now();
        this._pendingCheck = null;
        resolve(this._isAuthenticated);
      }
    });

    return this._pendingCheck;
  }

  // Update user data directly (without API call) - used after login/register
  public updateUserData(user: User): void {
    this._currentUser = user;
    this._isAuthenticated = true;
    this._lastCheckTime = Date.now();
    this.saveToStorage();
  }

  // Getters
  public get currentUser(): User | null {
    return this._currentUser;
  }

  public get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  public get isLoading(): boolean {
    return this._isLoading;
  }

  // Clear user data on logout
  public clearAuth(): void {
    this._currentUser = null;
    this._isAuthenticated = false;
    this._lastCheckTime = 0;
    this.clearStorage();

    // Also remove other auth-related items
    localStorage.removeItem('userRole');
  }
}

export const authService = AuthService.getInstance(); 