import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, MessageSquare, Info } from 'lucide-react';
import HealthScoreCard from './HealthScoreCard';
import CategoryCard from './CategoryCard';
import KeyMetricsPanel from './KeyMetricsPanel';
import UnlockMetricModal from './UnlockMetricModal';
import { apiService } from '../../services/apiService';

interface FinancialHealthDashboardProps {
  userId?: string;
  userName?: string;
  sessionId?: string;
  onSessionExpired?: () => void;
  onToggleAIChat?: () => void;
}

interface HealthCategory {
  score: number;
  max_score: number;
  details: any;
  category: string;
}

interface HealthData {
  overall_score: number;
  potential_score: number;
  score_band: string;
  score_band_color: string;
  completion_percentage: number;
  categories: HealthCategory[];
  unlock_opportunities: any[];
  last_updated: string;
}

const FinancialHealthDashboard: React.FC<FinancialHealthDashboardProps> = ({
  userId,
  userName,
  sessionId,
  onSessionExpired,
  onToggleAIChat
}) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnlockOpportunity, setSelectedUnlockOpportunity] = useState<any>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  useEffect(() => {
    loadHealthData();
  }, [userId, sessionId]);

  const loadHealthData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getFinancialHealth(userId) as any;
      setHealthData(response.data || response);
    } catch (err: any) {
      console.error('Error loading financial health:', err);
      setError(err.message || 'Failed to load financial health data');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockOpportunity = (opportunity: any) => {
    setSelectedUnlockOpportunity(opportunity);
    setIsUnlockModalOpen(true);
  };

  const handleUnlockSubmit = async (submittedData: any) => {
    if (!userId || !selectedUnlockOpportunity) return;
    
    try {
      // Save the submitted data to the backend
      await apiService.updateFinancialHealthData(
        userId, 
        selectedUnlockOpportunity.category, 
        submittedData
      );
      
      // Close modal and refresh data to show updated score
      setIsUnlockModalOpen(false);
      setSelectedUnlockOpportunity(null);
      await loadHealthData();
    } catch (error) {
      console.error('Error updating financial health data:', error);
      // You could add error handling here, like showing a toast message
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Financial Health Score</h1>
            <p className="text-gray-300">Comprehensive analysis of your financial well-being</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-lg border border-gold-500/20 rounded-xl p-6 h-64 animate-pulse">
              <div className="h-4 bg-gold-400/20 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gold-400/20 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gold-400/20 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-black/40 backdrop-blur-lg border border-gold-500/20 rounded-xl p-4 h-32 animate-pulse">
                  <div className="h-4 bg-gold-400/20 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gold-400/20 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gold-400/20 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Financial Health Score</h1>
            <p className="text-gray-300">Comprehensive analysis of your financial well-being</p>
          </div>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadHealthData}
            className="bg-gold-600 hover:bg-gold-700 text-black px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financial Health Score</h1>
          <p className="text-gray-300">
            Your comprehensive financial wellness assessment
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleAIChat}
            className="p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
            title="Ask AI about your health score"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          
          <button
            onClick={loadHealthData}
            className="p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
            title="Refresh health data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <KeyMetricsPanel 
        categories={healthData.categories} 
        overallScore={healthData.overall_score}
      />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Card */}
        <div className="lg:col-span-1">
          <HealthScoreCard 
            healthData={healthData} 
            onUnlockOpportunity={handleUnlockOpportunity}
          />
        </div>
        
        {/* Category Cards Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthData.categories?.map((category, index) => (
              <CategoryCard
                key={index}
                category={category}
                unlockOpportunities={healthData.unlock_opportunities?.filter(
                  opp => opp.category === category.category
                ) || []}
                onUnlockOpportunity={handleUnlockOpportunity}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Unlock Opportunities Section */}
      {healthData.unlock_opportunities?.length > 0 && (
        <div className="bg-black/40 backdrop-blur-lg border border-gold-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gold-400" />
            <h2 className="text-xl font-semibold text-white">Unlock More Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthData.unlock_opportunities?.slice(0, 3).map((opportunity, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gold-500/10 to-amber-600/10 border border-gold-500/30 rounded-lg p-4 cursor-pointer hover:border-gold-400/50 transition-colors"
                onClick={() => handleUnlockOpportunity(opportunity)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm">{opportunity.title}</h3>
                  <span className="text-gold-400 text-xs font-medium">+{opportunity.potential_gain} pts</span>
                </div>
                <p className="text-gray-300 text-xs mb-3">{opportunity.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 capitalize">{opportunity.effort_level} effort</span>
                  <button className="text-gold-400 text-xs font-medium hover:text-gold-300 transition-colors">
                    Unlock →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-white font-semibold mb-2">How Your Score is Calculated</h3>
            <p className="text-gray-300 text-sm mb-3">
              Your financial health score is based on 7 key categories weighted by importance for your life stage and goals.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-400">
              <div>Income & Cash Flow (20pts)</div>
              <div>Asset Allocation (25pts)</div>
              <div>Risk Protection (15pts)</div>
              <div>Liabilities & Credit (10pts)</div>
              <div>Goal Planning (15pts)</div>
              <div>Tax Efficiency (10pts)</div>
              <div>Behavioral Discipline (5pts)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Unlock Modal */}
      {isUnlockModalOpen && selectedUnlockOpportunity && (
        <UnlockMetricModal
          opportunity={selectedUnlockOpportunity}
          onClose={() => setIsUnlockModalOpen(false)}
          onSubmit={handleUnlockSubmit}
        />
      )}
    </div>
  );
};

export default FinancialHealthDashboard;