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

  private constructor() {
    // We'll initialize on-demand instead of on load
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
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
        } else {
          this._currentUser = null;
          this._isAuthenticated = false;
        }
      } catch (error) {
        this._currentUser = null;
        this._isAuthenticated = false;
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
  }
}

export const authService = AuthService.getInstance(); 