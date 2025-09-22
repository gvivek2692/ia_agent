import React, { useState } from 'react';
import { X, TrendingUp, AlertCircle, DollarSign, Shield, CreditCard } from 'lucide-react';

interface FormField {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  suffix?: string;
  options?: string[];
  min?: number;
  max?: number;
}

interface FormStep {
  step: number;
  title: string;
  fields: FormField[];
}

interface UnlockMetricModalProps {
  opportunity: {
    category: string;
    title: string;
    description: string;
    potential_gain: number;
    effort_level: string;
    data_needed: string[];
    priority: number;
  };
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const UnlockMetricModal: React.FC<UnlockMetricModalProps> = ({
  opportunity,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<any>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Risk Protection':
        return Shield;
      case 'Liabilities & Credit':
        return CreditCard;
      case 'Tax Efficiency & Estate':
        return DollarSign;
      default:
        return TrendingUp;
    }
  };

  const CategoryIcon = getCategoryIcon(opportunity.category);

  // Form configurations for different categories
  const getFormFields = (): FormStep[] => {
    switch (opportunity.category) {
      case 'Risk Protection':
        return [
          {
            step: 0,
            title: 'Life Insurance Details',
            fields: [
              {
                key: 'life_insurance_amount',
                label: 'Life Insurance Coverage Amount',
                type: 'number',
                placeholder: 'Enter coverage amount in ₹',
                required: true,
                suffix: '₹'
              },
              {
                key: 'life_insurance_type',
                label: 'Insurance Type',
                type: 'select',
                options: ['Term Life', 'Whole Life', 'ULIP', 'Endowment'],
                required: true
              }
            ]
          },
          {
            step: 1,
            title: 'Health Insurance Details',
            fields: [
              {
                key: 'health_insurance_amount',
                label: 'Health Insurance Coverage',
                type: 'number',
                placeholder: 'Enter coverage amount in ₹',
                required: true,
                suffix: '₹'
              },
              {
                key: 'health_insurance_type',
                label: 'Coverage Type',
                type: 'select',
                options: ['Individual', 'Family Floater', 'Super Top-up', 'Group Insurance'],
                required: true
              }
            ]
          }
        ];

      case 'Liabilities & Credit':
        return [
          {
            step: 0,
            title: 'Loan & EMI Information',
            fields: [
              {
                key: 'home_loan_emi',
                label: 'Home Loan EMI (if any)',
                type: 'number',
                placeholder: 'Monthly EMI amount',
                suffix: '₹/month'
              },
              {
                key: 'personal_loan_emi',
                label: 'Personal/Other Loan EMI',
                type: 'number',
                placeholder: 'Monthly EMI amount',
                suffix: '₹/month'
              },
              {
                key: 'credit_card_outstanding',
                label: 'Credit Card Outstanding',
                type: 'number',
                placeholder: 'Total outstanding amount',
                suffix: '₹'
              }
            ]
          },
          {
            step: 1,
            title: 'Credit Score Information',
            fields: [
              {
                key: 'credit_score',
                label: 'CIBIL Score',
                type: 'number',
                placeholder: 'Enter your CIBIL score (300-900)',
                min: 300,
                max: 900,
                required: true
              },
              {
                key: 'credit_score_source',
                label: 'Score Source',
                type: 'select',
                options: ['CIBIL', 'Experian', 'Equifax', 'CRIF'],
                required: true
              }
            ]
          }
        ];

      case 'Tax Efficiency & Estate':
        return [
          {
            step: 0,
            title: 'Tax Saving Investments',
            fields: [
              {
                key: 'section_80c_investments',
                label: '80C Investments (Annual)',
                type: 'number',
                placeholder: 'PPF, ELSS, NSC, etc.',
                suffix: '₹/year',
                max: 150000
              },
              {
                key: 'nps_contributions',
                label: 'NPS Contributions (Annual)',
                type: 'number',
                placeholder: 'Additional 50K under 80CCD(1B)',
                suffix: '₹/year',
                max: 50000
              },
              {
                key: 'section_80d_premium',
                label: 'Health Insurance Premium (80D)',
                type: 'number',
                placeholder: 'Annual premium paid',
                suffix: '₹/year'
              }
            ]
          }
        ];

      default:
        return [];
    }
  };

  const formSteps = getFormFields();
  const totalSteps = formSteps.length;
  const currentStepData = formSteps[currentStep];

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
    }, 1000);
  };

  const isCurrentStepValid = () => {
    if (!currentStepData) return false;
    
    const requiredFields = currentStepData.fields.filter((field: any) => field.required);
    return requiredFields.every((field: any) => {
      const value = formData[field.key];
      return value !== undefined && value !== '' && value !== null;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gold-500/30 rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold-600/20 to-amber-600/20 border-b border-gold-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gold-500/20 rounded-lg">
                <CategoryIcon className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{opportunity.title}</h2>
                <p className="text-sm text-gray-300">+{opportunity.potential_gain} points potential</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress indicator */}
          {totalSteps > 1 && (
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      i <= currentStep ? 'bg-gold-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStepData ? (
            <div>
              <h3 className="text-white font-semibold mb-4">{currentStepData.title}</h3>
              
              <div className="space-y-4">
                {currentStepData.fields.map((field: any) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'select' ? (
                      <select
                        value={formData[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-gold-400 focus:outline-none"
                        required={field.required}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option: string) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type={field.type}
                          value={formData[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, 
                            field.type === 'number' ? Number(e.target.value) : e.target.value
                          )}
                          placeholder={field.placeholder}
                          min={field.min}
                          max={field.max}
                          className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-gold-400 focus:outline-none pr-16"
                          required={field.required}
                        />
                        {field.suffix && (
                          <span className="absolute right-3 top-2 text-gray-400 text-sm">
                            {field.suffix}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-300">No configuration available for this unlock opportunity.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStepData && (
          <div className="border-t border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid() || isSubmitting}
                  className="bg-gradient-to-r from-gold-600 to-amber-600 text-black px-6 py-2 rounded-lg font-medium hover:from-gold-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    'Saving...'
                  ) : currentStep === totalSteps - 1 ? (
                    `Unlock +${opportunity.potential_gain} Points`
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnlockMetricModal;