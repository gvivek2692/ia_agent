import React from 'react';
import { 
  Bell, 
  PieChart, 
  Lightbulb, 
  CheckCircle
} from 'lucide-react';

const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Bell,
      title: "24/7 Portfolio Guardian",
      description: "SIA guards your portfolio round the clock, delivers rebalancing nudges as market dynamics shift, and adjusts automatically to maintain optimal asset allocation.",
      gradient: "from-gold-500 to-amber-500",
      bgGradient: "from-gold-500/10 to-amber-500/10",
      borderGradient: "from-gold-500/20 to-amber-500/20"
    },
    {
      icon: PieChart,
      title: "Instant Action Plans",
      description: "Invest with an instant action plan—and see your progress live. No more waiting for quarterly reviews or wealth manager approvals.",
      gradient: "from-amber-500 to-gold-500",
      bgGradient: "from-amber-500/10 to-gold-500/10",
      borderGradient: "from-amber-500/20 to-gold-500/20"
    },
    {
      icon: Lightbulb,
      title: "Financial Health X-Ray",
      description: "Know your financial life like never before with comprehensive health scores and visual analytics. Complete transparency, instant insights.",
      gradient: "from-amber-600 to-gold-600",
      bgGradient: "from-amber-600/10 to-gold-600/10",
      borderGradient: "from-amber-600/20 to-gold-600/20"
    }
  ];


  return (
    <section className="relative py-24 bg-gradient-to-b from-black to-gray-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-gold-600/10 to-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-amber-600/10 to-gold-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gold-500/10 to-amber-500/10 border border-gold-500/20 rounded-full text-gold-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Core Features
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Boost your returns with{' '}
            <span className="bg-gradient-to-r from-gold-400 to-amber-400 bg-clip-text text-transparent">
              SIA-powered intelligence
            </span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
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
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gold-300 transition-colors">
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