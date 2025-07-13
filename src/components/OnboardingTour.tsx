"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  Calendar, 
  Car, 
  MessageSquare, 
  Settings,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Star
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action?: string;
  highlight?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Carpooly! 🚗',
    description: 'Let\'s take a quick tour to help you get started with carpooling.',
    icon: Star,
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'This is your command center! Here you can see all your carpools, active rides, and upcoming activities.',
    icon: Car,
    highlight: 'dashboard-overview',
  },
  {
    id: 'create-carpool',
    title: 'Create a Carpool',
    description: 'Start by creating your first carpool. Set your destination, schedule, and number of seats.',
    icon: Calendar,
    action: 'Create Carpool',
    highlight: 'create-carpool-btn',
  },
  {
    id: 'invite-others',
    title: 'Invite Others',
    description: 'Share your carpool with friends, family, or neighbors. They can join with a simple invite link.',
    icon: Users,
    action: 'Send Invites',
    highlight: 'invite-section',
  },
  {
    id: 'track-rides',
    title: 'Track Your Rides',
    description: 'See real-time updates of your carpool rides, including location tracking and ETA.',
    icon: MapPin,
    highlight: 'active-rides',
  },
  {
    id: 'active-rides',
    title: 'Active Rides',
    description: 'Active rides will appear on your dashboard about 30 minutes before they begin. Click on them to see real-time locations and track your journey.',
    icon: MapPin,
    highlight: 'active-rides',
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Adjust your preferences, location settings, and notification preferences.',
    icon: Settings,
    action: 'Go to Settings',
    highlight: 'settings-link',
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    description: 'You now know the basics of Carpooly. Start creating your first carpool and enjoy the ride!',
    icon: CheckCircle,
    action: 'Get Started',
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Reset tour when opened
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [isOpen]);

  const handleNext = () => {
    const currentStepData = tourSteps[currentStep];
    setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStepData.id)));
    
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour completed
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = (action?: string) => {
    if (action === 'Create Carpool') {
      router.push('/create-carpool');
    } else if (action === 'Send Invites') {
      router.push('/carpools/list');
    } else if (action === 'Go to Settings') {
      router.push('/settings');
    } else if (action === 'Get Started') {
      onComplete();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Step {currentStep + 1} of {tourSteps.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-green-500 h-1 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <currentStepData.icon className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl font-bold mb-2">
              {currentStepData.title}
            </CardTitle>
            <p className="text-gray-600 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Action Button */}
          {currentStepData.action && (
            <div className="mb-6">
              <Button
                onClick={() => handleAction(currentStepData.action)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {currentStepData.action}
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <strong>Pro Tip:</strong> You can always access help and tutorials from the settings menu.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 