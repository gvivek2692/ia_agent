import React from 'react';
import { Bot, MessageCircle, Zap, Clock, Brain } from 'lucide-react';

const AIAssistant: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-gradient-to-r from-gold-600/15 to-amber-600/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-amber-600/15 to-gold-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gold-500/10 to-amber-500/10 border border-gold-500/20 rounded-full text-gold-300 text-sm font-medium mb-6 backdrop-blur-sm">
              <Bot className="w-4 h-4 mr-2" />
              SIA-Powered Intelligence
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              SIA:{' '}
              <span className="bg-gradient-to-r from-gold-400 to-amber-400 bg-clip-text text-transparent">
                Financial genius
              </span>{' '}
              that fits in your pocket
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              It works for you (not the wealth managers). 24/7 companion, trusted advisor, instant execution. 
              No more waiting for approvals or paying management fees.
            </p>

            {/* Key Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-gold-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Natural Conversation</h4>
                  <p className="text-gray-400 text-sm">Ask questions in plain English, get clear answers instantly</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-gold-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Instant Execution</h4>
                  <p className="text-gray-400 text-sm">Execute trades, rebalance portfolios, and update goals seamlessly</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-gold-600 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">24/7 Availability</h4>
                  <p className="text-gray-400 text-sm">Always ready to help, whether markets are open or closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual - Chat Interface */}
          <div className="relative">
            {/* AI Bot Illustration */}
            <div className="absolute -top-8 -right-8 z-20">
              <div className="w-24 h-24 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full flex items-center justify-center shadow-2xl">
                <Brain className="w-12 h-12 text-black" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-500 rounded-full border-4 border-black"></div>
            </div>

            {/* Phone Mockup with Chat */}
            <div className="relative z-10">
              <div className="w-80 h-96 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-3 shadow-2xl border border-gray-700 mx-auto">
                <div className="w-full h-full bg-black rounded-2xl p-4 overflow-hidden">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-sm">SIA Assistant</h4>
                        <p className="text-green-400 text-xs">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-4 flex-1">
                    {/* AI Message */}
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-black" />
                      </div>
                      <div className="bg-gray-800 rounded-2xl rounded-tl-sm p-3 max-w-xs">
                        <p className="text-white text-xs">I've detected a rebalancing opportunity in your portfolio. Execute now for +2.3% optimization?</p>
                      </div>
                    </div>

                    {/* User Message */}
                    <div className="flex items-end justify-end space-x-2">
                      <div className="bg-gradient-to-r from-gold-600 to-amber-600 rounded-2xl rounded-br-sm p-3 max-w-xs">
                        <p className="text-black text-xs font-medium">Yes, execute it. What's my wealth score today?</p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-black" />
                      </div>
                      <div className="bg-gray-800 rounded-2xl rounded-tl-sm p-3 max-w-xs">
                        <p className="text-white text-xs">Rebalanced! ✅ Wealth score: 94/100. You're outperforming 89% of investors. Ready for next action?</p>
                      </div>
                    </div>

                    {/* Typing Indicator */}
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-black" />
                      </div>
                      <div className="bg-gray-800 rounded-2xl rounded-tl-sm p-3">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="mt-4 pt-3 border-t border-gray-800">
                    <div className="bg-gray-800 rounded-full px-4 py-2 flex items-center">
                      <span className="text-gray-500 text-xs flex-1">Ask me anything...</span>
                      <div className="w-6 h-6 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-3 h-3 text-black" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;