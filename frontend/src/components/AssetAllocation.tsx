import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AssetAllocationProps {
  assetAllocation: {
    [key: string]: {
      value: number;
      percentage: number;
    };
  };
  formatCurrency: (amount: number) => string;
}

const AssetAllocation: React.FC<AssetAllocationProps> = ({ assetAllocation, formatCurrency }) => {
  // Color palette for different asset classes
  const colors = {
    mutual_funds: '#3B82F6', // Blue
    stocks: '#10B981', // Green
    ppf: '#F59E0B', // Amber
    bonds: '#8B5CF6', // Purple
    gold: '#EF4444', // Red
    real_estate: '#06B6D4', // Cyan
    crypto: '#F97316', // Orange
  };

  // Transform data for recharts
  const chartData = Object.entries(assetAllocation).map(([key, data]) => ({
    name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: data.percentage,
    amount: data.value,
    color: colors[key as keyof typeof colors] || '#6B7280'
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/20">
          <p className="font-semibold text-white">{data.name}</p>
          <p className="text-blue-400">
            {formatCurrency(data.amount)} ({data.value.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Asset Allocation</h3>
        <div className="text-sm text-gray-400">
          {Object.keys(assetAllocation).length} asset classes
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400">No allocation data available</p>
          </div>
        </div>
      )}

      {/* Asset Breakdown Cards */}
      {chartData.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
            Asset Breakdown
          </h4>
          {chartData.map((asset, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: asset.color }}
                />
                <span className="font-medium text-white">{asset.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">
                  {formatCurrency(asset.amount)}
                </div>
                <div className="text-sm text-gray-300">{asset.value.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetAllocation;