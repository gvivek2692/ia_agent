import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, TrendingDown as TrendingDownIcon, BarChart3 } from 'lucide-react';

interface PortfolioOverviewProps {
  portfolio: {
    summary: {
      total_current_value: number;
      total_investment: number;
      total_gain_loss: number;
      gain_loss_percentage: number;
      asset_allocation: {
        [key: string]: {
          value: number;
          percentage: number;
        };
      };
    };
  };
  formatCurrency: (amount: number) => string;
  formatPercentage: (percentage: number) => string;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ 
  portfolio, 
  formatCurrency, 
  formatPercentage 
}) => {
  const { summary } = portfolio;
  const isPositive = summary.total_gain_loss >= 0;

  const calculateTodayChange = () => {
    // Simulate today's change (random between -2% to +2%)
    const changePercentage = (Math.random() - 0.5) * 4;
    const changeAmount = summary.total_current_value * (changePercentage / 100);
    return { changeAmount, changePercentage };
  };

  const todayChange = calculateTodayChange();
  const isTodayPositive = todayChange.changeAmount >= 0;

  const getAssetCount = () => {
    return Object.keys(summary.asset_allocation).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Portfolio Value */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Total Portfolio Value
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatCurrency(summary.total_current_value)}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Wallet className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        {/* Today's Change */}
        <div className="flex items-center mt-4">
          {isTodayPositive ? (
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
          ) : (
            <TrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
          )}
          <span className={`text-sm font-medium ${
            isTodayPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(Math.abs(todayChange.changeAmount))} ({formatPercentage(Math.abs(todayChange.changePercentage))})
          </span>
          <span className="text-gray-500 text-sm ml-2">today</span>
        </div>
      </div>

      {/* Total Investment */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Total Investment
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatCurrency(summary.total_investment)}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="mt-4">
          <span className="text-sm text-gray-500">
            Capital deployed across {getAssetCount()} asset classes
          </span>
        </div>
      </div>

      {/* Total Gains/Loss */}
      <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
        isPositive ? 'border-green-500' : 'border-red-500'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {isPositive ? 'Total Gains' : 'Total Loss'}
            </p>
            <p className={`text-3xl font-bold mt-2 ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(Math.abs(summary.total_gain_loss))}
            </p>
          </div>
          <div className={`p-3 rounded-full ${
            isPositive ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isPositive ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
          </div>
        </div>
        
        <div className="flex items-center mt-4">
          <span className={`text-lg font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercentage(summary.gain_loss_percentage)}
          </span>
          <span className="text-gray-500 text-sm ml-2">overall return</span>
        </div>
      </div>

      {/* Portfolio Performance */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Performance Score
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {summary.gain_loss_percentage > 15 ? 'A+' : 
               summary.gain_loss_percentage > 10 ? 'A' :
               summary.gain_loss_percentage > 5 ? 'B+' :
               summary.gain_loss_percentage > 0 ? 'B' : 'C'}
            </p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-full">
            <BarChart3 className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Risk Level:</span>
            <span className={`font-medium ${
              summary.gain_loss_percentage > 15 ? 'text-red-600' :
              summary.gain_loss_percentage > 10 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {summary.gain_loss_percentage > 15 ? 'High' :
               summary.gain_loss_percentage > 10 ? 'Medium' : 'Low'}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Diversification:</span>
            <span className="text-green-600 font-medium">
              {getAssetCount() >= 3 ? 'Good' : 'Needs Improvement'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;