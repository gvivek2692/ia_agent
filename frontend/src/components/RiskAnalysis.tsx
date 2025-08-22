import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Target,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface RiskAnalysisProps {
  userId?: string;
}

interface RiskMetrics {
  overall_score: number;
  risk_level: 'conservative' | 'moderate' | 'aggressive';
  volatility_score: number;
  concentration_risk: number;
  sector_risk: number;
  credit_risk: number;
  liquidity_risk: number;
  currency_risk: number;
}

interface RiskFactor {
  name: string;
  score: number;
  status: 'good' | 'moderate' | 'high';
  description: string;
  recommendation?: string;
}

interface VaRAnalysis {
  daily_var_95: number;
  daily_var_99: number;
  monthly_var_95: number;
  max_drawdown: number;
  sharpe_ratio: number;
  beta: number;
}

interface RiskData {
  metrics: RiskMetrics;
  factors: RiskFactor[];
  var_analysis: VaRAnalysis;
  stress_test: {
    scenario: string;
    impact: number;
    probability: string;
  }[];
  radar_data: {
    category: string;
    current: number;
    optimal: number;
  }[];
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ userId }) => {
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'factors' | 'stress'>('overview');

  useEffect(() => {
    const loadRiskData = async () => {
      setLoading(true);
      
      try {
        // Fetch real risk analysis data from API
        const response = await fetch(`${process.env.REACT_APP_API_URL}/risk-analysis?userId=${userId || ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch risk analysis data');
        }
        
        const riskAnalysisData = await response.json();
        
        // Transform the API response to match our component interface
        const transformedData: RiskData = {
          metrics: riskAnalysisData.metrics,
          factors: riskAnalysisData.factors,
          var_analysis: riskAnalysisData.var_analysis,
          stress_test: riskAnalysisData.stress_test,
          radar_data: riskAnalysisData.radar_data
        };

        setRiskData(transformedData);
      } catch (error) {
        console.error('Error loading risk data:', error);
        // Fallback to sample data if API fails
        const fallbackData: RiskData = {
          metrics: {
            overall_score: 50,
            risk_level: 'moderate',
            volatility_score: 50,
            concentration_risk: 50,
            sector_risk: 50,
            credit_risk: 50,
            liquidity_risk: 50,
            currency_risk: 50
          },
          factors: [
            {
              name: 'Risk Analysis',
              score: 50,
              status: 'moderate',
              description: 'Unable to load personalized risk data',
              recommendation: 'Please refresh to try again'
            }
          ],
          var_analysis: {
            daily_var_95: 0,
            daily_var_99: 0,
            monthly_var_95: 0,
            max_drawdown: 0,
            sharpe_ratio: 0,
            beta: 0
          },
          stress_test: [],
          radar_data: []
        };
        setRiskData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    loadRiskData();
  }, [userId]);

  const getRiskColor = (score: number) => {
    if (score <= 40) return 'text-green-600';
    if (score <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBackground = (score: number) => {
    if (score <= 40) return 'bg-green-50 border-green-200';
    if (score <= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return CheckCircle2;
      case 'moderate': return AlertTriangle;
      case 'high': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Risk Analysis</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-white/10 rounded-lg"></div>
          <div className="h-32 bg-white/10 rounded-lg"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-white/10 rounded-lg"></div>
            <div className="h-16 bg-white/10 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Risk Analysis</h3>
        </div>
        <p className="text-gray-300">Unable to load risk analysis data</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Risk Analysis</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBackground(riskData.metrics.overall_score)} backdrop-blur-sm`}>
          {riskData.metrics.risk_level.toUpperCase()} RISK
        </div>
      </div>

      {/* Overall Risk Score */}
      <div className={`rounded-lg p-4 mb-6 ${getRiskBackground(riskData.metrics.overall_score)} backdrop-blur-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Overall Risk Score</p>
            <p className={`text-3xl font-bold ${getRiskColor(riskData.metrics.overall_score)}`}>
              {riskData.metrics.overall_score}/100
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {riskData.metrics.overall_score <= 40 ? 'Low Risk - Conservative' :
               riskData.metrics.overall_score <= 70 ? 'Moderate Risk - Balanced' : 'High Risk - Aggressive'}
            </p>
          </div>
          <div className="h-20 w-20">
            <div className="relative">
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke={riskData.metrics.overall_score <= 40 ? '#10b981' :
                         riskData.metrics.overall_score <= 70 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - riskData.metrics.overall_score / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{riskData.metrics.overall_score}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-white/20">
          <nav className="-mb-px flex space-x-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'factors', label: 'Risk Factors' },
              { id: 'stress', label: 'Stress Test' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-white/30'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Risk Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(riskData.metrics).filter(([key]) => key !== 'overall_score' && key !== 'risk_level').map(([key, value]) => (
              <div key={key} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className={`text-lg font-bold ${getRiskColor(value)}`}>
                  {value}/100
                </div>
                <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      value <= 40 ? 'bg-green-500' : value <= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* VaR Analysis */}
          <div>
            <h4 className="font-semibold text-white mb-3">Value at Risk (VaR) Analysis</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-sm font-medium text-blue-300">Daily VaR (95%)</div>
                <div className="text-xl font-bold text-blue-400">{riskData.var_analysis.daily_var_95}%</div>
                <div className="text-xs text-blue-200">Maximum daily loss</div>
              </div>
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-sm font-medium text-purple-300">Sharpe Ratio</div>
                <div className="text-xl font-bold text-purple-400">{riskData.var_analysis.sharpe_ratio}</div>
                <div className="text-xs text-purple-200">Risk-adjusted return</div>
              </div>
              <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-sm font-medium text-orange-300">Beta</div>
                <div className="text-xl font-bold text-orange-400">{riskData.var_analysis.beta}</div>
                <div className="text-xs text-orange-200">Market correlation</div>
              </div>
            </div>
          </div>

          {/* Risk Radar Chart */}
          <div>
            <h4 className="font-semibold text-white mb-3">Risk Profile Radar</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={riskData.radar_data}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Optimal"
                    dataKey="optimal"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-gray-300">Current Risk</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Optimal Risk</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'factors' && (
        <div className="space-y-4">
          {riskData.factors.map((factor, index) => {
            const StatusIcon = getStatusIcon(factor.status);
            return (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <StatusIcon className={`w-5 h-5 mt-0.5 ${getStatusColor(factor.status)}`} />
                    <div>
                      <h5 className="font-semibold text-white">{factor.name}</h5>
                      <p className="text-sm text-gray-300 mt-1">{factor.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getRiskColor(factor.score)}`}>
                      {factor.score}
                    </div>
                    <div className="text-xs text-gray-400">Risk Score</div>
                  </div>
                </div>
                
                {factor.recommendation && (
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 mt-3 backdrop-blur-sm">
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-300">Recommendation</p>
                        <p className="text-sm text-blue-200 mt-1">{factor.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'stress' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Stress Test Scenarios</h4>
            <p className="text-sm text-gray-300 mb-4">
              How your portfolio might perform under various market stress conditions
            </p>
          </div>
          
          <div className="space-y-3">
            {riskData.stress_test.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-white">{test.scenario}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Probability: {test.probability}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    test.impact < -15 ? 'text-red-600' : 
                    test.impact < -5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {test.impact}%
                  </div>
                  <div className="text-xs text-gray-400">Portfolio Impact</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-yellow-300">Risk Management Tip</h5>
                <p className="text-sm text-yellow-200 mt-1">
                  Your portfolio shows moderate resilience to market stress. Consider increasing emergency fund 
                  allocation and diversifying across uncorrelated assets to improve downside protection.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAnalysis;