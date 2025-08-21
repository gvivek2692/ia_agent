import React from 'react';
import { 
  TrendingUp, 
  PieChart, 
  Target, 
  Shield, 
  Brain, 
  Smartphone,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';

const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get personalized investment recommendations based on your risk profile, goals, and market analysis.",
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-500/10 to-rose-500/10",
      borderGradient: "from-pink-500/20 to-rose-500/20"
    },
    {
      icon: PieChart,
      title: "Portfolio Tracking",
      description: "Monitor your investments across stocks, mutual funds, and other assets in one unified dashboard.",
      gradient: "from-rose-500 to-pink-500",
      bgGradient: "from-rose-500/10 to-pink-500/10",
      borderGradient: "from-rose-500/20 to-pink-500/20"
    },
    {
      icon: Target,
      title: "Goal-Based Planning",
      description: "Set financial goals and get strategic roadmaps to achieve them with timeline and investment suggestions.",
      gradient: "from-pink-600 to-rose-600",
      bgGradient: "from-pink-600/10 to-rose-600/10",
      borderGradient: "from-pink-600/20 to-rose-600/20"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Intelligent risk assessment with alerts and recommendations to protect your portfolio during market volatility.",
      gradient: "from-rose-600 to-pink-600",
      bgGradient: "from-rose-600/10 to-pink-600/10",
      borderGradient: "from-rose-600/20 to-pink-600/20"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Detailed analysis of your portfolio performance with benchmarking against market indices and peer comparisons.",
      gradient: "from-pink-500 to-purple-600",
      bgGradient: "from-pink-500/10 to-purple-600/10",
      borderGradient: "from-pink-500/20 to-purple-600/20"
    },
    {
      icon: Smartphone,
      title: "Real-Time Updates",
      description: "Stay informed with real-time market data, portfolio updates, and personalized notifications on all devices.",
      gradient: "from-rose-500 to-purple-600",
      bgGradient: "from-rose-500/10 to-purple-600/10",
      borderGradient: "from-rose-500/20 to-purple-600/20"
    }
  ];

  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Happy Users",
      description: "Investors trust our platform"
    },
    {
      icon: DollarSign,
      value: "₹100Cr+",
      label: "Assets Tracked",
      description: "Portfolio value monitored"
    },
    {
      icon: TrendingUp,
      value: "15%+",
      label: "Average Returns",
      description: "User portfolio performance"
    },
    {
      icon: Clock,
      value: "99.9%",
      label: "Uptime",
      description: "Reliable service guaranteed"
    }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-black to-gray-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-600/10 to-rose-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-rose-600/10 to-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-full text-pink-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Powerful Features
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Grow Your Wealth
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From AI-powered insights to comprehensive portfolio tracking, our platform provides 
            all the tools you need for successful wealth management.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className={`group relative p-8 bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm border border-gradient-to-br ${feature.borderGradient} rounded-3xl hover:scale-105 transition-all duration-500 hover:shadow-2xl`}
                style={{
                  background: `linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(190, 24, 93, 0.05) 100%)`,
                  borderImage: `linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(190, 24, 93, 0.2)) 1`
                }}
              >
                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-300 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-4">
            Trusted by Thousands of{' '}
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Smart Investors
            </span>
          </h3>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join a growing community of successful investors who are maximizing their wealth with our AI-powered platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="group text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <div className="text-3xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">
                  {stat.value}
                </div>
                
                <div className="text-lg font-semibold text-pink-300 mb-1">
                  {stat.label}
                </div>
                
                <div className="text-sm text-gray-400">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-2xl hover:from-pink-500 hover:to-rose-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 cursor-pointer">
            <AlertCircle className="w-5 h-5 mr-2" />
            Start Building Your Wealth Today
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;