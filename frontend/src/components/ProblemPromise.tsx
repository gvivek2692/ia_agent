import React from 'react';
import { Smartphone, ArrowRight } from 'lucide-react';

const ProblemPromise: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-gold-600/10 to-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-amber-600/10 to-gold-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Finance is complex.{' '}
            <span className="bg-gradient-to-r from-gold-400 to-amber-400 bg-clip-text text-transparent">
              We make it effortless.
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            People struggle to track investments, rebalance portfolios, and stay aligned with goals. 
            Our AI agent simplifies everything — monitoring, insights, and execution.
          </p>
        </div>

        {/* Before vs After Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Before - Problem */}
          <div className="relative">
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 rounded-3xl p-8 backdrop-blur-sm">
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-sm font-medium mb-4">
                  Before: Scattered & Complex
                </div>
              </div>

              {/* Scattered Apps Illustration */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-blue-500/30 rounded-lg mx-auto mb-2"></div>
                    <span className="text-gray-400 text-xs">Bank App</span>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-green-500/30 rounded-lg mx-auto mb-2"></div>
                    <span className="text-gray-400 text-xs">MF App</span>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-purple-500/30 rounded-lg mx-auto mb-2"></div>
                    <span className="text-gray-400 text-xs">Trading</span>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="w-12 h-8 bg-orange-500/30 rounded-lg mx-auto mb-2"></div>
                  <span className="text-gray-400 text-xs">Excel Spreadsheets</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <ul className="text-red-300 text-sm space-y-2">
                  <li>• Multiple apps to manage</li>
                  <li>• Manual tracking & calculations</li>
                  <li>• No unified view</li>
                  <li>• Easy to miss opportunities</li>
                </ul>
              </div>
            </div>
          </div>

          {/* After - Solution */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gold-900/20 to-amber-900/20 border border-gold-500/30 rounded-3xl p-8 backdrop-blur-sm">
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-gold-500/20 border border-gold-500/30 rounded-full text-gold-300 text-sm font-medium mb-4">
                  After: Unified & Intelligent
                </div>
              </div>

              {/* Unified Dashboard Illustration */}
              <div className="bg-black/50 rounded-2xl p-6 border border-gold-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold text-sm">AI Dashboard</h4>
                  <div className="w-6 h-6 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-bold">AI</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-gold-600/20 to-amber-600/20 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-xs">Portfolio Health</span>
                      <span className="text-green-400 text-xs font-bold">Excellent</span>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-xs">Goals Progress</span>
                      <span className="text-gold-400 text-xs font-bold">85%</span>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-xs">SIA Actions</span>
                      <span className="text-amber-400 text-xs font-bold">3 Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <ul className="text-green-300 text-sm space-y-2">
                  <li>• All data in one place</li>
                  <li>• AI-powered insights</li>
                  <li>• Automatic monitoring</li>
                  <li>• Proactive recommendations</li>
                </ul>
              </div>
            </div>

            {/* Arrow pointing from Before to After */}
            <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 hidden lg:block">
              <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemPromise;