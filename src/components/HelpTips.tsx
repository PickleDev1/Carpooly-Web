"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Lightbulb, 
  BookOpen, 
  Video, 
  MessageCircle,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

interface HelpTip {
  id: string;
  title: string;
  content: string;
  category: 'getting-started' | 'features' | 'tips' | 'troubleshooting';
  icon?: React.ComponentType<any>;
  videoUrl?: string;
  externalLink?: string;
}

const helpTips: HelpTip[] = [
  {
    id: 'create-first-carpool',
    title: 'Creating Your First Carpool',
    content: 'Start by setting your destination, choosing a schedule (one-time, weekly, or monthly), and specifying how many seats you have available. You can always edit these details later.',
    category: 'getting-started',
    icon: BookOpen,
  },
  {
    id: 'invite-people',
    title: 'Inviting People to Your Carpool',
    content: 'Share your carpool invite link with friends, family, or neighbors. They can join with just a click, and you\'ll be notified when they accept.',
    category: 'getting-started',
    icon: MessageCircle,
  },
  {
    id: 'location-tracking',
    title: 'Location Tracking & Safety',
    content: 'Enable location sharing to let your carpool group know your real-time location during rides. This helps with coordination and safety.',
    category: 'features',
    icon: Lightbulb,
  },
  {
    id: 'schedule-management',
    title: 'Managing Your Schedule',
    content: 'You can create recurring carpools for regular commutes or one-time rides for special events. Set your preferred pickup times and days.',
    category: 'features',
    icon: BookOpen,
  },
  {
    id: 'communication',
    title: 'Staying Connected',
    content: 'Use the chat feature to coordinate pickups, share updates, or just stay in touch with your carpool group.',
    category: 'features',
    icon: MessageCircle,
  },
  {
    id: 'save-money',
    title: 'Saving Money with Carpooling',
    content: 'Split fuel costs, parking fees, and tolls with your carpool group. Track your savings in the analytics section.',
    category: 'tips',
    icon: Lightbulb,
  },
  {
    id: 'eco-friendly',
    title: 'Environmental Impact',
    content: 'Every carpool ride reduces carbon emissions and traffic congestion. Check your environmental impact in the analytics dashboard.',
    category: 'tips',
    icon: Lightbulb,
  },
  {
    id: 'safety-tips',
    title: 'Safety Best Practices',
    content: 'Always meet in public places, verify your carpool partners, and share your ride details with a trusted contact.',
    category: 'tips',
    icon: Lightbulb,
  },
  {
    id: 'troubleshoot-location',
    title: 'Location Issues',
    content: 'If location tracking isn\'t working, check your browser permissions and ensure you\'ve enabled location access for Carpooly.',
    category: 'troubleshooting',
    icon: HelpCircle,
  },
  {
    id: 'troubleshoot-notifications',
    title: 'Notification Problems',
    content: 'Make sure to allow notifications in your browser settings. You can also adjust notification preferences in your account settings.',
    category: 'troubleshooting',
    icon: HelpCircle,
  },
];

interface HelpTipsProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export function HelpTips({ isOpen, onClose, category }: HelpTipsProps) {
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');

  const filteredTips = selectedCategory === 'all' 
    ? helpTips 
    : helpTips.filter(tip => tip.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Topics', count: helpTips.length },
    { id: 'getting-started', name: 'Getting Started', count: helpTips.filter(t => t.category === 'getting-started').length },
    { id: 'features', name: 'Features', count: helpTips.filter(t => t.category === 'features').length },
    { id: 'tips', name: 'Tips & Tricks', count: helpTips.filter(t => t.category === 'tips').length },
    { id: 'troubleshooting', name: 'Troubleshooting', count: helpTips.filter(t => t.category === 'troubleshooting').length },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle className="text-xl">Help & Tips</CardTitle>
              <p className="text-sm text-gray-600">Everything you need to know about Carpooly</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="text-xs"
              >
                {cat.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {cat.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          <div className="space-y-4">
            {filteredTips.map(tip => (
              <Card key={tip.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {tip.icon && <tip.icon className="h-5 w-5 text-green-600" />}
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                    >
                      {expandedTip === tip.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedTip === tip.id && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {tip.content}
                    </p>
                    
                    <div className="flex gap-2">
                      {tip.videoUrl && (
                        <Button variant="outline" size="sm" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          Watch Video
                        </Button>
                      )}
                      {tip.externalLink && (
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Learn More
                        </Button>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Need more help? Contact our support team.
            </div>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 