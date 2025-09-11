import React from 'react';
import { Link, Brain, TrendingUp, CheckCircle } from 'lucide-react';

const HowItWorksEnhanced: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Connect your financial accounts securely",
      description: "Link your bank accounts, mutual funds, and trading platforms through government-approved Account Aggregator, MF Central, and CIBIL integrations.",
      icon: Link,
      details: ["Account Aggregator (AA) integration", "MF Central connectivity", "CIBIL credit score access", "Bank-grade security"],
      gradient: "from-gold-500 to-amber-500"
    },
    {
      number: "02", 
      title: "AI analyses your profile & builds your roadmap",
      description: "Our advanced AI engine processes your financial data to create a comprehensive, personalized financial roadmap tailored to your goals and risk profile.",
      icon: Brain,
      details: ["Complete financial health analysis", "Risk profile assessment", "Goal-based planning", "Personalized recommendations"],
      gradient: "from-amber-500 to-gold-500"
    },
    {
      number: "03",
      title: "Get real-time insights, nudges, and action plans",
      description: "Receive continuous monitoring with proactive nudges, instant insights, and clear action plans to keep you on track towards your financial goals.",
      icon: TrendingUp,
      details: ["24/7 portfolio monitoring", "Proactive optimization alerts", "Market-aware recommendations", "Instant execution capabilities"],
      gradient: "from-gold-600 to-amber-600"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-gold-600/10 to-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-amber-600/10 to-gold-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gold-500/10 to-amber-500/10 border border-gold-500/20 rounded-full text-gold-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            How It Works
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Get started in{' '}
            <span className="bg-gradient-to-r from-gold-400 to-amber-400 bg-clip-text text-transparent">
              3 simple steps
            </span>
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-24">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isEven = index % 2 === 1;
            
            return (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                {/* Content */}
                <div className={`${isEven ? 'lg:order-2' : ''}`}>
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-2xl flex items-center justify-center mr-4`}>
                      <span className="text-black font-bold text-xl">{step.number}</span>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${step.gradient} rounded-xl flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-black" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Key Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                        <span className="text-gray-400 text-sm">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual */}
                <div className={`${isEven ? 'lg:order-1' : ''} flex justify-center`}>
                  <div className="relative">
                    {/* Step Number Badge - Positioned Outside Circle */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                      <div className={`w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-2xl flex items-center justify-center shadow-2xl border-4 border-black`}>
                        <span className="text-black font-bold text-xl">{step.number}</span>
                      </div>
                    </div>

                    {/* Main Circle */}
                    <div className={`w-80 h-80 bg-gradient-to-br ${step.gradient} rounded-full p-1 shadow-2xl`}>
                      <div className="w-full h-full bg-black rounded-full flex items-center justify-center relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-gold-400 rounded-full blur-xl"></div>
                          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-amber-400 rounded-full blur-xl"></div>
                        </div>
                        
                        {/* Icon */}
                        <div className={`relative z-10 w-24 h-24 bg-gradient-to-r ${step.gradient} rounded-2xl flex items-center justify-center`}>
                          <IconComponent className="w-12 h-12 text-black" />
                        </div>
                      </div>
                    </div>

                    {/* Connecting Line to Next Step */}
                    {index < steps.length - 1 && (
                      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 hidden lg:block z-10">
                        <div className="w-1 h-24 bg-gradient-to-b from-gold-500/50 to-transparent"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksEnhanced;