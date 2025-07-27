import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency, formatPercentage } from '../utils/formatters';

// Define color schemes for charts
const COLORS = {
  primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
  success: ['#10b981', '#059669', '#047857', '#065f46'],
  warm: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
  mixed: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
};

interface AssetAllocationChartProps {
  data: Array<{ name: string; value: number; percentage: number }>;
}

export const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({ data }) => {
  const renderCustomLabel = (entry: any) => {
    return `${entry.name}\n${formatPercentage(entry.percentage)}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-primary-600">{formatCurrency(data.value)}</p>
          <p className="text-gray-600">{formatPercentage(data.percentage)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.mixed[index % COLORS.mixed.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface PortfolioPerformanceChartProps {
  data: Array<{ name: string; investment: number; current: number; gain: number }>;
}

export const PortfolioPerformanceChart: React.FC<PortfolioPerformanceChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">Investment: {formatCurrency(payload[0].value)}</p>
          <p className="text-green-600">Current: {formatCurrency(payload[1].value)}</p>
          <p className="text-purple-600">Gain: {formatCurrency(payload[2].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="investment" fill="#3b82f6" name="Investment" />
          <Bar dataKey="current" fill="#10b981" name="Current Value" />
          <Bar dataKey="gain" fill="#8b5cf6" name="Gain/Loss" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface GoalProgressChartProps {
  data: Array<{ name: string; current: number; target: number; progress: number }>;
}

export const GoalProgressChart: React.FC<GoalProgressChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">Current: {formatCurrency(data.current)}</p>
          <p className="text-gray-600">Target: {formatCurrency(data.target)}</p>
          <p className="text-green-600">Progress: {formatPercentage(data.progress)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(value) => formatCurrency(value, true)} />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="current" fill="#3b82f6" name="Current" />
          <Bar dataKey="target" fill="#e5e7eb" name="Target" opacity={0.3} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface MonthlySpendingChartProps {
  data: Array<{ month: string; amount: number; category: string }>;
}

export const MonthlySpendingChart: React.FC<MonthlySpendingChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-red-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Investment Growth Chart
interface InvestmentGrowthChartProps {
  data: Array<{ date: string; value: number; investment: number }>;
}

export const InvestmentGrowthChart: React.FC<InvestmentGrowthChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-green-600">Portfolio Value: {formatCurrency(payload[0].value)}</p>
          <p className="text-blue-600">Total Investment: {formatCurrency(payload[1].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="Portfolio Value" />
          <Line type="monotone" dataKey="investment" stroke="#3b82f6" strokeWidth={2} name="Total Investment" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Sector Allocation Chart
interface SectorAllocationChartProps {
  data: Array<{ sector: string; value: number; percentage: number }>;
}

export const SectorAllocationChart: React.FC<SectorAllocationChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.sector}</p>
          <p className="text-primary-600">{formatCurrency(data.value)}</p>
          <p className="text-gray-600">{formatPercentage(data.percentage)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};