import React from 'react';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-600/20 to-rose-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-4 h-4 bg-pink-500/60 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-rose-500/60 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-20 w-2 h-2 bg-pink-400/60 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-40 right-10 w-5 h-5 bg-rose-400/60 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Hero Content */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-full text-pink-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered Wealth Management
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-pink-600 bg-clip-text text-transparent">
              Maximize
            </span>{' '}
            Your Wealth,{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-pink-600 bg-clip-text text-transparent">
              Minimize
            </span>{' '}
            Mistakes
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Your intelligent companion for smart financial decisions and portfolio management. 
            Track, analyze, and grow your investments with AI-powered insights.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Analytics</h3>
            <p className="text-gray-400 text-sm">AI-powered insights for your portfolio performance and market trends</p>
          </div>

          <div className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Risk Management</h3>
            <p className="text-gray-400 text-sm">Protect your investments with intelligent risk assessment and alerts</p>
          </div>

          <div className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Goal Planning</h3>
            <p className="text-gray-400 text-sm">Set and achieve your financial goals with personalized strategies</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:items-center sm:justify-center">
          <button
            onClick={onGetStarted}
            className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-2xl hover:from-pink-500 hover:to-rose-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>
          
          <button className="inline-flex items-center px-8 py-4 border-2 border-pink-500/50 text-pink-300 font-semibold rounded-2xl hover:border-pink-400 hover:text-pink-200 hover:bg-pink-500/5 transition-all duration-300">
            Watch Demo
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">10K+</div>
            <div className="text-gray-400 text-sm">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">₹100Cr+</div>
            <div className="text-gray-400 text-sm">Assets Managed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">15%</div>
            <div className="text-gray-400 text-sm">Avg Returns</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">99.9%</div>
            <div className="text-gray-400 text-sm">Uptime</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-pink-500/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-pink-500 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;