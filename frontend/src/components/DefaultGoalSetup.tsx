import React, { useState } from 'react';
import { Calculator, TrendingUp, Shield, Loader } from 'lucide-react';
import { apiService } from '../services/apiService';

interface DefaultGoalSetupProps {
  onGoalsGenerated: (goals: any[]) => void;
  userId?: string;
  portfolioValue?: number;
  formatCurrency: (amount: number) => string;
}

interface UserFinancialInfo {
  yearlyIncome: number;
  age: number;
}

const DefaultGoalSetup: React.FC<DefaultGoalSetupProps> = ({
  onGoalsGenerated,
  userId,
  portfolioValue = 0,
  formatCurrency
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [financialInfo, setFinancialInfo] = useState<UserFinancialInfo>({
    yearlyIncome: 0,
    age: 0
  });

  const calculateDefaultGoals = () => {
    const { yearlyIncome, age } = financialInfo;
    
    // Emergency Fund: 6 months of expenses (assuming expenses are 70% of income)
    const monthlyExpenses = (yearlyIncome * 0.7) / 12;
    const emergencyFundTarget = monthlyExpenses * 6;
    const emergencyFundCurrent = Math.min(portfolioValue * 0.1, emergencyFundTarget); // Assume 10% of portfolio is liquid
    
    // Retirement Planning: Based on age and income
    const retirementAge = 60;
    const yearsToRetirement = Math.max(retirementAge - age, 5); // Minimum 5 years
    const retirementCorpusMultiplier = yearlyIncome * 25; // 25x annual income for retirement
    const retirementCurrent = Math.max(portfolioValue * 0.8, 0); // Assume 80% of portfolio is for retirement
    
    const goals = [
      {
        id: `emergency-fund-${Date.now()}`,
        name: 'Emergency Fund',
        description: `Build emergency fund covering 6 months of expenses (₹${formatCurrency(monthlyExpenses).replace('₹', '')} per month)`,
        target_amount: Math.round(emergencyFundTarget),
        current_amount: Math.round(emergencyFundCurrent),
        target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
        priority: 'high',
        category: 'emergency',
        progress_percentage: emergencyFundTarget > 0 ? Math.round((emergencyFundCurrent / emergencyFundTarget) * 100) : 0
      },
      {
        id: `retirement-${Date.now()}`,
        name: 'Retirement Planning',
        description: `Build retirement corpus for financial independence by age ${retirementAge}`,
        target_amount: Math.round(retirementCorpusMultiplier),
        current_amount: Math.round(retirementCurrent),
        target_date: new Date(Date.now() + yearsToRetirement * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'high',
        category: 'retirement',
        progress_percentage: retirementCorpusMultiplier > 0 ? Math.round((retirementCurrent / retirementCorpusMultiplier) * 100) : 0
      }
    ];
    
    return goals;
  };

  const handleGenerateGoals = async () => {
    if (financialInfo.yearlyIncome <= 0 || financialInfo.age <= 0) {
      alert('Please enter valid yearly income and age');
      return;
    }

    setLoading(true);
    
    try {
      if (userId) {
        // Call backend API to generate default goals
        const response = await apiService.generateDefaultGoals(userId, financialInfo.yearlyIncome, financialInfo.age) as any;
        
        if (response.success) {
          onGoalsGenerated(response.goals);
          setIsVisible(false);
        } else {
          throw new Error(response.error || 'Failed to generate goals');
        }
      } else {
        // Fallback to client-side calculation for demo users
        const defaultGoals = calculateDefaultGoals();
        onGoalsGenerated(defaultGoals);
        setIsVisible(false);
      }
    } catch (error: any) {
      console.error('Error generating default goals:', error);
      alert(error.message || 'Error generating goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const previewGoals = financialInfo.yearlyIncome > 0 && financialInfo.age > 0 ? calculateDefaultGoals() : [];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 mb-6 border border-blue-200">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Set Up Your Default Financial Goals
        </h3>
        <p className="text-gray-600">
          Enter your basic financial information to automatically generate personalized emergency fund and retirement goals.
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yearly Income After Taxes (₹)
            </label>
            <input
              type="number"
              value={financialInfo.yearlyIncome || ''}
              onChange={(e) => setFinancialInfo({ ...financialInfo, yearlyIncome: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1200000"
            />
            <p className="text-xs text-gray-500 mt-1">Your annual take-home income</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Age
            </label>
            <input
              type="number"
              value={financialInfo.age || ''}
              onChange={(e) => setFinancialInfo({ ...financialInfo, age: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 28"
              min="18"
              max="65"
            />
            <p className="text-xs text-gray-500 mt-1">Used to calculate retirement timeline</p>
          </div>
        </div>

        {/* Goal Preview */}
        {previewGoals.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Your Personalized Goals Preview
            </h4>
            <div className="space-y-3">
              {previewGoals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {goal.category === 'emergency' ? '🚨' : '🏖️'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{goal.name}</p>
                      <p className="text-xs text-gray-600">{goal.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(goal.target_amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {goal.progress_percentage}% complete
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip for now
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-xs text-gray-500">
              <Shield className="w-4 h-4 mr-1" />
              Your data is secure and private
            </div>
            
            <button
              onClick={handleGenerateGoals}
              disabled={loading || financialInfo.yearlyIncome <= 0 || financialInfo.age <= 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Generate My Goals</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultGoalSetup;