import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MarketAnalysisProps {
  userId?: string;
}

interface MarketData {
  indices: {
    nifty50: { value: number; change: number; change_percent: number };
    sensex: { value: number; change: number; change_percent: number };
    nifty_bank: { value: number; change: number; change_percent: number };
    nifty_it: { value: number; change: number; change_percent: number };
  };
  sectors: {
    name: string;
    user_exposure?: number;
    performance: number;
    outlook: 'bullish' | 'bearish' | 'neutral';
    recommendation: string;
    reasoning?: string;
    stocks_held?: string;
    impact_on_portfolio?: number;
  }[];
  market_sentiment: {
    score: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    factors: string[];
  };
  portfolio_impact?: {
    total_impact: number;
    positive_impact: number;
    negative_impact: number;
    sector_impacts: any[];
  };
  chart_data: {
    date: string;
    nifty: number;
    sensex: number;
    nifty_bank: number;
    nifty_it: number;
    portfolio?: number;
  }[];
  news_summary: {
    title: string;
    impact: 'positive' | 'negative' | 'neutral';
    source: string;
    relevance?: string;
    reason?: string;
  }[];
  user_specific?: boolean;
}

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ userId }) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<string>('nifty50');
  
  useEffect(() => {
    const loadMarketData = async () => {
      setLoading(true);
      
      try {
        // Fetch real market analysis data from API
        const response = await fetch(`${process.env.REACT_APP_API_URL}/market-analysis?userId=${userId || ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch market analysis data');
        }
        
        const marketAnalysisData = await response.json();
        
        setMarketData(marketAnalysisData);
      } catch (error) {
        console.error('Error loading market data:', error);
        // Fallback to sample data if API fails
        const fallbackData: MarketData = {
          indices: {
            nifty50: { value: 19856.50, change: 245.30, change_percent: 1.25 },
            sensex: { value: 66598.20, change: 823.45, change_percent: 1.25 },
            nifty_bank: { value: 44234.10, change: -156.80, change_percent: -0.35 },
            nifty_it: { value: 29567.30, change: 467.20, change_percent: 1.60 }
          },
          sectors: [
            { name: 'Market Data Error', performance: 0, outlook: 'neutral', recommendation: 'Unable to load personalized data. Please refresh to try again.' }
          ],
          market_sentiment: {
            score: 50,
            trend: 'neutral',
            factors: ['Unable to load market sentiment']
          },
          chart_data: [
            { date: '2024-01-29', nifty: 19856, sensex: 66598, nifty_bank: 44234, nifty_it: 29567 }
          ],
          news_summary: [
            { title: 'Unable to load personalized market news', impact: 'neutral', source: 'System' }
          ]
        };
        setMarketData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    loadMarketData();
  }, [userId]);

  const getChangeIcon = (change: number) => {
    if (change > 0) return ArrowUp;
    if (change < 0) return ArrowDown;
    return Minus;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getIndexDisplayName = (key: string): string => {
    const displayNames: { [key: string]: string } = {
      'nifty50': 'Nifty 50',
      'sensex': 'Sensex',
      'nifty_bank': 'Nifty Bank',
      'nifty_it': 'Nifty IT'
    };
    return displayNames[key] || key;
  };

  const getChartDataKey = (indexKey: string): string => {
    // Map index keys to chart data keys
    const chartKeyMapping: { [key: string]: string } = {
      'nifty50': 'nifty',
      'sensex': 'sensex',
      'nifty_bank': 'nifty_bank',
      'nifty_it': 'nifty_it'
    };
    return chartKeyMapping[indexKey] || 'nifty';
  };

  const getSentimentColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-300 bg-green-500/20 border border-green-400/30';
      case 'bearish': return 'text-red-300 bg-red-500/20 border border-red-400/30';
      case 'neutral': return 'text-yellow-300 bg-yellow-500/20 border border-yellow-400/30';
      default: return 'text-gray-300 bg-gray-500/20 border border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Market Analysis</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-white/10 rounded"></div>
            <div className="h-20 bg-white/10 rounded"></div>
          </div>
          <div className="h-32 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Market Analysis</h3>
        </div>
        <p className="text-gray-300">Unable to load market data</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Market Analysis</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(marketData.market_sentiment.trend)}`}>
          {marketData.market_sentiment.trend.toUpperCase()}
        </div>
      </div>

      {/* Market Indices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(marketData.indices).map(([key, data]) => {
          const ChangeIcon = getChangeIcon(data.change);
          const isSelected = selectedIndex === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedIndex(key)}
              className={`${
                isSelected 
                  ? 'bg-blue-500/20 border-2 border-blue-400/30 ring-2 ring-blue-400/20 backdrop-blur-sm' 
                  : 'bg-white/5 border-2 border-transparent hover:bg-white/10 backdrop-blur-sm'
              } rounded-lg p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                {key.replace('_', ' ').replace('nifty', 'Nifty ')}
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {data.value.toLocaleString()}
              </div>
              <div className={`flex items-center space-x-1 text-sm ${getChangeColor(data.change)}`}>
                <ChangeIcon className="w-3 h-3" />
                <span>{Math.abs(data.change).toFixed(2)}</span>
                <span>({data.change_percent >= 0 ? '+' : ''}{data.change_percent.toFixed(2)}%)</span>
              </div>
              {isSelected && (
                <div className="mt-2 text-xs text-blue-400 font-medium">
                  Showing in chart
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Market Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">
          {getIndexDisplayName(selectedIndex)} Trend (Last 30 Days)
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={marketData.chart_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#D1D5DB' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#D1D5DB' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'white'
                }}
                formatter={(value: number) => [
                  value.toLocaleString(),
                  getIndexDisplayName(selectedIndex)
                ]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey={getChartDataKey(selectedIndex)}
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Performance */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Sector Performance</h4>
        <div className="space-y-2">
          {marketData.sectors.map((sector, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-white">{sector.name}</div>
                <div className="text-xs text-gray-400">{sector.recommendation}</div>
              </div>
              <div className={`flex items-center space-x-2 ${getChangeColor(sector.performance)}`}>
                <span className="font-semibold">
                  {sector.performance >= 0 ? '+' : ''}{sector.performance.toFixed(1)}%
                </span>
                {sector.performance >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Sentiment */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Market Sentiment</h4>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Sentiment Score</span>
            <span className="font-bold text-lg text-white">{marketData.market_sentiment.score}/100</span>
          </div>
          <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                marketData.market_sentiment.score >= 70 ? 'bg-green-500' : 
                marketData.market_sentiment.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${marketData.market_sentiment.score}%` }}
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-400 mb-2">Key Factors:</div>
            {marketData.market_sentiment.factors.map((factor, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs text-gray-300">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market News */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Market News</h4>
        <div className="space-y-2">
          {marketData.news_summary.map((news, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                news.impact === 'positive' ? 'bg-green-500' : 
                news.impact === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{news.title}</div>
                <div className="text-xs text-gray-400 mt-1">Source: {news.source}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;