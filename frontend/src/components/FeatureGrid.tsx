import React from 'react';
import { 
  PieChart, 
  Shield, 
  Brain, 
  Smartphone,
  CheckCircle
} from 'lucide-react';

const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Financial Health Coach",
      description: "Get personalized guidance on building emergency funds, improving savings habits, and achieving financial independence.",
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-500/10 to-rose-500/10",
      borderGradient: "from-pink-500/20 to-rose-500/20"
    },
    {
      icon: PieChart,
      title: "Comprehensive Tracking",
      description: "Monitor investments, track spending patterns, and visualize your financial health journey in one unified dashboard.",
      gradient: "from-rose-500 to-pink-500",
      bgGradient: "from-rose-500/10 to-pink-500/10",
      borderGradient: "from-rose-500/20 to-pink-500/20"
    },
    {
      icon: Shield,
      title: "Risk Mitigation & Emergency Planning",
      description: "Build robust emergency funds, assess financial risks, and protect your financial stability during uncertain times.",
      gradient: "from-rose-600 to-pink-600",
      bgGradient: "from-rose-600/10 to-pink-600/10",
      borderGradient: "from-rose-600/20 to-pink-600/20"
    },
    {
      icon: Smartphone,
      title: "Smart Financial News (Coming Soon)",
      description: "Stay informed with AI-curated financial news relevant to your goals, plus expense tracking and bank connections.",
      gradient: "from-rose-500 to-purple-600",
      bgGradient: "from-rose-500/10 to-purple-600/10",
      borderGradient: "from-rose-500/20 to-purple-600/20"
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
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Financial Health
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From AI-powered insights to habit building tools, our platform provides 
            comprehensive financial health management with smart tracking and guidance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
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

      </div>
    </section>
  );
};

export default FeatureGrid;