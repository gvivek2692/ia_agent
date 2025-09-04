import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User as UserIcon, DollarSign, Home, TrendingUp } from 'lucide-react';
import { apiService } from '../services/apiService';

interface User {
  id: string;
  name?: string;
  email?: string;
  profession?: string;
  location?: string;
  age?: number;
  experience_level?: string;
  risk_tolerance?: string;
  gender?: string;
  marital_status?: string;
  kids?: number;
  hobbies?: string[];
  investment_horizon?: string;
  preferred_instruments?: string[];
  investment_knowledge_score?: number;
  started_investing?: string;
}

interface ProfileEditPageProps {
  user: User;
  sessionId?: string;
  onBack: () => void;
  onProfileUpdated: (updatedUser: User) => void;
}

interface ProfileFormData {
  user_profile: {
    name: string;
    age: number;
    gender: string;
    marital_status: string;
    kids: number;
    profession: string;
    location: string;
    company: string;
    experience: string;
    education: string;
    phone: string;
    email: string;
    hobbies: string[];
  };
  financial_profile: {
    monthly_salary: number;
    annual_ctc: number;
    take_home: number;
    other_income: number;
    school_fees: number;
  };
  investment_profile: {
    risk_tolerance: string;
    investment_experience: string;
    investment_horizon: string;
    preferred_instruments: string[];
    investment_knowledge_score: number;
    started_investing: string;
  };
  loan_profile: {
    home_loan: {
      emi: number;
      tenure_remaining_months: number;
      principal_remaining: number;
    };
    car_loan: {
      emi: number;
      tenure_remaining_months: number;
      principal_remaining: number;
    };
    other_emi: number;
  };
  monthly_expenses: {
    rent: number;
    food_dining: number;
    transportation: number;
    utilities: number;
    entertainment: number;
    shopping: number;
    healthcare: number;
    insurance: number;
    subscriptions: number;
    miscellaneous: number;
  };
}

