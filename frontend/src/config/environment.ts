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
  
  // Auto-detect backend based on environment
  const USE_LOCAL_BACKEND = isDevelopment; // Use local backend only in development
  
  // Use environment variables if available, otherwise use appropriate backend
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 
    (USE_LOCAL_BACKEND ? 'http://localhost:3002' : 'https://ia-agent-1.onrender.com');
  
  const apiUrl = process.env.REACT_APP_API_URL || 
    (USE_LOCAL_BACKEND ? 'http://localhost:3002/api' : 'https://ia-agent-1.onrender.com/api');

  return {
    backendUrl,
    apiUrl,
    isDevelopment,
    isProduction
  };
};

export const config = getEnvironmentConfig();

export default config;