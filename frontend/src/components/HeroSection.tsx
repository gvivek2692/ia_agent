import React from 'react';
import { ArrowRight, Smartphone, Brain } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-gold-600/20 to-amber-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-amber-600/20 to-gold-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-gold-500/10 to-amber-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-4 h-4 bg-gold-500/60 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-amber-500/60 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-20 w-2 h-2 bg-gold-400/60 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-40 right-10 w-5 h-5 bg-amber-400/60 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
              <span className="text-white block mb-2">Take control of your money and goals</span>
              <span className="bg-gradient-to-r from-gold-600 to-amber-500 bg-clip-text text-transparent">
                in just 2 mins
              </span>
            </h1>
            
            <div className="mb-6">
              <span className="text-gold-400 text-xl font-semibold">
                Powered by SIA (Super Intelligent Agent) framework
              </span>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Know your financial life like never before — with visual financial health scores. See what you own, what you owe, and get ready for what's next.
            </p>

            <div className="flex justify-center lg:justify-start">
              <button
                onClick={onGetStarted}
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-600 text-black font-semibold rounded-2xl hover:from-gold-500 hover:to-amber-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-gold-500/25"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-amber-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative flex justify-center lg:justify-end p-8">
            {/* Phone Mockup */}
            <div className="relative z-20">
              <div className="w-72 h-96 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-2 shadow-2xl border border-gray-700">
                <div className="w-full h-full bg-black rounded-2xl p-4 overflow-hidden">
                  {/* Mock Dashboard Content */}
                  <div className="text-center mb-4">
                    <h3 className="text-white text-sm font-semibold">Financial Health Score</h3>
                  </div>
                  
                  {/* Financial Health Score Circle */}
                  <div className="bg-gradient-to-r from-gold-600/20 to-amber-600/20 rounded-xl h-24 mb-4 flex items-center justify-center">
                    <div className="relative w-16 h-16">
                      <div className="w-16 h-16 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-lg">92</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Stats */}
                  <div className="space-y-3">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-xs">Portfolio Value</span>
                        <span className="text-gold-400 text-sm font-bold">₹24,85,000</span>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-xs">Wealth Score</span>
                        <span className="text-green-400 text-sm font-bold">Excellent</span>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-xs">SIA Insights</span>
                        <span className="text-amber-400 text-sm font-bold">5 Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistant Illustration - Clean Design */}
            <div className="absolute right-0 top-16 z-30">
              <div className="w-24 h-24 bg-gradient-to-r from-gold-500/20 to-amber-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-gold-500/30">
                <Brain className="w-12 h-12 text-gold-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;