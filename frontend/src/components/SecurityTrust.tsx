import React from 'react';
import { Shield, Lock, CheckCircle, Award, FileCheck, Users } from 'lucide-react';

const SecurityTrust: React.FC = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: "Bank-Grade Encryption",
      description: "256-bit SSL encryption protects all your data in transit and at rest"
    },
    {
      icon: Award,
      title: "Government Approved",
      description: "Certified Account Aggregator and regulatory compliance"
    },
    {
      icon: FileCheck,
      title: "Data Privacy",
      description: "Your data is never shared without explicit consent"
    },
    {
      icon: Users,
      title: "Trusted by Thousands",
      description: "Join the growing community of smart investors"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-gold-600/10 to-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-amber-600/10 to-gold-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gold-500/10 to-amber-500/10 border border-gold-500/20 rounded-full text-gold-300 text-sm font-medium mb-6 backdrop-blur-sm">
              <Shield className="w-4 h-4 mr-2" />
              Security & Trust
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Your data.{' '}
              <span className="bg-gradient-to-r from-gold-400 to-amber-400 bg-clip-text text-transparent">
                Safe and secure.
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Bank-grade encryption and government-approved account aggregator integrations. 
              We never share your data without consent.
            </p>

            {/* Security Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {securityFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-gold-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-sm">{feature.title}</h4>
                      <p className="text-gray-400 text-xs leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Visual - Security Illustration */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Main Shield */}
            <div className="relative p-8">
              <div className="w-80 h-96 bg-gradient-to-b from-gold-500/20 to-amber-500/20 rounded-3xl backdrop-blur-sm border border-gold-500/30 p-8 shadow-2xl">
                {/* Central Shield Icon */}
                <div className="flex justify-center mb-8">
                  <div className="w-32 h-32 bg-gradient-to-r from-gold-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Shield className="w-16 h-16 text-black" />
                  </div>
                </div>

                {/* Security Indicators */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-black/30 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-green-400" />
                      <span className="text-white text-sm font-medium">SSL Encryption</span>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>

                  <div className="flex items-center justify-between bg-black/30 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-blue-400" />
                      <span className="text-white text-sm font-medium">RBI Approved</span>
                    </div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                  </div>

                  <div className="flex items-center justify-between bg-black/30 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center space-x-3">
                      <FileCheck className="w-5 h-5 text-gold-400" />
                      <span className="text-white text-sm font-medium">Data Privacy</span>
                    </div>
                    <div className="w-3 h-3 bg-gold-400 rounded-full animate-pulse delay-500"></div>
                  </div>

                  <div className="flex items-center justify-between bg-black/30 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-amber-400" />
                      <span className="text-white text-sm font-medium">Compliance</span>
                    </div>
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse delay-700"></div>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-full text-green-300 text-sm font-medium backdrop-blur-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verified Secure Platform
                  </div>
                </div>
              </div>

              {/* Floating Security Elements - Safer Positioning */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl backdrop-blur-sm border border-green-500/30 flex items-center justify-center z-20">
                <Lock className="w-8 h-8 text-green-400" />
              </div>

              <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl backdrop-blur-sm border border-blue-500/30 flex items-center justify-center z-20">
                <Award className="w-8 h-8 text-blue-400" />
              </div>

              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-gold-500/20 to-amber-500/20 rounded-full backdrop-blur-sm border border-gold-500/30 flex items-center justify-center z-20">
                <FileCheck className="w-6 h-6 text-gold-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityTrust;