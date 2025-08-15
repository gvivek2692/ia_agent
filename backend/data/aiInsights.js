// Import risk calculation function for consistency
const { calculateRiskAnalysis } = require('./riskCalculations');

// Calculate portfolio-specific AI insights based on actual user data
const calculatePortfolioScores = (userContext) => {
  const portfolio = userContext.portfolio;
  const goals = userContext.financial_goals?.goals || [];
  const userProfile = userContext.user_profile || {};
  
  // Portfolio Score (0-100)
  let portfolioScore = 50;
  const totalReturn = ((portfolio.summary.total_current_value - portfolio.summary.total_investment) / portfolio.summary.total_investment) * 100;
  
  // Base score on returns
  if (totalReturn > 15) portfolioScore += 25;
  else if (totalReturn > 12) portfolioScore += 20;
  else if (totalReturn > 8) portfolioScore += 15;
  else if (totalReturn > 5) portfolioScore += 10;
  else if (totalReturn < 0) portfolioScore -= 20;
  
  // Adjust for diversification
  const assetCount = Object.keys(portfolio.summary.asset_allocation).length;
  if (assetCount >= 4) portfolioScore += 10;
  else if (assetCount >= 3) portfolioScore += 5;
  else portfolioScore -= 10;
  
  // Adjust for goal progress
  const completedGoals = goals.filter(g => g.progress_percentage >= 100).length;
  const onTrackGoals = goals.filter(g => g.progress_percentage >= 50 && g.progress_percentage < 100).length;
  portfolioScore += (completedGoals * 5) + (onTrackGoals * 2);
  
  // Use exact same risk calculation as Risk Analysis for consistency
  const riskAnalysisData = calculateRiskAnalysis(userContext);
  const overallRisk = riskAnalysisData.metrics.overall_score;
  
  // Diversification Score (0-100)
  let diversificationScore = 40;
  
  // Asset class diversification
  diversificationScore += Math.min(assetCount * 15, 40);
  
  // Check for over-concentration
  const assetAllocation = portfolio.summary.asset_allocation;
  Object.values(assetAllocation).forEach(data => {
    if (data.percentage > 80) diversificationScore -= 30;
    else if (data.percentage > 60) diversificationScore -= 15;
    else if (data.percentage < 10) diversificationScore += 5; // Good for having smaller allocations
  });
  
  // Market outlook based on recent performance
  let marketOutlook = "neutral";
  if (totalReturn > 15) marketOutlook = "bullish";
  else if (totalReturn < 0) marketOutlook = "bearish";
  
  return {
    portfolio_score: Math.max(0, Math.min(100, Math.round(portfolioScore))),
    risk_score: Math.max(0, Math.min(100, overallRisk)), // Now uses same calculation as Risk Analysis
    diversification_score: Math.max(0, Math.min(100, Math.round(diversificationScore))),
    market_outlook: marketOutlook
  };
};

// Generate comprehensive personalized insights based on user's actual portfolio data
const generatePersonalizedInsights = (userContext) => {
  const insights = [];
  const portfolio = userContext.portfolio;
  const goals = userContext.financial_goals?.goals || [];
  const userProfile = userContext.user_profile || {};
  const assetAllocation = portfolio.summary.asset_allocation;
  const stocks = portfolio.stocks || [];
  const mutualFunds = portfolio.mutual_funds || [];
  
  const totalReturn = ((portfolio.summary.total_current_value - portfolio.summary.total_investment) / portfolio.summary.total_investment) * 100;
  const portfolioValue = portfolio.summary.total_current_value;
  const totalInvestment = portfolio.summary.total_investment;
  const totalGainLoss = portfolio.summary.total_gain_loss;
  
  // 1. PERFORMANCE INSIGHTS
  if (totalReturn > 15) {
    insights.push({
      id: `perf_excellent_${Date.now()}`,
      type: "performance",
      title: "Exceptional Portfolio Performance",
      description: `Outstanding! Your portfolio has generated ${totalReturn.toFixed(1)}% returns, significantly outperforming market benchmarks. Your investment strategy is working exceptionally well.`,
      impact: "high",
      confidence: 92,
      actionable: false,
      data: {
        current_value: `${totalReturn.toFixed(1)}%`,
        target_value: "15.0%",
        change: `+${(totalReturn - 15).toFixed(1)}%`
      },
      generated_at: new Date().toISOString()
    });
  } else if (totalReturn > 12) {
    insights.push({
      id: `perf_good_${Date.now()}`,
      type: "performance",
      title: "Strong Portfolio Performance",
      description: `Great job! Your portfolio has delivered ${totalReturn.toFixed(1)}% returns, beating most market indices and mutual fund benchmarks.`,
      impact: "high",
      confidence: 87,
      actionable: false,
      data: {
        current_value: `${totalReturn.toFixed(1)}%`,
        target_value: "12.0%",
        change: `+${(totalReturn - 12).toFixed(1)}%`
      },
      generated_at: new Date().toISOString()
    });
  } else if (totalReturn > 8) {
    insights.push({
      id: `perf_average_${Date.now()}`,
      type: "performance",
      title: "Moderate Portfolio Performance",
      description: `Your portfolio has generated ${totalReturn.toFixed(1)}% returns, which is decent but has room for improvement. Consider reviewing your asset allocation strategy.`,
      impact: "medium",
      confidence: 78,
      actionable: true,
      recommendation: "Review underperforming investments and consider rebalancing towards growth-oriented assets.",
      generated_at: new Date().toISOString()
    });
  } else if (totalReturn < 5) {
    insights.push({
      id: `perf_poor_${Date.now()}`,
      type: "warning",
      title: "Portfolio Performance Needs Attention",
      description: `Your portfolio returns of ${totalReturn.toFixed(1)}% are below market expectations. This requires immediate review and strategic changes.`,
      impact: "high",
      confidence: 89,
      actionable: true,
      recommendation: "Consider switching to better-performing funds, review expense ratios, and optimize asset allocation.",
      data: {
        current_value: `${totalReturn.toFixed(1)}%`,
        target_value: "8.0%",
        change: `${(totalReturn - 8).toFixed(1)}%`
      },
      generated_at: new Date().toISOString()
    });
  }

  // 2. INDIVIDUAL STOCK PERFORMANCE INSIGHTS
  if (stocks.length > 0) {
    // Identify best and worst performing stocks
    const sortedStocks = [...stocks].sort((a, b) => b.gain_loss_percentage - a.gain_loss_percentage);
    const bestStock = sortedStocks[0];
    const worstStock = sortedStocks[sortedStocks.length - 1];
    
    // Best performing stock insight
    if (bestStock.gain_loss_percentage > 8) {
      insights.push({
        id: `stock_winner_${bestStock.symbol}_${Date.now()}`,
        type: "performance",
        title: `${bestStock.symbol} Delivering Strong Returns`,
        description: `${bestStock.company_name} is your top performer with ${bestStock.gain_loss_percentage.toFixed(1)}% returns, contributing ₹${bestStock.gain_loss.toLocaleString()} to your portfolio gains.`,
        impact: "high",
        confidence: 88,
        actionable: false,
        data: {
          current_value: `${bestStock.gain_loss_percentage.toFixed(1)}%`,
          target_value: "8.0%",
          change: `+${(bestStock.gain_loss_percentage - 8).toFixed(1)}%`
        },
        generated_at: new Date().toISOString()
      });
    }
    
    // Worst performing stock insight
    if (worstStock.gain_loss_percentage < -3) {
      insights.push({
        id: `stock_laggard_${worstStock.symbol}_${Date.now()}`,
        type: "warning",
        title: `${worstStock.symbol} Underperforming Portfolio`,
        description: `${worstStock.company_name} is down ${Math.abs(worstStock.gain_loss_percentage).toFixed(1)}%, causing a loss of ₹${Math.abs(worstStock.gain_loss).toLocaleString()}. Monitor closely for recovery signs.`,
        impact: "medium",
        confidence: 82,
        actionable: true,
        recommendation: `Consider reviewing ${worstStock.company_name}'s fundamentals and recent news. If the outlook remains weak, consider booking losses and reallocating.`,
        data: {
          current_value: `${worstStock.gain_loss_percentage.toFixed(1)}%`,
          target_value: "0%",
          change: `${worstStock.gain_loss_percentage.toFixed(1)}%`
        },
        generated_at: new Date().toISOString()
      });
    }
    
    // Large position insights
    const largePositions = stocks.filter(stock => (stock.current_value / portfolioValue) * 100 > 8);
    largePositions.forEach(stock => {
      const positionPercent = (stock.current_value / portfolioValue) * 100;
      if (positionPercent > 12) {
        insights.push({
          id: `large_position_${stock.symbol}_${Date.now()}`,
          type: "risk",
          title: `High Concentration Risk in ${stock.symbol}`,
          description: `${stock.company_name} represents ${positionPercent.toFixed(1)}% of your portfolio, creating concentration risk in the ${stock.sector} sector.`,
          impact: "medium",
          confidence: 85,
          actionable: true,
          recommendation: `Consider reducing ${stock.symbol} position to below 8% of portfolio through partial profit booking or by increasing other holdings.`,
          data: {
            current_value: `${positionPercent.toFixed(1)}%`,
            target_value: "8%",
            change: `-${(positionPercent - 8).toFixed(1)}%`
          },
          generated_at: new Date().toISOString()
        });
      }
    });
  }

  // 3. SECTOR-SPECIFIC INSIGHTS
  if (stocks.length > 0) {
    // Analyze sector concentration
    const sectorAllocation = {};
    stocks.forEach(stock => {
      const sector = stock.sector || 'Other';
      if (!sectorAllocation[sector]) {
        sectorAllocation[sector] = { value: 0, percentage: 0, stocks: [] };
      }
      sectorAllocation[sector].value += stock.current_value;
      sectorAllocation[sector].stocks.push(stock);
    });
    
    // Calculate sector percentages
    Object.keys(sectorAllocation).forEach(sector => {
      sectorAllocation[sector].percentage = (sectorAllocation[sector].value / portfolioValue) * 100;
    });
    
    // Find dominant sector
    const dominantSector = Object.entries(sectorAllocation)
      .sort(([,a], [,b]) => b.percentage - a.percentage)[0];
    
    if (dominantSector && dominantSector[1].percentage > 25) {
      const [sectorName, sectorData] = dominantSector;
      insights.push({
        id: `sector_concentration_${sectorName}_${Date.now()}`,
        type: "risk",
        title: `Over-Concentration in ${sectorName} Sector`,
        description: `Your ${sectorName} exposure is ${sectorData.percentage.toFixed(1)}% through ${sectorData.stocks.map(s => s.symbol).join(', ')}. This creates sector-specific risk.`,
        impact: "medium",
        confidence: 80,
        actionable: true,
        recommendation: `Diversify across sectors by reducing ${sectorName} exposure and adding holdings in Healthcare, FMCG, or Pharma sectors.`,
        data: {
          current_value: `${sectorData.percentage.toFixed(1)}%`,
          target_value: "20%",
          change: `-${(sectorData.percentage - 20).toFixed(1)}%`
        },
        generated_at: new Date().toISOString()
      });
    }
    
    // IT sector specific insight (common in Indian portfolios)
    const itSector = sectorAllocation['Information Technology'];
    if (itSector && itSector.percentage > 20) {
      insights.push({
        id: `it_sector_risk_${Date.now()}`,
        type: "market",
        title: "IT Sector Concentration Risk",
        description: `Your IT sector allocation of ${itSector.percentage.toFixed(1)}% through ${itSector.stocks.map(s => s.symbol).join(', ')} may be vulnerable to global recession fears and currency fluctuations.`,
        impact: "medium",
        confidence: 78,
        actionable: true,
        recommendation: "Consider reducing IT exposure and increasing allocation to defensive sectors like FMCG, Pharma, and Utilities.",
        generated_at: new Date().toISOString()
      });
    }
  }

  // 4. MUTUAL FUND SPECIFIC INSIGHTS
  if (mutualFunds.length > 0) {
    // Analyze mutual fund performance
    const sortedMFs = [...mutualFunds].sort((a, b) => b.gain_loss_percentage - a.gain_loss_percentage);
    const bestMF = sortedMFs[0];
    const worstMF = sortedMFs[sortedMFs.length - 1];
    
    // Best performing mutual fund
    if (bestMF.gain_loss_percentage > 12) {
      insights.push({
        id: `mf_winner_${bestMF.scheme_code}_${Date.now()}`,
        type: "performance",
        title: `${bestMF.category} Fund Outperforming`,
        description: `Your ${bestMF.scheme_name.split(' - ')[0]} fund is delivering excellent ${bestMF.gain_loss_percentage.toFixed(1)}% returns, significantly beating its benchmark.`,
        impact: "high",
        confidence: 87,
        actionable: true,
        recommendation: `Consider increasing SIP in this well-performing fund from ₹${bestMF.sip_amount?.toLocaleString() || '0'} to maximize returns.`,
        data: {
          current_value: `${bestMF.gain_loss_percentage.toFixed(1)}%`,
          target_value: "12.0%",
          change: `+${(bestMF.gain_loss_percentage - 12).toFixed(1)}%`
        },
        generated_at: new Date().toISOString()
      });
    }
    
    // Underperforming mutual fund
    if (worstMF.gain_loss_percentage < 0) {
      insights.push({
        id: `mf_laggard_${worstMF.scheme_code}_${Date.now()}`,
        type: "warning",
        title: `${worstMF.category} Fund Underperforming`,
        description: `Your ${worstMF.scheme_name.split(' - ')[0]} fund is down ${Math.abs(worstMF.gain_loss_percentage).toFixed(1)}%. This ${worstMF.category} fund may need review.`,
        impact: "medium",
        confidence: 83,
        actionable: true,
        recommendation: `Review fund manager performance and consider switching to a better-performing ${worstMF.category} alternative with lower expense ratio.`,
        data: {
          current_value: `${worstMF.gain_loss_percentage.toFixed(1)}%`,
          target_value: "8.0%",
          change: `${worstMF.gain_loss_percentage.toFixed(1)}%`
        },
        generated_at: new Date().toISOString()
      });
    }
    
    // High SIP amount insight
    const totalSIP = mutualFunds.reduce((sum, mf) => sum + (mf.sip_amount || 0), 0);
    if (totalSIP > 20000) {
      insights.push({
        id: `high_sip_${Date.now()}`,
        type: "performance",
        title: "Excellent SIP Discipline",
        description: `Your total SIP commitment of ₹${totalSIP.toLocaleString()}/month across ${mutualFunds.filter(mf => mf.sip_amount > 0).length} funds shows excellent investment discipline.`,
        impact: "high",
        confidence: 92,
        actionable: false,
        data: {
          current_value: `₹${totalSIP.toLocaleString()}`,
          target_value: `₹15,000`,
          change: `+₹${(totalSIP - 15000).toLocaleString()}`
        },
        generated_at: new Date().toISOString()
      });
    }
    
    // Expense ratio insights
    const highExpenseFunds = mutualFunds.filter(mf => mf.expense_ratio > 1.0);
    if (highExpenseFunds.length > 0) {
      const fund = highExpenseFunds[0];
      insights.push({
        id: `high_expense_${fund.scheme_code}_${Date.now()}`,
        type: "opportunity",
        title: "High Expense Ratio Impact",
        description: `Your ${fund.scheme_name.split(' - ')[0]} fund has a ${fund.expense_ratio}% expense ratio, which may impact long-term returns.`,
        impact: "medium",
        confidence: 78,
        actionable: true,
        recommendation: `Consider switching to direct plans or funds with expense ratios below 0.75% to save on costs over time.`,
        generated_at: new Date().toISOString()
      });
    }
  }

  // 5. ASSET ALLOCATION INSIGHTS
  Object.entries(assetAllocation).forEach(([asset, data]) => {
    const assetName = asset.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (data.percentage > 80) {
      insights.push({
        id: `conc_critical_${asset}_${Date.now()}`,
        type: "warning",
        title: `Critical Over-Concentration in ${assetName}`,
        description: `URGENT: ${assetName} represents ${data.percentage.toFixed(1)}% of your portfolio, creating extreme concentration risk. This violates fundamental diversification principles.`,
        impact: "high",
        confidence: 95,
        actionable: true,
        recommendation: `Immediately reduce ${assetName} allocation to below 60% by diversifying into other asset classes. This is critical for risk management.`,
        data: {
          current_value: `${data.percentage.toFixed(1)}%`,
          target_value: "60%",
          change: `-${(data.percentage - 60).toFixed(1)}%`
        },
        generated_at: new Date().toISOString()
      });
    } else if (data.percentage > 70) {
      insights.push({
        id: `conc_high_${asset}_${Date.now()}`,
        type: "risk",
        title: `High Concentration Risk in ${assetName}`,
        description: `${assetName} comprises ${data.percentage.toFixed(1)}% of your portfolio, which exceeds recommended limits and increases concentration risk during market volatility.`,
        impact: "medium",
        confidence: 85,
        actionable: true,
        recommendation: `Gradually reduce ${assetName} exposure to 50-60% range and diversify into complementary asset classes.`,
        data: {
          current_value: `${data.percentage.toFixed(1)}%`,
          target_value: "55%",
          change: `-${(data.percentage - 55).toFixed(1)}%`
        },
        generated_at: new Date().toISOString()
      });
    }
    
    // Identify missing asset classes
    if (!assetAllocation.hasOwnProperty('international') && data.percentage > 20) {
      insights.push({
        id: `missing_international_${Date.now()}`,
        type: "opportunity",
        title: "Missing International Diversification",
        description: `Your portfolio lacks international exposure, missing out on global growth opportunities and currency diversification benefits.`,
        impact: "medium",
        confidence: 82,
        actionable: true,
        recommendation: "Consider allocating 10-15% to international equity funds or ETFs for global diversification.",
        data: {
          current_value: "0%",
          target_value: "12%",
          change: "+12%"
        },
        generated_at: new Date().toISOString()
      });
    }
  });

  // 6. GOAL-BASED INSIGHTS
  goals.forEach(goal => {
    const targetDate = new Date(goal.target_date);
    const monthsRemaining = Math.max(0, Math.round((targetDate - new Date()) / (1000 * 60 * 60 * 24 * 30)));
    const remainingAmount = goal.target_amount - goal.current_amount;
    const requiredMonthly = remainingAmount / Math.max(monthsRemaining, 1);
    
    if (goal.progress_percentage < 25 && goal.priority === 'high') {
      insights.push({
        id: `goal_critical_${goal.id}_${Date.now()}`,
        type: "warning",
        title: `${goal.name} Severely Behind Schedule`,
        description: `CRITICAL: Your ${goal.name} goal is only ${goal.progress_percentage.toFixed(1)}% complete with ${monthsRemaining} months remaining. Immediate action required.`,
        impact: "high",
        confidence: 95,
        actionable: true,
        recommendation: `Urgently increase monthly investment to ₹${requiredMonthly.toLocaleString()} or reassess goal timeline and target amount.`,
        data: {
          current_value: `₹${goal.current_amount.toLocaleString()}`,
          target_value: `₹${goal.target_amount.toLocaleString()}`,
          change: `₹${remainingAmount.toLocaleString()} needed`
        },
        generated_at: new Date().toISOString()
      });
    } else if (goal.progress_percentage < 50 && goal.priority === 'high') {
      insights.push({
        id: `goal_behind_${goal.id}_${Date.now()}`,
        type: "goal",
        title: `${goal.name} Needs More Attention`,
        description: `Your ${goal.name} goal is ${goal.progress_percentage.toFixed(1)}% complete. To meet your ${targetDate.getFullYear()} target, consider increasing monthly contributions.`,
        impact: "high",
        confidence: 88,
        actionable: true,
        recommendation: `Increase monthly allocation to ₹${Math.round(requiredMonthly).toLocaleString()} to stay on track for your goal.`,
        data: {
          current_value: `₹${goal.current_amount.toLocaleString()}`,
          target_value: `₹${goal.target_amount.toLocaleString()}`,
          change: `₹${remainingAmount.toLocaleString()} remaining`
        },
        generated_at: new Date().toISOString()
      });
    } else if (goal.progress_percentage > 90) {
      insights.push({
        id: `goal_success_${goal.id}_${Date.now()}`,
        type: "performance",
        title: `${goal.name} Almost Achieved!`,
        description: `Excellent progress! Your ${goal.name} goal is ${goal.progress_percentage.toFixed(1)}% complete. You're very close to achieving this milestone.`,
        impact: "high",
        confidence: 92,
        actionable: false,
        data: {
          current_value: `₹${goal.current_amount.toLocaleString()}`,
          target_value: `₹${goal.target_amount.toLocaleString()}`,
          change: `Only ₹${remainingAmount.toLocaleString()} remaining!`
        },
        generated_at: new Date().toISOString()
      });
    }
  });

  // 7. AGE-APPROPRIATE INSIGHTS
  const age = userProfile.age || 30;
  const equityPercentage = Object.entries(assetAllocation)
    .filter(([key]) => key.includes('equity') || key.includes('stock'))
    .reduce((sum, [, data]) => sum + data.percentage, 0);

  if (age < 35 && equityPercentage < 60) {
    insights.push({
      id: `age_equity_low_${Date.now()}`,
      type: "opportunity",
      title: "Conservative Allocation for Young Investor",
      description: `At ${age} years old, your ${equityPercentage.toFixed(1)}% equity allocation might be too conservative. Young investors can benefit from higher equity exposure for long-term wealth creation.`,
      impact: "medium",
      confidence: 80,
      actionable: true,
      recommendation: "Consider increasing equity allocation to 70-80% to maximize long-term growth potential.",
      data: {
        current_value: `${equityPercentage.toFixed(1)}%`,
        target_value: "75%",
        change: `+${(75 - equityPercentage).toFixed(1)}%`
      },
      generated_at: new Date().toISOString()
    });
  } else if (age > 50 && equityPercentage > 70) {
    insights.push({
      id: `age_equity_high_${Date.now()}`,
      type: "risk",
      title: "High Risk for Pre-Retirement Age",
      description: `At ${age} years old, your ${equityPercentage.toFixed(1)}% equity allocation might be too aggressive. Consider gradually reducing risk as you approach retirement.`,
      impact: "medium",
      confidence: 83,
      actionable: true,
      recommendation: "Gradually shift to a more balanced 60-40 or 50-50 equity-debt allocation for capital preservation.",
      data: {
        current_value: `${equityPercentage.toFixed(1)}%`,
        target_value: "60%",
        change: `-${(equityPercentage - 60).toFixed(1)}%`
      },
      generated_at: new Date().toISOString()
    });
  }

  // 8. PORTFOLIO SIZE INSIGHTS
  if (portfolioValue < 100000) {
    insights.push({
      id: `portfolio_small_${Date.now()}`,
      type: "opportunity",
      title: "Building Your Wealth Foundation",
      description: `Your current portfolio value of ₹${portfolioValue.toLocaleString()} is a good start! Focus on consistent SIP investments to accelerate wealth building.`,
      impact: "medium",
      confidence: 85,
      actionable: true,
      recommendation: "Increase SIP amounts and maintain disciplined investing to reach ₹5L milestone faster.",
      generated_at: new Date().toISOString()
    });
  } else if (portfolioValue > 1000000 && portfolioValue < 5000000) {
    insights.push({
      id: `portfolio_growing_${Date.now()}`,
      type: "performance",
      title: "Strong Wealth Accumulation Progress",
      description: `Impressive! Your portfolio of ₹${(portfolioValue/100000).toFixed(1)}L demonstrates excellent wealth building discipline. You're on track for financial independence.`,
      impact: "high",
      confidence: 88,
      actionable: false,
      generated_at: new Date().toISOString()
    });
  }

  // 9. DIVERSIFICATION INSIGHTS
  const assetCount = Object.keys(assetAllocation).length;
  if (assetCount < 3) {
    insights.push({
      id: `diversification_poor_${Date.now()}`,
      type: "risk",
      title: "Insufficient Portfolio Diversification",
      description: `Your portfolio is spread across only ${assetCount} asset classes, which increases concentration risk. Proper diversification requires multiple asset classes.`,
      impact: "medium",
      confidence: 87,
      actionable: true,
      recommendation: "Add international equity, gold, and debt funds to improve diversification and reduce overall portfolio risk.",
      generated_at: new Date().toISOString()
    });
  } else if (assetCount >= 5) {
    insights.push({
      id: `diversification_good_${Date.now()}`,
      type: "performance",
      title: "Excellent Portfolio Diversification",
      description: `Great diversification across ${assetCount} asset classes! This balanced approach helps manage risk while maintaining growth potential.`,
      impact: "medium",
      confidence: 85,
      actionable: false,
      generated_at: new Date().toISOString()
    });
  }

  return insights.slice(0, 12); // Limit to 12 insights
};

// Main function to generate complete AI insights for a user
const generateCompleteAIInsights = (userContext) => {
  const scores = calculatePortfolioScores(userContext);
  const insights = generatePersonalizedInsights(userContext);
  
  return {
    insights: insights,
    portfolio_score: scores.portfolio_score,
    risk_score: scores.risk_score,
    diversification_score: scores.diversification_score,
    market_outlook: scores.market_outlook,
    next_review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_updated: new Date().toISOString()
  };
};

module.exports = {
  calculatePortfolioScores,
  generatePersonalizedInsights,
  generateCompleteAIInsights
};