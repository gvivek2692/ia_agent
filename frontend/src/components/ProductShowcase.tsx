import React from 'react';
import { 
  BarChart3, 
  Brain, 
  Target,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const ProductShowcase: React.FC = () => {
  const showcaseFeatures = [
    {
      title: "Smart Portfolio Dashboard",
      description: "Monitor your investments across stocks, mutual funds, and other assets with real-time performance tracking and detailed analytics.",
      image: "/api/placeholder/600/400", // We'll update this with actual screenshot paths
      icon: BarChart3,
      features: [
        "Real-time portfolio valuation",
        "Asset allocation visualization", 
        "Performance tracking",
        "Holdings management"
      ]
    },
    {
      title: "AI-Powered Investment Chat",
      description: "Get personalized investment advice and portfolio insights through intelligent conversations with our GPT-4 powered AI advisor.",
      image: "/api/placeholder/600/400",
      icon: Brain,
      features: [
        "Natural language queries",
        "Portfolio analysis",
        "Market insights",
        "Personalized recommendations"
      ]
    },
    {
      title: "Comprehensive AI Insights",
      description: "Receive detailed portfolio health assessments, goal tracking, and actionable recommendations to optimize your investment strategy.",
      image: "/api/placeholder/600/400", 
      icon: Target,
      features: [
        "Portfolio health scoring",
        "Goal progress tracking",
        "Risk analysis",
        "Market outlook"
      ]
    }
  ];

  return (
    <section id="product-demo" className="py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-600/10 to-rose-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-rose-600/10 to-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-full text-pink-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            See It In Action
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Experience{' '}
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Real-Time
            </span>{' '}
            Portfolio Management
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover how our AI-powered platform transforms the way you manage investments with intelligent insights, 
            comprehensive tracking, and personalized recommendations.
          </p>
        </div>

        {/* Product Features Showcase */}
        <div className="space-y-24">
          {showcaseFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            const isReverse = index % 2 === 1;
            
            return (
              <div key={index} className={`flex flex-col ${isReverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}>
                {/* Content Side */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white">{feature.title}</h3>
                  </div>
                  
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-3">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-gray-300">
                        <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  
                  <button className="inline-flex items-center text-pink-400 hover:text-pink-300 font-semibold transition-colors group">
                    Try This Feature
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                
                {/* Screenshot Side */}
                <div className="flex-1">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-rose-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-4 shadow-2xl">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-auto rounded-xl shadow-lg"
                      />
                      {/* Overlay indicator */}
                      <div className="absolute top-6 left-6 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-300 font-medium">Live Demo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20 pt-20 border-t border-pink-500/20">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Experience AI-Powered Investing?
          </h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            See how our platform can transform your investment strategy with personalized insights and intelligent portfolio management.
          </p>
          <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-2xl hover:from-pink-500 hover:to-rose-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-500/25">
            Start Free Demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;