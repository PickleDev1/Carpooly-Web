"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Users, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Shield, 
  Leaf, 
  DollarSign,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Star,
  Clock,
  TrendingUp
} from 'lucide-react';

interface GuideStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  color: string;
}

const guideSteps: GuideStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Carpooly! 🚗',
    subtitle: 'Your journey to smarter carpooling starts here',
    description: 'Carpooly makes it easy to organize and join carpools with friends, family, and neighbors. Save money, reduce your carbon footprint, and build community connections.',
    icon: Star,
    features: [
      'Create and join carpools in minutes',
      'Real-time location tracking for safety',
      'Smart scheduling and notifications',
      'Cost sharing and analytics'
    ],
    color: 'bg-gradient-to-br from-green-500 to-blue-600'
  },
  {
    id: 'create-carpool',
    title: 'Create Your First Carpool',
    subtitle: 'Set up carpools for regular commutes or special events',
    description: 'Start by creating a carpool with your destination, schedule, and available seats. You can make one-time rides or recurring carpools for daily commutes.',
    icon: Car,
    features: [
      'Choose your destination and schedule',
      'Set the number of available seats',
      'Create one-time or recurring carpools',
      'Set pickup times and locations'
    ],
    color: 'bg-gradient-to-br from-blue-500 to-purple-600'
  },
  {
    id: 'invite-others',
    title: 'Invite Others to Join',
    subtitle: 'Share your carpool with friends and neighbors',
    description: 'Send invite links to people you want to carpool with. They can join with just a click, and you\'ll be notified when they accept.',
    icon: Users,
    features: [
      'Share invite links via email or text',
      'See who has joined your carpool',
      'Manage participant requests',
      'Set carpool rules and guidelines'
    ],
    color: 'bg-gradient-to-br from-purple-500 to-pink-600'
  },
  {
    id: 'track-rides',
    title: 'Track Your Rides',
    subtitle: 'Real-time updates and location sharing',
    description: 'Stay informed about your carpool rides with real-time location updates, ETA notifications, and status tracking.',
    icon: MapPin,
    features: [
      'Real-time location tracking',
      'ETA updates and notifications',
      'Ride status and progress',
      'Safety features and alerts'
    ],
    color: 'bg-gradient-to-br from-pink-500 to-red-600'
  },
  {
    id: 'active-rides',
    title: 'Active Rides',
    subtitle: 'Real-time tracking and location updates',
    description: 'Active rides will appear on your dashboard about 30 minutes before they begin. Click on them to see real-time locations, track your journey, and get live updates.',
    icon: MapPin,
    features: [
      'Rides appear 30 minutes before start time',
      'Click to view real-time locations',
      'Live tracking during your journey',
      'Real-time ETA and status updates'
    ],
    color: 'bg-gradient-to-br from-red-500 to-orange-600'
  },
  {
    id: 'benefits',
    title: 'Enjoy the Benefits',
    subtitle: 'Save money and help the environment',
    description: 'Carpooling with Carpooly helps you save money on transportation costs while reducing your environmental impact.',
    icon: TrendingUp,
    features: [
      'Split fuel and parking costs',
      'Reduce carbon emissions',
      'Build community connections',
      'Track your savings and impact'
    ],
    color: 'bg-gradient-to-br from-orange-500 to-yellow-600'
  }
];

interface WelcomeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function WelcomeGuide({ isOpen, onClose, onComplete }: WelcomeGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = guideSteps[currentStep];
  const progress = ((currentStep + 1) / guideSteps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${currentStepData.color} rounded-lg flex items-center justify-center`}>
              <currentStepData.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Getting Started</h2>
              <p className="text-sm text-gray-600">Step {currentStep + 1} of {guideSteps.length}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-green-500 h-1 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {currentStepData.subtitle}
            </p>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {currentStepData.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">💡</span>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Pro Tip</h4>
                  <p className="text-sm text-blue-800">
                    {currentStep === 0 && "Take your time exploring the app. You can always access help and tutorials from the settings menu."}
                    {currentStep === 1 && "Start with a simple one-time carpool to get familiar with the process before creating recurring ones."}
                    {currentStep === 2 && "Invite people you trust and feel comfortable carpooling with. Safety and comfort are key!"}
                    {currentStep === 3 && "Enable location sharing for better coordination, but remember you can disable it anytime."}
                    {currentStep === 4 && "Make sure to check your dashboard regularly to see when your rides become active. You'll get notifications when rides are about to start."}
                    {currentStep === 5 && "Check your analytics dashboard regularly to see your savings and environmental impact."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500"
              >
                Skip Guide
              </Button>
              
              <Button
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                {currentStep === guideSteps.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 