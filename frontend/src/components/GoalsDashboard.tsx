import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Target, Calendar, TrendingUp, DollarSign, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import DefaultGoalSetup from './DefaultGoalSetup';

interface Goal {
  id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: string;
  category: string;
  progress_percentage: number;
}

interface GoalsDashboardProps {
  goals: Goal[];
  onGoalsChange: (goals: Goal[]) => void;
  userId?: string;
  formatCurrency: (amount: number) => string;
  portfolioValue?: number;
}

interface GoalFormData {
  name: string;
  description: string;
  target_amount: number;
  target_date: string;
  priority: 'high' | 'medium' | 'low';
  category: 'house' | 'retirement' | 'emergency' | 'vacation' | 'car' | 'education' | 'other';
}

const GoalsDashboard: React.FC<GoalsDashboardProps> = ({
  goals,
  onGoalsChange,
  userId,
  formatCurrency,
  portfolioValue = 0
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showDefaultSetup, setShowDefaultSetup] = useState(goals.length === 0);

  // Watch for changes in goals array and show default setup when empty
  React.useEffect(() => {
    if (goals.length === 0 && !showAddForm) {
      setShowDefaultSetup(true);
    }
  }, [goals.length, showAddForm]);
  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    description: '',
    target_amount: 0,
    target_date: '',
    priority: 'medium',
    category: 'other'
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-500/20 border border-red-400/30 backdrop-blur-sm';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border border-yellow-400/30 backdrop-blur-sm';
      case 'low': return 'text-green-400 bg-green-500/20 border border-green-400/30 backdrop-blur-sm';
      default: return 'text-gray-400 bg-gray-500/20 border border-gray-400/30 backdrop-blur-sm';
    }
  };

  const getCategoryIcon = (category: string) => {
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

  const getTimeToGoal = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600', icon: AlertTriangle };
    if (diffDays < 30) return { text: `${diffDays} days`, color: 'text-orange-600', icon: Clock };
    if (diffDays < 365) return { text: `${Math.ceil(diffDays / 30)} months`, color: 'text-blue-600', icon: Calendar };
    return { text: `${Math.ceil(diffDays / 365)} years`, color: 'text-gray-600', icon: Calendar };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGoal: Goal = {
      id: editingGoal ? editingGoal.id : `goal_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      target_amount: formData.target_amount,
      current_amount: editingGoal ? editingGoal.current_amount : 0,
      target_date: formData.target_date,
      priority: formData.priority,
      category: formData.category,
      progress_percentage: editingGoal 
        ? (editingGoal.current_amount / formData.target_amount) * 100 
        : 0
    };

    if (editingGoal) {
      onGoalsChange(goals.map(goal => goal.id === editingGoal.id ? newGoal : goal));
    } else {
      onGoalsChange([...goals, newGoal]);
    }

    resetForm();
  };

  const handleDelete = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      onGoalsChange(goals.filter(goal => goal.id !== goalId));
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description,
      target_amount: goal.target_amount,
      target_date: goal.target_date,
      priority: goal.priority as 'high' | 'medium' | 'low',
      category: goal.category as any
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      target_amount: 0,
      target_date: '',
      priority: 'medium',
      category: 'other'
    });
    setEditingGoal(null);
    setShowAddForm(false);
  };

  const handleDefaultGoalsGenerated = (defaultGoals: Goal[]) => {
    onGoalsChange(defaultGoals);
    setShowDefaultSetup(false);
  };

  const calculateOverallProgress = () => {
    if (goals.length === 0) return { achieved: 0, inProgress: 0, total: 0 };
    
    const achieved = goals.filter(goal => goal.progress_percentage >= 100).length;
    const inProgress = goals.filter(goal => goal.progress_percentage > 0 && goal.progress_percentage < 100).length;
    
    return { achieved, inProgress, total: goals.length };
  };

  const progress = calculateOverallProgress();

  return (
    <div className="space-y-6">
      {/* Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Total Goals
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {progress.total}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full">
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Achieved
              </p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                {progress.achieved}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                In Progress
              </p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">
                {progress.inProgress}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-full">
              <TrendingUp className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Success Rate
              </p>
              <p className="text-3xl font-bold text-purple-400 mt-2">
                {progress.total > 0 ? Math.round((progress.achieved / progress.total) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full">
              <DollarSign className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Goals Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Financial Goals</h2>
        <div className="flex items-center space-x-3">
          {goals.length > 0 && (
            <button
              onClick={() => setShowDefaultSetup(true)}
              className="inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-md text-gray-300 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-all duration-300"
            >
              Setup Default Goals
            </button>
          )}
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Default Goal Setup */}
      {showDefaultSetup && (
        <DefaultGoalSetup
          onGoalsGenerated={handleDefaultGoalsGenerated}
          userId={userId}
          portfolioValue={portfolioValue}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Add/Edit Goal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-white/20 w-96 shadow-lg rounded-md bg-white/10 backdrop-blur-md">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white mb-4">
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 backdrop-blur-sm"
                    placeholder="e.g., House Down Payment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 backdrop-blur-sm"
                    rows={3}
                    placeholder="Brief description of your goal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.target_amount || ''}
                    onChange={(e) => setFormData({ ...formData, target_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 backdrop-blur-sm"
                    placeholder="1000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500 backdrop-blur-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500 backdrop-blur-sm"
                    >
                      <option value="high" className="bg-gray-800 text-white">High</option>
                      <option value="medium" className="bg-gray-800 text-white">Medium</option>
                      <option value="low" className="bg-gray-800 text-white">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500 backdrop-blur-sm"
                    >
                      <option value="house" className="bg-gray-800 text-white">House</option>
                      <option value="retirement" className="bg-gray-800 text-white">Retirement</option>
                      <option value="emergency" className="bg-gray-800 text-white">Emergency Fund</option>
                      <option value="vacation" className="bg-gray-800 text-white">Vacation</option>
                      <option value="car" className="bg-gray-800 text-white">Car</option>
                      <option value="education" className="bg-gray-800 text-white">Education</option>
                      <option value="other" className="bg-gray-800 text-white">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/20">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-gray-300 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-md text-sm font-medium hover:from-pink-500 hover:to-rose-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 && !showDefaultSetup ? (
          <div className="text-center py-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Goals Yet</h3>
            <p className="text-gray-300 mb-4">
              Start by creating your first financial goal to track your progress.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </button>
          </div>
        ) : goals.length > 0 ? (
          goals.map((goal) => {
            const timeInfo = getTimeToGoal(goal.target_date);
            const TimeIcon = timeInfo.icon;

            return (
              <div key={goal.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{getCategoryIcon(goal.category)}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{goal.name}</h3>
                      {goal.description && (
                        <p className="text-gray-300 text-sm mt-1">{goal.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(goal.priority)}`}>
                          {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                        </span>
                        <div className={`flex items-center space-x-1 ${timeInfo.color}`}>
                          <TimeIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{timeInfo.text}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-gray-400 hover:text-blue-400 rounded-md hover:bg-white/10 transition-all duration-300"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-md hover:bg-white/10 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Progress</span>
                      <span className="font-medium text-white">{Math.round(goal.progress_percentage)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          goal.progress_percentage >= 100 
                            ? 'bg-green-400' 
                            : goal.progress_percentage >= 75 
                            ? 'bg-blue-400' 
                            : goal.progress_percentage >= 50 
                            ? 'bg-yellow-400' 
                            : 'bg-red-400'
                        }`}
                        style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Current</p>
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(goal.current_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Remaining</p>
                      <p className="text-lg font-semibold text-orange-400">
                        {formatCurrency(goal.target_amount - goal.current_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Target</p>
                      <p className="text-lg font-semibold text-blue-400">
                        {formatCurrency(goal.target_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : null}
      </div>
    </div>
  );
};

export default GoalsDashboard;