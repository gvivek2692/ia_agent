import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { config } from '../config/environment';

interface TestResult {
  success: boolean;
  data?: {
    status: string;
    openai_configured: boolean;
    timestamp: string;
  };
  error?: string;
}

const ConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    try {
      const results = await apiService.testConnection();
      setTestResults(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTestResults({ success: false, error: errorMessage });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Auto-run test on component mount
    runConnectionTest();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-3">🔌 Backend Connection Test</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>Environment:</strong> {config.isDevelopment ? 'Development' : 'Production'}</div>
        <div><strong>Backend URL:</strong> {config.backendUrl}</div>
        <div><strong>API URL:</strong> {config.apiUrl}</div>
      </div>

      <div className="mt-4">
        <button
          onClick={runConnectionTest}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {testResults && (
        <div className={`mt-4 p-3 rounded border ${
          testResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          {testResults.success ? (
            <div>
              <div className="text-green-800 font-medium">✅ Connection Successful!</div>
              <div className="text-sm text-green-700 mt-1">
                Status: {testResults.data?.status} | 
                OpenAI: {testResults.data?.openai_configured ? 'Configured' : 'Not Configured'}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-red-800 font-medium">❌ Connection Failed</div>
              <div className="text-sm text-red-700 mt-1">{testResults.error}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;