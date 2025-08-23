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
  gain_loss_percentage: number;
  current_price?: number;
  avg_purchase_price?: number;
  type?: string;
  sector?: string;
}

interface HoldingsTableProps {
  mutualFunds: Holding[];
  stocks: Holding[];
  formatCurrency: (amount: number) => string;
  formatPercentage: (percentage: number) => string;
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
        aValue = a.gain_loss_percentage;
        bValue = b.gain_loss_percentage;
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
      currentValue: acc.currentValue + holding.current_value,
      investmentAmount: acc.investmentAmount + holding.investment_amount,
      gainLoss: acc.gainLoss + holding.gain_loss,
    }), { currentValue: 0, investmentAmount: 0, gainLoss: 0 });

    const gainLossPercentage = (totals.gainLoss / totals.investmentAmount) * 100;
    return { ...totals, gainLossPercentage };
  };

  const totals = calculateTotals();

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Holdings</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-400 hover:text-gray-300 rounded-md hover:bg-white/10 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-gold-500/20 text-gold-400 shadow-sm backdrop-blur-sm border border-gold-400/30'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            All ({allHoldings.length})
          </button>
          <button
            onClick={() => setActiveTab('mutualFunds')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'mutualFunds'
                ? 'bg-gold-500/20 text-gold-400 shadow-sm backdrop-blur-sm border border-gold-400/30'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Mutual Funds ({mutualFunds.length})
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'stocks'
                ? 'bg-gold-500/20 text-gold-400 shadow-sm backdrop-blur-sm border border-gold-400/30'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Stocks ({stocks.length})
          </button>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search holdings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-6 bg-white/5 backdrop-blur-sm border-b border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-300">Holdings</p>
            <p className="text-lg font-semibold text-white">{filteredHoldings.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Current Value</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(totals.currentValue)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Investment Amount</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(totals.investmentAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Total Gain/Loss</p>
            <div className="flex items-center space-x-2">
              <p className={`text-lg font-semibold ${
                totals.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(Math.abs(totals.gainLoss))}
              </p>
              {totals.gainLoss >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <p className={`text-sm ${
              totals.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatPercentage(totals.gainLossPercentage)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 backdrop-blur-sm">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('currentValue')}
              >
                <div className="flex items-center justify-end">
                  Current Value
                  <SortIcon field="currentValue" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('investmentAmount')}
              >
                <div className="flex items-center justify-end">
                  Investment
                  <SortIcon field="investmentAmount" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('gainLoss')}
              >
                <div className="flex items-center justify-end">
                  Gain/Loss
                  <SortIcon field="gainLoss" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('gainLossPercentage')}
              >
                <div className="flex items-center justify-end">
                  Returns
                  <SortIcon field="gainLossPercentage" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {sortedHoldings.map((holding, index) => (
              <tr key={index} className="hover:bg-white/10">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {holding.displayName}
                    </div>
                    {holding.mf_name && holding.type === 'mutual_fund' && (
                      <div className="text-xs text-gray-400">{holding.mf_name}</div>
                    )}
                    {holding.folio_number && (
                      <div className="text-xs text-gray-400">Folio: {holding.folio_number}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    holding.type === 'mutual_fund'
                      ? 'bg-blue-500/20 text-blue-400 backdrop-blur-sm border border-blue-400/30'
                      : 'bg-green-500/20 text-green-400 backdrop-blur-sm border border-green-400/30'
                  }`}>
                    {holding.type === 'mutual_fund' ? 'Mutual Fund' : 'Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-white">
                  {formatCurrency(holding.current_value)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-white">
                  {formatCurrency(holding.investment_amount)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`text-sm font-medium ${
                    holding.gain_loss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(Math.abs(holding.gain_loss))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <span className={`text-sm font-medium ${
                      holding.gain_loss_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatPercentage(holding.gain_loss_percentage)}
                    </span>
                    {holding.gain_loss_percentage >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedHoldings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">
              {searchTerm ? 'No holdings match your search.' : 'No holdings found.'}
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-gold-400 hover:text-gold-300 text-sm transition-colors"
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