const ProfileEditPage: React.FC<ProfileEditPageProps> = ({ user, sessionId, onBack, onProfileUpdated }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    user_profile: {
      name: '',
      age: 25,
      gender: 'Male',
      marital_status: 'Single',
      kids: 0,
      profession: '',
      location: '',
      company: '',
      experience: '',
      education: '',
      phone: '',
      email: '',
      hobbies: []
    },
    financial_profile: {
      monthly_salary: 0,
      annual_ctc: 0,
      take_home: 0,
      other_income: 0,
      school_fees: 0
    },
    investment_profile: {
      risk_tolerance: 'moderate',
      investment_experience: 'beginner',
      investment_horizon: 'long_term',
      preferred_instruments: [],
      investment_knowledge_score: 5,
      started_investing: ''
    },
    loan_profile: {
      home_loan: {
        emi: 0,
        tenure_remaining_months: 0,
        principal_remaining: 0
      },
      car_loan: {
        emi: 0,
        tenure_remaining_months: 0,
        principal_remaining: 0
      },
      other_emi: 0
    },
    monthly_expenses: {
      rent: 0,
      food_dining: 0,
      transportation: 0,
      utilities: 0,
      entertainment: 0,
      shopping: 0,
      healthcare: 0,
      insurance: 0,
      subscriptions: 0,
      miscellaneous: 0
    }
  });

  const [newHobby, setNewHobby] = useState('');

  useEffect(() => {
    loadUserData();
  }, [user.id, sessionId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get complete user data from user-context endpoint
      const userContextResponse = await apiService.getUserContext(user.id, sessionId) as any;
      
      if (userContextResponse) {
        // Map the response data to our form structure
        setProfileData({
          user_profile: {
            name: userContextResponse.user_profile?.name || user.name || '',
            age: userContextResponse.user_profile?.age || user.age || 25,
            gender: userContextResponse.user_profile?.gender || 'Male',
            marital_status: userContextResponse.user_profile?.marital_status || 'Single',
            kids: userContextResponse.user_profile?.kids || 0,
            profession: userContextResponse.user_profile?.profession || user.profession || '',
            location: userContextResponse.user_profile?.location || user.location || '',
            company: userContextResponse.user_profile?.company || '',
            experience: userContextResponse.user_profile?.experience || '',
            education: userContextResponse.user_profile?.education || '',
            phone: userContextResponse.user_profile?.phone || '',
            email: userContextResponse.user_profile?.email || user.email || '',
            hobbies: userContextResponse.user_profile?.hobbies || []
          },
          financial_profile: {
            monthly_salary: userContextResponse.financial_profile?.monthly_salary || 0,
            annual_ctc: userContextResponse.financial_profile?.annual_ctc || 0,
            take_home: userContextResponse.financial_profile?.take_home || 0,
            other_income: userContextResponse.financial_profile?.other_income || 0,
            school_fees: userContextResponse.financial_profile?.school_fees || 0
          },
          investment_profile: {
            risk_tolerance: userContextResponse.investment_profile?.risk_tolerance || user.risk_tolerance || 'moderate',
            investment_experience: userContextResponse.investment_profile?.investment_experience || user.experience_level || 'beginner',
            investment_horizon: userContextResponse.investment_profile?.investment_horizon || user.investment_horizon || 'long_term',
            preferred_instruments: userContextResponse.investment_profile?.preferred_instruments || user.preferred_instruments || [],
            investment_knowledge_score: userContextResponse.investment_profile?.investment_knowledge_score || user.investment_knowledge_score || 5,
            started_investing: userContextResponse.investment_profile?.started_investing || user.started_investing || ''
          },
          loan_profile: {
            home_loan: {
              emi: userContextResponse.loan_profile?.home_loan?.emi || 0,
              tenure_remaining_months: userContextResponse.loan_profile?.home_loan?.tenure_remaining_months || 0,
              principal_remaining: userContextResponse.loan_profile?.home_loan?.principal_remaining || 0
            },
            car_loan: {
              emi: userContextResponse.loan_profile?.car_loan?.emi || 0,
              tenure_remaining_months: userContextResponse.loan_profile?.car_loan?.tenure_remaining_months || 0,
              principal_remaining: userContextResponse.loan_profile?.car_loan?.principal_remaining || 0
            },
            other_emi: userContextResponse.loan_profile?.other_emi || 0
          },
          monthly_expenses: {
            rent: userContextResponse.monthly_expenses?.rent || 0,
            food_dining: userContextResponse.monthly_expenses?.food_dining || 0,
            transportation: userContextResponse.monthly_expenses?.transportation || 0,
            utilities: userContextResponse.monthly_expenses?.utilities || 0,
            entertainment: userContextResponse.monthly_expenses?.entertainment || 0,
            shopping: userContextResponse.monthly_expenses?.shopping || 0,
            healthcare: userContextResponse.monthly_expenses?.healthcare || 0,
            insurance: userContextResponse.monthly_expenses?.insurance || 0,
            subscriptions: userContextResponse.monthly_expenses?.subscriptions || 0,
            miscellaneous: userContextResponse.monthly_expenses?.miscellaneous || 0
          }
        });
      }
    } catch (err: any) {
      console.error('Error loading user data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: keyof ProfileFormData, field: string, value: any) => {
    if (section === 'loan_profile' && (field === 'home_loan' || field === 'car_loan')) {
      // Handle nested loan objects
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: {
            ...prev[section][field as 'home_loan' | 'car_loan'],
            ...value
          }
        }
      }));
    } else if (section === 'investment_profile' && field === 'preferred_instruments') {
      // Handle preferred instruments array
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const addHobby = () => {
    if (newHobby.trim() && !profileData.user_profile.hobbies.includes(newHobby.trim())) {
      setProfileData(prev => ({
        ...prev,
        user_profile: {
          ...prev.user_profile,
          hobbies: [...prev.user_profile.hobbies, newHobby.trim()]
        }
      }));
      setNewHobby('');
    }
  };

  const removeHobby = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      user_profile: {
        ...prev.user_profile,
        hobbies: prev.user_profile.hobbies.filter((_, i) => i !== index)
      }
    }));
  };

  const handleInstrumentChange = (instrument: string, checked: boolean) => {
    setProfileData(prev => {
      const currentInstruments = prev.investment_profile.preferred_instruments;
      const newInstruments = checked 
        ? [...currentInstruments, instrument]
        : currentInstruments.filter(item => item !== instrument);
      
      return {
        ...prev,
        investment_profile: {
          ...prev.investment_profile,
          preferred_instruments: newInstruments
        }
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await apiService.updateUserProfile(user.id, profileData, sessionId) as any;
      
      if (response.success) {
        setSuccessMessage('Profile updated successfully!');
        // Update parent component with new user data
        const updatedUser = {
          ...user,
          name: profileData.user_profile.name,
          age: profileData.user_profile.age,
          profession: profileData.user_profile.profession,
          location: profileData.user_profile.location,
          gender: profileData.user_profile.gender,
          marital_status: profileData.user_profile.marital_status,
          kids: profileData.user_profile.kids,
          hobbies: profileData.user_profile.hobbies,
          risk_tolerance: profileData.investment_profile.risk_tolerance,
          experience_level: profileData.investment_profile.investment_experience,
          investment_horizon: profileData.investment_profile.investment_horizon,
          preferred_instruments: profileData.investment_profile.preferred_instruments,
          investment_knowledge_score: profileData.investment_profile.investment_knowledge_score,
          started_investing: profileData.investment_profile.started_investing
        };
        onProfileUpdated(updatedUser);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-gold-600/10 to-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-amber-600/10 to-gold-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gold-400 hover:text-gold-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-white">
            Edit <span className="bg-gradient-to-r from-gold-400 to-amber-400 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className="text-gray-300 mt-2">Update your personal, financial, and loan information</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl backdrop-blur-sm">
            <p className="text-green-300 text-sm">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl backdrop-blur-sm">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gold-500/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <UserIcon className="w-6 h-6 text-gold-400" />
              <h2 className="text-xl font-semibold text-white">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileData.user_profile.name}
                  onChange={(e) => handleInputChange('user_profile', 'name', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input
                  type="number"
                  value={profileData.user_profile.age}
                  onChange={(e) => handleInputChange('user_profile', 'age', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <select
                  value={profileData.user_profile.gender}
                  onChange={(e) => handleInputChange('user_profile', 'gender', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Marital Status</label>
                <select
                  value={profileData.user_profile.marital_status}
                  onChange={(e) => handleInputChange('user_profile', 'marital_status', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Number of Kids</label>
                <input
                  type="number"
                  min="0"
                  value={profileData.user_profile.kids}
                  onChange={(e) => handleInputChange('user_profile', 'kids', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Profession</label>
                <input
                  type="text"
                  value={profileData.user_profile.profession}
                  onChange={(e) => handleInputChange('user_profile', 'profession', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={profileData.user_profile.location}
                  onChange={(e) => handleInputChange('user_profile', 'location', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                <input
                  type="text"
                  value={profileData.user_profile.company}
                  onChange={(e) => handleInputChange('user_profile', 'company', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Hobbies Section */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-300 mb-2">Hobbies</label>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newHobby}
                  onChange={(e) => setNewHobby(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHobby()}
                  placeholder="Add a hobby"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
                <button
                  onClick={addHobby}
                  className="px-6 py-3 bg-gold-600 hover:bg-gold-500 text-white rounded-xl font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.user_profile.hobbies.map((hobby, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gold-600/20 border border-gold-500/30 rounded-full text-gold-300 text-sm"
                  >
                    {hobby}
                    <button
                      onClick={() => removeHobby(index)}
                      className="ml-2 text-gold-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Investment Profile Section */}
          <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gold-500/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-gold-400" />
              <h2 className="text-xl font-semibold text-white">Investment Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Risk Tolerance</label>
                <select
                  value={profileData.investment_profile.risk_tolerance}
                  onChange={(e) => handleInputChange('investment_profile', 'risk_tolerance', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="moderate-aggressive">Moderate Aggressive</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Investment Experience</label>
                <select
                  value={profileData.investment_profile.investment_experience}
                  onChange={(e) => handleInputChange('investment_profile', 'investment_experience', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Investment Horizon</label>
                <select
                  value={profileData.investment_profile.investment_horizon}
                  onChange={(e) => handleInputChange('investment_profile', 'investment_horizon', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                >
                  <option value="short_term">Short Term (under 3 years)</option>
                  <option value="medium_term">Medium Term (3-7 years)</option>
                  <option value="long_term">Long Term (7+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Investment Knowledge Score</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={profileData.investment_profile.investment_knowledge_score}
                  onChange={(e) => handleInputChange('investment_profile', 'investment_knowledge_score', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  placeholder="1-10 scale"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Started Investing</label>
                <input
                  type="date"
                  value={profileData.investment_profile.started_investing}
                  onChange={(e) => handleInputChange('investment_profile', 'started_investing', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Preferred Investment Instruments */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-300 mb-4">Preferred Investment Instruments</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { value: 'stocks', label: 'Stocks' },
                  { value: 'mutual_funds', label: 'Mutual Funds' },
                  { value: 'etf', label: 'ETFs' },
                  { value: 'bonds', label: 'Bonds' },
                  { value: 'fd', label: 'Fixed Deposits' },
                  { value: 'ppf', label: 'PPF' },
                  { value: 'elss', label: 'ELSS' },
                  { value: 'nps', label: 'NPS' },
                  { value: 'gold', label: 'Gold' },
                  { value: 'real_estate', label: 'Real Estate' },
                  { value: 'crypto', label: 'Cryptocurrency' },
                  { value: 'ulip', label: 'ULIP' }
                ].map((instrument) => (
                  <label key={instrument.value} className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={profileData.investment_profile.preferred_instruments.includes(instrument.value)}
                      onChange={(e) => handleInstrumentChange(instrument.value, e.target.checked)}
                      className="w-4 h-4 text-gold-600 bg-transparent border-gray-300 rounded focus:ring-gold-500 focus:ring-2"
                    />
                    <span className="text-sm text-white">{instrument.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Information Section */}
          <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gold-500/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <DollarSign className="w-6 h-6 text-gold-400" />
              <h2 className="text-xl font-semibold text-white">Financial Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Salary (₹)</label>
                <input
                  type="number"
                  value={profileData.financial_profile.monthly_salary}
                  onChange={(e) => handleInputChange('financial_profile', 'monthly_salary', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Annual CTC (₹)</label>
                <input
                  type="number"
                  value={profileData.financial_profile.annual_ctc}
                  onChange={(e) => handleInputChange('financial_profile', 'annual_ctc', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Take Home (₹)</label>
                <input
                  type="number"
                  value={profileData.financial_profile.take_home}
                  onChange={(e) => handleInputChange('financial_profile', 'take_home', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Other Income (₹)</label>
                <input
                  type="number"
                  value={profileData.financial_profile.other_income}
                  onChange={(e) => handleInputChange('financial_profile', 'other_income', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">School Fees (₹)</label>
                <input
                  type="number"
                  value={profileData.financial_profile.school_fees}
                  onChange={(e) => handleInputChange('financial_profile', 'school_fees', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Monthly Expenses */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-white mb-4">Monthly Expenses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rent (₹)</label>
                  <input
                    type="number"
                    value={profileData.monthly_expenses.rent}
                    onChange={(e) => handleInputChange('monthly_expenses', 'rent', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Food & Dining (₹)</label>
                  <input
                    type="number"
                    value={profileData.monthly_expenses.food_dining}
                    onChange={(e) => handleInputChange('monthly_expenses', 'food_dining', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Transportation (₹)</label>
                  <input
                    type="number"
                    value={profileData.monthly_expenses.transportation}
                    onChange={(e) => handleInputChange('monthly_expenses', 'transportation', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Entertainment (₹)</label>
                  <input
                    type="number"
                    value={profileData.monthly_expenses.entertainment}
                    onChange={(e) => handleInputChange('monthly_expenses', 'entertainment', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Shopping (₹)</label>
                  <input
                    type="number"
                    value={profileData.monthly_expenses.shopping}
                    onChange={(e) => handleInputChange('monthly_expenses', 'shopping', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Other Expenses (₹)</label>
                  <input
                    type="number"
                    value={profileData.monthly_expenses.miscellaneous}
                    onChange={(e) => handleInputChange('monthly_expenses', 'miscellaneous', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Loan Information Section */}
          <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gold-500/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Home className="w-6 h-6 text-gold-400" />
              <h2 className="text-xl font-semibold text-white">Loan Information</h2>
            </div>

            {/* Home Loan */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Home Loan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">EMI (₹)</label>
                  <input
                    type="number"
                    value={profileData.loan_profile.home_loan.emi}
                    onChange={(e) => handleInputChange('loan_profile', 'home_loan', { emi: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tenure Remaining (Months)</label>
                  <input
                    type="number"
                    value={profileData.loan_profile.home_loan.tenure_remaining_months}
                    onChange={(e) => handleInputChange('loan_profile', 'home_loan', { tenure_remaining_months: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Principal Remaining (₹)</label>
                  <input
                    type="number"
                    value={profileData.loan_profile.home_loan.principal_remaining}
                    onChange={(e) => handleInputChange('loan_profile', 'home_loan', { principal_remaining: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Car Loan */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Car Loan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">EMI (₹)</label>
                  <input
                    type="number"
                    value={profileData.loan_profile.car_loan.emi}
                    onChange={(e) => handleInputChange('loan_profile', 'car_loan', { emi: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tenure Remaining (Months)</label>
                  <input
                    type="number"
                    value={profileData.loan_profile.car_loan.tenure_remaining_months}
                    onChange={(e) => handleInputChange('loan_profile', 'car_loan', { tenure_remaining_months: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Principal Remaining (₹)</label>
                  <input
                    type="number"
                    value={profileData.loan_profile.car_loan.principal_remaining}
                    onChange={(e) => handleInputChange('loan_profile', 'car_loan', { principal_remaining: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Other EMI */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Other EMI</h3>
              <div className="max-w-sm">
                <label className="block text-sm font-medium text-gray-300 mb-2">Other EMI (₹)</label>
                <input
                  type="number"
                  value={profileData.loan_profile.other_emi}
                  onChange={(e) => handleInputChange('loan_profile', 'other_emi', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-600 text-white font-medium rounded-2xl hover:from-gold-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;