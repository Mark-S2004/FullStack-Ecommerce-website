import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

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

// Store original methods before overriding
const originalGet = axios.get;
const originalPost = axios.post;

// Define API base URL
const API_BASE_URL = '/api';

// Override axios.get for auth endpoints
axios.get = function<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
  if (url === '/api/auth/me') {
    // Pass through to the real backend
    return originalGet.call(this, url, config) as Promise<R>;
  }
  return originalGet.call(this, url, config) as Promise<R>;
};

// Override axios.post for auth endpoints
axios.post = function<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
  // Map /api/auth/register to /api/auth/signup if needed
  if (url === '/api/auth/register') {
    return originalPost.call(this, '/api/auth/signup', data, config) as Promise<R>;
  }
  
  if (url === '/api/auth/login' || url === '/api/auth/logout') {
    // Pass through to the real backend
    return originalPost.call(this, url, data, config) as Promise<R>;
  }
  
  return originalPost.call(this, url, data, config) as Promise<R>;
}; 