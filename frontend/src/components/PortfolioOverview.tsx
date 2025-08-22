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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-0">
      {/* Total Portfolio Value */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6 border-l-4 border-blue-400 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Total Portfolio Value
            </p>
            <p className="text-3xl font-bold text-white mt-2">
              {formatCurrency(summary.total_current_value)}
            </p>
          </div>
          <div className="p-3 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30">
            <Wallet className="h-8 w-8 text-blue-400" />
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
          <span className="text-gray-400 text-sm ml-2">today</span>
        </div>
      </div>

      {/* Total Investment */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6 border-l-4 border-purple-400 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Total Investment
            </p>
            <p className="text-3xl font-bold text-white mt-2">
              {formatCurrency(summary.total_investment)}
            </p>
          </div>
          <div className="p-3 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-400/30">
            <DollarSign className="h-8 w-8 text-purple-400" />
          </div>
        </div>
        
        <div className="mt-4">
          <span className="text-sm text-gray-400">
            Capital deployed across {getAssetCount()} asset classes
          </span>
        </div>
      </div>

      {/* Total Gains/Loss */}
      <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6 border-l-4 relative ${
        isPositive ? 'border-green-400' : 'border-red-400'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              {isPositive ? 'Total Gains' : 'Total Loss'}
            </p>
            <p className={`text-3xl font-bold mt-2 ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatCurrency(Math.abs(summary.total_gain_loss))}
            </p>
          </div>
          <div className={`p-3 backdrop-blur-sm rounded-full border ${
            isPositive ? 'bg-green-500/20 border-green-400/30' : 'bg-red-500/20 border-red-400/30'
          }`}>
            {isPositive ? (
              <TrendingUp className="h-8 w-8 text-green-400" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-400" />
            )}
          </div>
        </div>
        
        <div className="flex items-center mt-4">
          <span className={`text-lg font-semibold ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {formatPercentage(summary.gain_loss_percentage)}
          </span>
          <span className="text-gray-400 text-sm ml-2">overall return</span>
        </div>
      </div>

      {/* Portfolio Performance */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6 border-l-4 border-indigo-400 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Performance Score
            </p>
            <p className="text-3xl font-bold text-white mt-2">
              {summary.gain_loss_percentage > 15 ? 'A+' : 
               summary.gain_loss_percentage > 10 ? 'A' :
               summary.gain_loss_percentage > 5 ? 'B+' :
               summary.gain_loss_percentage > 0 ? 'B' : 'C'}
            </p>
          </div>
          <div className="p-3 bg-indigo-500/20 backdrop-blur-sm rounded-full border border-indigo-400/30">
            <BarChart3 className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Risk Level:</span>
            <span className={`font-medium ${
              summary.gain_loss_percentage > 15 ? 'text-red-400' :
              summary.gain_loss_percentage > 10 ? 'text-yellow-400' :
              'text-green-400'
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