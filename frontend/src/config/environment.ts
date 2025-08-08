/**
 * Environment configuration for frontend
 * Handles both local development and production deployment
 */

interface EnvironmentConfig {
  backendUrl: string;
  apiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Always use deployed backend for now - change this if you want to use local backend
  const USE_LOCAL_BACKEND = true; // Set to true if you want to use local backend
  
  // Use environment variables if available, otherwise use deployed backend
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 
    (USE_LOCAL_BACKEND && isDevelopment ? 'http://localhost:3001' : 'https://ia-agent-aguf.onrender.com');
  
  const apiUrl = process.env.REACT_APP_API_URL || 
    (USE_LOCAL_BACKEND && isDevelopment ? 'http://localhost:3001/api' : 'https://ia-agent-aguf.onrender.com/api');

  return {
    backendUrl,
    apiUrl,
    isDevelopment,
    isProduction
  };
};

export const config = getEnvironmentConfig();

export default config;