import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';

interface Holding {
  scheme_name?: string;
  company_name?: string;
  mf_name?: string;
  folio_number?: string;
  units?: number;
  current_value: number;
  investment_amount: number;
  gain_loss: number;
  gain_loss_percentage: number | null;
  current_price?: number;
  avg_purchase_price?: number;
  type?: string;
  sector?: string;
}

interface HoldingsTableProps {
  mutualFunds: Holding[];
  stocks: Holding[];
  formatCurrency: (amount: number | null | undefined) => string;
  formatPercentage: (percentage: number | string | null | undefined) => string;
}

type SortField = 'name' | 'currentValue' | 'investmentAmount' | 'gainLoss' | 'gainLossPercentage';
type SortOrder = 'asc' | 'desc';

const HoldingsTable: React.FC<HoldingsTableProps> = ({ 
  mutualFunds, 
  stocks, 
  formatCurrency, 
  formatPercentage 
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mutualFunds' | 'stocks'>('all');
  const [sortField, setSortField] = useState<SortField>('currentValue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Combine and normalize holdings
  const allHoldings: (Holding & { type: 'mutual_fund' | 'stock'; displayName: string })[] = [
    ...mutualFunds.map(mf => ({
      ...mf,
      type: 'mutual_fund' as const,
      displayName: mf.scheme_name || 'Unknown Fund',
    })),
    ...stocks.map(stock => ({
      ...stock,
      type: 'stock' as const,
      displayName: stock.company_name || 'Unknown Stock',
    }))
  ];

  // Filter holdings based on active tab and search
  const filteredHoldings = allHoldings.filter(holding => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'mutualFunds' && holding.type === 'mutual_fund') ||
      (activeTab === 'stocks' && holding.type === 'stock');
    
    const matchesSearch = searchTerm === '' || 
      holding.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (holding.mf_name && holding.mf_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  // Sort holdings
  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'name':
        aValue = a.displayName;
        bValue = b.displayName;
        break;
      case 'currentValue':
        aValue = a.current_value;
        bValue = b.current_value;
        break;
      case 'investmentAmount':
        aValue = a.investment_amount;
        bValue = b.investment_amount;
        break;
      case 'gainLoss':
        aValue = a.gain_loss;
        bValue = b.gain_loss;
        break;
      case 'gainLossPercentage':
        aValue = a.gain_loss_percentage ?? 0;
        bValue = b.gain_loss_percentage ?? 0;
        break;
      default:
        aValue = a.current_value;
        bValue = b.current_value;
    }

    if (typeof aValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue as string)
        : (bValue as string).localeCompare(aValue);
    }
    
    return sortOrder === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-4 h-4 ml-1" /> : 
      <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const calculateTotals = () => {
    const totals = filteredHoldings.reduce((acc, holding) => ({
      currentValue: acc.currentValue + (holding.current_value || 0),
      investmentAmount: acc.investmentAmount + (holding.investment_amount || 0),
      gainLoss: acc.gainLoss + (holding.gain_loss || 0),
    }), { currentValue: 0, investmentAmount: 0, gainLoss: 0 });

    const gainLossPercentage = totals.investmentAmount > 0 
      ? (totals.gainLoss / totals.investmentAmount) * 100 
      : 0;
    return { ...totals, gainLossPercentage };
  };

  const totals = calculateTotals();

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Holdings</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({allHoldings.length})
          </button>
          <button
            onClick={() => setActiveTab('mutualFunds')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'mutualFunds'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mutual Funds ({mutualFunds.length})
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'stocks'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Stocks ({stocks.length})
          </button>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search holdings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-6 bg-blue-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Holdings</p>
            <p className="text-lg font-semibold text-gray-900">{filteredHoldings.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Value</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(totals.currentValue)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Investment Amount</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(totals.investmentAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Gain/Loss</p>
            <div className="flex items-center space-x-2">
              <p className={`text-lg font-semibold ${
                totals.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(Math.abs(totals.gainLoss))}
              </p>
              {totals.gainLoss >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
            <p className={`text-sm ${
              totals.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(totals.gainLossPercentage)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('currentValue')}
              >
                <div className="flex items-center justify-end">
                  Current Value
                  <SortIcon field="currentValue" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('investmentAmount')}
              >
                <div className="flex items-center justify-end">
                  Investment
                  <SortIcon field="investmentAmount" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('gainLoss')}
              >
                <div className="flex items-center justify-end">
                  Gain/Loss
                  <SortIcon field="gainLoss" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('gainLossPercentage')}
              >
                <div className="flex items-center justify-end">
                  Returns
                  <SortIcon field="gainLossPercentage" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedHoldings.map((holding, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {holding.displayName}
                    </div>
                    {holding.mf_name && holding.type === 'mutual_fund' && (
                      <div className="text-xs text-gray-500">{holding.mf_name}</div>
                    )}
                    {holding.folio_number && (
                      <div className="text-xs text-gray-500">Folio: {holding.folio_number}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    holding.type === 'mutual_fund'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {holding.type === 'mutual_fund' ? 'Mutual Fund' : 'Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(holding.current_value)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {formatCurrency(holding.investment_amount)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`text-sm font-medium ${
                    holding.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(holding.gain_loss))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <span className={`text-sm font-medium ${
                      (holding.gain_loss_percentage ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(holding.gain_loss_percentage)}
                    </span>
                    {(holding.gain_loss_percentage ?? 0) >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedHoldings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? 'No holdings match your search.' : 'No holdings found.'}
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HoldingsTable;