import React, { useState } from 'react';
import { Upload, FileText, User, Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/apiService';

interface UploadResult {
  success: boolean;
  userId?: string;
  portfolio?: {
    totalSchemes: number;
    totalInvestment: number;
    totalCurrentValue: number;
    totalGainLoss: number;
    gainLossPercentage: number;
  };
  error?: string;
  message?: string;
}

interface UploadStatementProps {
  onSuccess?: (result: UploadResult) => void;
}

const UploadStatement: React.FC<UploadStatementProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.match(/\.pdf$/i)) {
        alert('Please select a PDF file (.pdf)');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const data = await apiService.checkUsernameAvailability(username) as any;
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    // Debounce username check
    setTimeout(() => checkUsernameAvailability(value), 500);
  };

  const handleUpload = async () => {
    if (!file || !username || !password) {
      alert('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    if (usernameAvailable === false) {
      alert('Username is already taken. Please choose a different one.');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const data: UploadResult = await apiService.uploadMfStatement(file, username, password) as any;
      setResult(data);

      if (data.success && onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        error: 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setResult(null);
    setUsernameAvailable(null);
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <FileText className="mx-auto h-16 w-16 text-blue-600 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload CAS Statement</h2>
        <p className="text-gray-600">
          Upload your Consolidated Account Statement (CAS) PDF to create your personalized investment profile
        </p>
      </div>

      {!result?.success && (
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mutual Fund Statement (PDF File) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-sm text-gray-600">
                  {file ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">{file.name}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                      <p className="text-xs text-gray-500 mt-1">PDF files only (.pdf)</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="pl-10 pr-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
                minLength={3}
              />
              {username.length >= 3 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {checkingUsername ? (
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  ) : usernameAvailable === true ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : usernameAvailable === false ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : null}
                </div>
              )}
            </div>
            {username.length >= 3 && usernameAvailable === false && (
              <p className="text-sm text-red-600 mt-1">Username is already taken</p>
            )}
            {username.length >= 3 && usernameAvailable === true && (
              <p className="text-sm text-green-600 mt-1">Username is available</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pl-10 w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="Confirm password"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !file || !username || !password || !confirmPassword || usernameAvailable === false}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processing...
              </div>
            ) : (
              'Create Account & Process Statement'
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className={`p-6 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-start">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.success ? 'Account Created Successfully!' : 'Upload Failed'}
              </h3>
              <p className={`mt-1 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message || result.error}
              </p>
              
              {result.success && result.portfolio && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-green-900">Portfolio Summary:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-green-800">
                    <div>
                      <span className="font-medium">Total Investment:</span>
                      <br />₹{result.portfolio.totalInvestment.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Current Value:</span>
                      <br />₹{result.portfolio.totalCurrentValue.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Gain/Loss:</span>
                      <br />₹{result.portfolio.totalGainLoss.toLocaleString()} ({result.portfolio.gainLossPercentage.toFixed(2)}%)
                    </div>
                    <div>
                      <span className="font-medium">Schemes:</span>
                      <br />{result.portfolio.totalSchemes} funds
                    </div>
                  </div>
                </div>
              )}

              {result.success && (
                <div className="mt-4">
                  <button
                    onClick={resetForm}
                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    Upload Another Statement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Supported Format:</p>
            <ul className="space-y-1 text-xs">
              <li>• CAS PDF files from CAMS/KFintech with mutual fund transaction data</li>
              <li>• Should include: Portfolio Summary, Fund Details, Transaction History</li>
              <li>• Supports all major fund houses: HDFC, SBI, Axis, Mirae, PPFAS, etc.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadStatement;