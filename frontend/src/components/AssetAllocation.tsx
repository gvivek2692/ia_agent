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
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-blue-600">
            {formatCurrency(data.amount)} ({data.value.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-col space-y-2 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700 flex-1">{entry.value}</span>
            <span className="text-sm font-medium text-gray-900">
              {entry.payload.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Asset Allocation</h3>
        <div className="text-sm text-gray-500">
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
          
          {/* Custom Legend */}
          <CustomLegend payload={chartData.map(item => ({ 
            value: item.name, 
            color: item.color,
            payload: item
          }))} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No allocation data available</p>
          </div>
        </div>
      )}

      {/* Asset Breakdown Cards */}
      {chartData.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Asset Breakdown
          </h4>
          {chartData.map((asset, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: asset.color }}
                />
                <span className="font-medium text-gray-900">{asset.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(asset.amount)}
                </div>
                <div className="text-sm text-gray-600">{asset.value.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Allocation Insights */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">💡 Insights</h4>
        <div className="space-y-2 text-sm">
          {chartData.length === 1 && (
            <p className="text-amber-700 bg-amber-50 p-2 rounded">
              Consider diversifying across multiple asset classes to reduce risk
            </p>
          )}
          {chartData.find(item => item.value > 70) && (
            <p className="text-orange-700 bg-orange-50 p-2 rounded">
              {chartData.find(item => item.value > 70)?.name} allocation seems high - consider rebalancing
            </p>
          )}
          {chartData.length >= 3 && !chartData.find(item => item.value > 70) && (
            <p className="text-green-700 bg-green-50 p-2 rounded">
              Good diversification across asset classes
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation;