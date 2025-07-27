/**
 * Demo Financial Goals - Realistic Goals for Young Indian Professional
 * 4 well-defined financial goals with progress tracking
 */

const financialGoals = {
  goals: [
    {
      id: "emergency_fund",
      name: "Emergency Fund",
      description: "Build an emergency fund covering 6 months of expenses",
      category: "Security",
      priority: "High",
      target_amount: 600000, // 6 months × ₹100K expenses
      current_amount: 350000,
      progress_percentage: 58.33,
      target_date: "2024-12-31",
      start_date: "2023-06-01",
      monthly_target: 25000,
      actual_monthly_savings: 20000,
      status: "In Progress",
      timeline: {
        months_elapsed: 13,
        months_remaining: 5,
        total_timeline_months: 18
      },
      milestones: [
        { amount: 150000, date: "2023-09-30", status: "Achieved", achieved_date: "2023-09-15" },
        { amount: 300000, date: "2024-03-31", status: "Achieved", achieved_date: "2024-03-20" },
        { amount: 450000, date: "2024-09-30", status: "Pending" },
        { amount: 600000, date: "2024-12-31", status: "Pending" }
      ],
      notes: "On track to achieve this goal. Current savings rate is slightly below target but manageable.",
      investment_strategy: "High-yield savings account and liquid funds for immediate accessibility"
    },

    {
      id: "house_down_payment",
      name: "House Down Payment",
      description: "Save for down payment of a 2BHK apartment in Bangalore",
      category: "Property",
      priority: "High",
      target_amount: 1500000, // ₹15L down payment for ₹75L property
      current_amount: 425000,
      progress_percentage: 28.33,
      target_date: "2026-12-31",
      start_date: "2023-06-01",
      monthly_target: 35000,
      actual_monthly_savings: 25000,
      status: "In Progress",
      timeline: {
        months_elapsed: 13,
        months_remaining: 29,
        total_timeline_months: 42
      },
      milestones: [
        { amount: 300000, date: "2024-03-31", status: "Achieved", achieved_date: "2024-04-15" },
        { amount: 600000, date: "2024-12-31", status: "Pending" },
        { amount: 900000, date: "2025-06-30", status: "Pending" },
        { amount: 1200000, date: "2026-03-31", status: "Pending" },
        { amount: 1500000, date: "2026-12-31", status: "Pending" }
      ],
      notes: "Slightly behind target but property prices are stable. Consider increasing SIP amounts.",
      investment_strategy: "Balanced mutual funds and debt funds with 3-year target horizon",
      property_details: {
        location: "Electronic City, Bangalore",
        property_type: "2BHK Apartment",
        estimated_cost: 7500000,
        down_payment_percentage: 20,
        loan_amount: 6000000,
        emi_estimate: 55000
      }
    },

    {
      id: "retirement_planning",
      name: "Retirement Corpus",
      description: "Build a retirement corpus for financial independence by age 55",
      category: "Retirement",
      priority: "Medium",
      target_amount: 50000000, // ₹5 Crore target
      current_amount: 785000, // Current investments + EPF + PPF
      progress_percentage: 1.57,
      target_date: "2051-06-01", // At age 55
      start_date: "2023-06-01",
      monthly_target: 15000,
      actual_monthly_savings: 18000, // Through SIPs and EPF
      status: "In Progress",
      timeline: {
        months_elapsed: 13,
        months_remaining: 323, // 27 years
        total_timeline_months: 336
      },
      milestones: [
        { amount: 1000000, date: "2025-06-30", status: "Pending" },
        { amount: 5000000, date: "2030-06-30", status: "Pending" },
        { amount: 15000000, date: "2040-06-30", status: "Pending" },
        { amount: 35000000, date: "2048-06-30", status: "Pending" },
        { amount: 50000000, date: "2051-06-01", status: "Pending" }
      ],
      notes: "Long-term goal with power of compounding. Increase contributions with salary hikes.",
      investment_strategy: "Aggressive equity mutual funds, PPF, EPF, and ELSS for tax benefits",
      assumptions: {
        expected_return: 12, // 12% annual return
        inflation_rate: 6,
        salary_growth_rate: 8,
        retirement_age: 55
      },
      retirement_planning: {
        current_age: 28,
        retirement_age: 55,
        years_to_retirement: 27,
        monthly_expense_at_retirement: 150000, // Inflation adjusted
        annual_expense_at_retirement: 1800000,
        corpus_multiplier: 25 // 4% withdrawal rule
      }
    },

    {
      id: "vacation_fund",
      name: "Europe Vacation",
      description: "Save for a 2-week Europe trip for 2 people",
      category: "Lifestyle",
      priority: "Low",
      target_amount: 400000, // ₹4L for Europe trip
      current_amount: 125000,
      progress_percentage: 31.25,
      target_date: "2025-06-30",
      start_date: "2024-01-01",
      monthly_target: 15000,
      actual_monthly_savings: 12000,
      status: "In Progress",
      timeline: {
        months_elapsed: 6,
        months_remaining: 12,
        total_timeline_months: 18
      },
      milestones: [
        { amount: 100000, date: "2024-06-30", status: "Achieved", achieved_date: "2024-05-15" },
        { amount: 200000, date: "2024-12-31", status: "Pending" },
        { amount: 300000, date: "2025-03-31", status: "Pending" },
        { amount: 400000, date: "2025-06-30", status: "Pending" }
      ],
      notes: "Fun goal to stay motivated. Can be adjusted if other priorities become urgent.",
      investment_strategy: "Short-term debt funds and savings for capital protection",
      vacation_details: {
        destination: "Western Europe (France, Switzerland, Italy)",
        duration: "14 days",
        travelers: 2,
        estimated_costs: {
          flights: 120000,
          accommodation: 140000,
          food_dining: 80000,
          sightseeing: 40000,
          shopping: 20000
        }
      }
    }
  ],

  // Overall Goals Summary
  goals_summary: {
    total_target_amount: 52500000,
    total_current_amount: 1685000,
    overall_progress_percentage: 3.21,
    monthly_savings_target: 90000,
    actual_monthly_savings: 75000,
    goals_on_track: 2,
    goals_behind_schedule: 2,
    next_milestone: {
      goal: "Emergency Fund",
      amount: 450000,
      target_date: "2024-09-30",
      months_remaining: 2
    }
  },

  // Goal Categories Distribution
  categories: {
    security: {
      goals: 1,
      target_amount: 600000,
      current_amount: 350000,
      percentage_of_total: 58.33
    },
    property: {
      goals: 1,
      target_amount: 1500000,
      current_amount: 425000,
      percentage_of_total: 28.33
    },
    retirement: {
      goals: 1,
      target_amount: 50000000,
      current_amount: 785000,
      percentage_of_total: 1.57
    },
    lifestyle: {
      goals: 1,
      target_amount: 400000,
      current_amount: 125000,
      percentage_of_total: 31.25
    }
  }
};

// Helper function to get goal by ID
const getGoalById = (goalId) => {
  return financialGoals.goals.find(goal => goal.id === goalId);
};

// Helper function to get goals by status
const getGoalsByStatus = (status) => {
  return financialGoals.goals.filter(goal => goal.status === status);
};

// Helper function to get goals by priority
const getGoalsByPriority = (priority) => {
  return financialGoals.goals.filter(goal => goal.priority === priority);
};

// Helper function to calculate goal progress
const calculateGoalProgress = (goalId) => {
  const goal = getGoalById(goalId);
  if (!goal) return null;
  
  const progressPercentage = (goal.current_amount / goal.target_amount) * 100;
  const monthlyRequired = (goal.target_amount - goal.current_amount) / goal.timeline.months_remaining;
  const isOnTrack = goal.actual_monthly_savings >= goal.monthly_target * 0.9; // 90% threshold
  
  return {
    current_progress: progressPercentage.toFixed(2),
    amount_remaining: goal.target_amount - goal.current_amount,
    monthly_required: monthlyRequired.toFixed(0),
    is_on_track: isOnTrack,
    months_remaining: goal.timeline.months_remaining
  };
};

// Helper function to get upcoming milestones
const getUpcomingMilestones = () => {
  const allMilestones = [];
  
  financialGoals.goals.forEach(goal => {
    goal.milestones.forEach(milestone => {
      if (milestone.status === "Pending") {
        allMilestones.push({
          goal_name: goal.name,
          goal_id: goal.id,
          ...milestone
        });
      }
    });
  });
  
  return allMilestones.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Add helper functions to export
financialGoals.getGoalById = getGoalById;
financialGoals.getGoalsByStatus = getGoalsByStatus;
financialGoals.getGoalsByPriority = getGoalsByPriority;
financialGoals.calculateGoalProgress = calculateGoalProgress;
financialGoals.getUpcomingMilestones = getUpcomingMilestones;

module.exports = financialGoals;