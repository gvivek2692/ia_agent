import React from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: string;
  category: string;
  progress_percentage: number;
}

interface GoalsProgressProps {
  goals: Goal[];
  formatCurrency: (amount: number) => string;
  onViewAllGoals?: () => void;
}

const GoalsProgress: React.FC<GoalsProgressProps> = ({ 
  goals, 
  formatCurrency, 
  onViewAllGoals 
}) => {
  const getTimeToGoal = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400', urgent: true };
    if (diffDays < 30) return { text: `${diffDays}d left`, color: 'text-orange-400', urgent: true };
    if (diffDays < 365) return { text: `${Math.ceil(diffDays / 30)}m left`, color: 'text-blue-400', urgent: false };
    return { text: `${Math.ceil(diffDays / 365)}y left`, color: 'text-gray-400', urgent: false };
  };

  const getCategoryEmoji = (category: string) => {
    switch (category.toLowerCase()) {
      case 'house': return '🏠';
      case 'retirement': return '🏖️';
      case 'emergency': return '🚨';
      case 'vacation': return '✈️';
      case 'car': return '🚗';
      case 'education': return '🎓';
      default: return '🎯';
    }
  };

  const getProgressColor = (progress: number, urgent: boolean) => {
    if (progress >= 100) return 'bg-green-500';
    if (urgent && progress < 50) return 'bg-red-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getProgressStatus = (progress: number, urgent: boolean) => {
    if (progress >= 100) return { text: 'Achieved', icon: CheckCircle2, color: 'text-green-400' };
    if (urgent && progress < 50) return { text: 'At Risk', icon: AlertTriangle, color: 'text-red-400' };
    if (progress >= 75) return { text: 'On Track', icon: TrendingUp, color: 'text-blue-400' };
    return { text: 'In Progress', icon: Clock, color: 'text-yellow-400' };
  };

  // Sort goals by urgency and progress
  const sortedGoals = [...goals].sort((a, b) => {
    const aTime = getTimeToGoal(a.target_date);
    const bTime = getTimeToGoal(b.target_date);
    
    // Prioritize urgent goals
    if (aTime.urgent && !bTime.urgent) return -1;
    if (!aTime.urgent && bTime.urgent) return 1;
    
    // Then by progress (lower progress first for urgent goals)
    if (aTime.urgent && bTime.urgent) {
      return a.progress_percentage - b.progress_percentage;
    }
    
    // Normal goals by progress (higher progress first)
    return b.progress_percentage - a.progress_percentage;
  });

  const topGoals = sortedGoals.slice(0, 3); // Show top 3 goals

  if (goals.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Financial Goals</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-300 mb-4">No financial goals set yet</p>
          {onViewAllGoals && (
            <button
              onClick={onViewAllGoals}
              className="bg-gradient-to-r from-gold-600 to-amber-600 text-white px-6 py-3 rounded-2xl hover:from-gold-500 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-gold-500/25"
            >
              Set Your Goals
            </button>
          )}
        </div>
      </div>
    );
  }

  const overallStats = {
    achieved: goals.filter(g => g.progress_percentage >= 100).length,
    onTrack: goals.filter(g => g.progress_percentage >= 75 && g.progress_percentage < 100).length,
    atRisk: goals.filter(g => {
      const timeInfo = getTimeToGoal(g.target_date);
      return timeInfo.urgent && g.progress_percentage < 50;
    }).length
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Goal Progress</h3>
            <p className="text-sm text-gray-400">{goals.length} active goals</p>
          </div>
        </div>
        {onViewAllGoals && (
          <button
            onClick={onViewAllGoals}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{overallStats.achieved}</div>
            <div className="text-xs text-green-300">Achieved</div>
          </div>
        </div>
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{overallStats.onTrack}</div>
            <div className="text-xs text-blue-300">On Track</div>
          </div>
        </div>
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{overallStats.atRisk}</div>
            <div className="text-xs text-red-300">At Risk</div>
          </div>
        </div>
      </div>

      {/* Top Goals */}
      <div className="space-y-4">
        {topGoals.map((goal) => {
          const timeInfo = getTimeToGoal(goal.target_date);
          const status = getProgressStatus(goal.progress_percentage, timeInfo.urgent);
          const StatusIcon = status.icon;

          return (
            <div key={goal.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{getCategoryEmoji(goal.category)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">{goal.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-400">
                        {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
                      </span>
                      <span className={`text-xs ${timeInfo.color}`}>
                        {timeInfo.text}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 ${status.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">{status.text}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(goal.progress_percentage, timeInfo.urgent)}`}
                    style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                  />
                </div>
                <div className="absolute right-0 top-0 -mt-5">
                  <span className="text-xs font-medium text-white">
                    {goal.progress_percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length > 3 && onViewAllGoals && (
        <div className="mt-4 text-center">
          <button
            onClick={onViewAllGoals}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            +{goals.length - 3} more goals
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalsProgress;