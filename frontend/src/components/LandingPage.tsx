import React, { useState } from 'react';
import HeroSection from './HeroSection';
import ProblemPromise from './ProblemPromise';
import FeatureGrid from './FeatureGrid';
import AIAssistant from './AIAssistant';
import HowItWorksEnhanced from './HowItWorksEnhanced';
import SecurityTrust from './SecurityTrust';
import FinalCTA from './FinalCTA';
import { 
  Menu, 
  X, 
  ArrowRight
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Security', href: '#security' }
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-gold-600 to-amber-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-2xl font-bold text-white">WealthWise</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.href)}
                    className="text-gray-300 hover:text-gold-400 px-3 py-2 rounded-md text-xl font-medium transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-gold-600 to-amber-600 text-black px-6 py-2 rounded-xl font-semibold hover:from-gold-500 hover:to-amber-500 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white focus:outline-none focus:text-white p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-gold-500/20">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-300 hover:text-gold-400 block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  onGetStarted();
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-r from-gold-600 to-amber-600 text-black px-3 py-2 rounded-md text-base font-medium w-full text-left mt-4"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <HeroSection onGetStarted={onGetStarted} />

      {/* Problem Promise Section */}
      <ProblemPromise />

      {/* Features Section */}
      <div id="features">
        <FeatureGrid />
      </div>

      {/* AI Assistant Section */}
      <AIAssistant />

      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorksEnhanced />
      </div>

      {/* Security & Trust Section */}
      <div id="security">
        <SecurityTrust />
      </div>

      {/* Final CTA Section */}
      <FinalCTA onGetStarted={onGetStarted} />

      {/* Footer */}
      <footer className="bg-black border-t border-gold-500/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-gold-500 to-amber-500 rounded-xl flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="text-2xl font-bold text-white">WealthWise</span>
          </div>
          <p className="text-gray-400 mb-6">
            SIA-powered wealth intelligence for the top 1%. Take control.
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 WealthWise. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;