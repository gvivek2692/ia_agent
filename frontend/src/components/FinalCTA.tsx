import React from 'react';
import { ArrowRight, Brain, Smartphone, Sparkles } from 'lucide-react';

interface FinalCTAProps {
  onGetStarted: () => void;
}

const FinalCTA: React.FC<FinalCTAProps> = ({ onGetStarted }) => {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gold-500/10 to-amber-500/10 border border-gold-500/20 rounded-full text-gold-300 text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Elite Investor Circle
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Become part of our mission to help you{' '}
              <span className="bg-gradient-to-r from-gold-400 to-amber-400 bg-clip-text text-transparent">
                invest like the top 1%
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Boost your returns by investing in SIA-powered personalized portfolios. Join the elite circle of intelligent investors who've taken control from wealth managers.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={onGetStarted}
                className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-gold-600 to-amber-600 text-black font-bold rounded-2xl hover:from-gold-500 hover:to-amber-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-gold-500/25 text-lg"
              >
                Join Elite Circle
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-amber-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
              </button>
              
              <div className="flex items-center text-gray-400 text-sm">
                <span>✓ Zero management fees</span>
                <span className="mx-2">•</span>
                <span>✓ Start in 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Glowing AI Assistant Silhouette */}
            <div className="relative p-8">
              <div className="w-80 h-80 bg-gradient-to-br from-gold-500/30 to-amber-500/30 rounded-full backdrop-blur-xl border border-gold-500/50 shadow-2xl flex items-center justify-center">
                {/* Inner Glow */}
                <div className="w-64 h-64 bg-gradient-to-br from-gold-600/20 to-amber-600/20 rounded-full backdrop-blur-lg border border-gold-400/30 flex items-center justify-center">
                  {/* AI Brain Icon */}
                  <div className="w-32 h-32 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                    <Brain className="w-16 h-16 text-black" />
                  </div>
                </div>
              </div>

              {/* Device Mockup Overlay */}
              <div className="absolute bottom-0 right-0 z-10">
                <div className="w-40 h-52 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-2 shadow-xl border border-gray-700">
                  <div className="w-full h-full bg-black rounded-xl p-3 overflow-hidden">
                    {/* Mock App Interface */}
                    <div className="text-center mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-black" />
                      </div>
                      <h4 className="text-white text-xs font-semibold">SIA Assistant</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-gray-800 rounded-lg p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 text-xs">Portfolio</span>
                          <span className="text-gold-400 text-xs font-bold">₹25L+</span>
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 text-xs">Goals</span>
                          <span className="text-green-400 text-xs font-bold">Top 1%</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-gold-600/20 to-amber-600/20 rounded-lg p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white text-xs">Elite Status</span>
                          <span className="text-gold-400 text-xs font-bold">Achieved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Action Bubbles - Safer Positioning */}
              <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl backdrop-blur-sm border border-green-500/30 flex items-center justify-center animate-bounce delay-300 z-20">
                <span className="text-green-400 text-xs font-bold">+12%</span>
              </div>

              <div className="absolute bottom-12 left-16 w-20 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl backdrop-blur-sm border border-blue-500/30 flex items-center justify-center animate-bounce delay-700 z-20">
                <span className="text-blue-400 text-xs font-bold">Goal Hit!</span>
              </div>

              <div className="absolute top-20 right-4 w-14 h-14 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full backdrop-blur-sm border border-purple-500/30 flex items-center justify-center animate-bounce delay-1000 z-20">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;