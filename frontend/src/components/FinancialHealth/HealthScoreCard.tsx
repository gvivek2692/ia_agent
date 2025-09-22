import React from 'react';
import { TrendingUp, Award, Target, Unlock } from 'lucide-react';

interface HealthScoreCardProps {
  healthData: {
    overall_score: number;
    potential_score: number;
    score_band: string;
    score_band_color: string;
    completion_percentage: number;
    unlock_opportunities: any[];
    last_updated: string;
  };
  onUnlockOpportunity: (opportunity: any) => void;
}

const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  healthData,
  onUnlockOpportunity
}) => {
  const { overall_score, potential_score, score_band, score_band_color, unlock_opportunities } = healthData;
  
  // Calculate the circumference for the circular progress
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (overall_score / 100) * circumference;
  
  // Get top unlock opportunity
  const topUnlockOpportunity = unlock_opportunities.length > 0 ? unlock_opportunities[0] : null;
  const totalUnlockablePoints = unlock_opportunities.reduce((sum, opp) => sum + opp.potential_gain, 0);

  const getScoreBandInfo = (band: string) => {
    switch (band) {
      case 'Excellent':
        return {
          description: 'Outstanding financial health',
          icon: Award,
          bgGradient: 'from-green-500/20 to-emerald-600/20',
          borderColor: 'border-green-500/40'
        };
      case 'Good':
        return {
          description: 'Strong financial foundation',
          icon: TrendingUp,
          bgGradient: 'from-blue-500/20 to-cyan-600/20',
          borderColor: 'border-blue-500/40'
        };
      case 'Average':
        return {
          description: 'Room for improvement',
          icon: Target,
          bgGradient: 'from-yellow-500/20 to-amber-600/20',
          borderColor: 'border-yellow-500/40'
        };
      default:
        return {
          description: 'Needs attention',
          icon: Target,
          bgGradient: 'from-red-500/20 to-pink-600/20',
          borderColor: 'border-red-500/40'
        };
    }
  };

  const scoreBandInfo = getScoreBandInfo(score_band);
  const ScoreBandIcon = scoreBandInfo.icon;

  return (
    <div className={`bg-gradient-to-br ${scoreBandInfo.bgGradient} backdrop-blur-lg border ${scoreBandInfo.borderColor} rounded-xl p-6 h-full`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Overall Health Score</h2>
          <p className="text-sm text-gray-300">Your financial wellness rating</p>
        </div>
        <ScoreBandIcon className="w-6 h-6" style={{ color: score_band_color }} />
      </div>

      {/* Circular Progress Score */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-700"
            />
            
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke={score_band_color}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Score in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{overall_score}</div>
              <div className="text-sm text-gray-400">out of 100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Band */}
      <div className="text-center mb-6">
        <div 
          className="text-xl font-bold mb-1"
          style={{ color: score_band_color }}
        >
          {score_band}
        </div>
        <p className="text-sm text-gray-300">{scoreBandInfo.description}</p>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Current Score</span>
          <span className="text-sm font-medium text-white">{overall_score} points</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Potential Score</span>
          <span className="text-sm font-medium text-gray-400">{potential_score} points</span>
        </div>
        
        {totalUnlockablePoints > 0 && (
          <div className="flex items-center justify-between border-t border-gray-600 pt-3">
            <span className="text-sm text-amber-400">Available to Unlock</span>
            <span className="text-sm font-medium text-amber-400">+{totalUnlockablePoints} points</span>
          </div>
        )}
      </div>

      {/* Top Unlock Opportunity */}
      {topUnlockOpportunity && (
        <div className="bg-black/30 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Unlock className="w-5 h-5 text-amber-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white mb-1">Quick Win Available</h3>
              <p className="text-xs text-gray-300 mb-3">{topUnlockOpportunity.description}</p>
              
              <button
                onClick={() => onUnlockOpportunity(topUnlockOpportunity)}
                className="w-full bg-gradient-to-r from-amber-600 to-gold-600 text-black text-sm font-medium py-2 px-4 rounded-lg hover:from-amber-500 hover:to-gold-500 transition-all duration-300 transform hover:scale-105"
              >
                Unlock +{topUnlockOpportunity.potential_gain} Points
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Score Ranges Guide */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Score Guide</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-green-400">85-100</span>
            <span className="text-gray-400">Excellent</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-400">70-84</span>
            <span className="text-gray-400">Good</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-yellow-400">55-69</span>
            <span className="text-gray-400">Average</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-red-400">0-54</span>
            <span className="text-gray-400">Needs Work</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthScoreCard;