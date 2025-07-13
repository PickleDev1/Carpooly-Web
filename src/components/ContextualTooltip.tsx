"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  X, 
  Lightbulb,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface TooltipData {
  id: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  onAction?: () => void;
  dismissible?: boolean;
}

interface ContextualTooltipProps {
  tooltip: TooltipData | null;
  onDismiss: (id: string) => void;
  onAction?: (id: string) => void;
}

export function ContextualTooltip({ tooltip, onDismiss, onAction }: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tooltip) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [tooltip]);

  if (!tooltip || !isVisible) return null;

  const getPositionClasses = () => {
    switch (tooltip.position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (tooltip.position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-green-500';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-green-500';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-green-500';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-green-500';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-green-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="relative w-full h-full">
        <div 
          ref={tooltipRef}
          className={`absolute ${getPositionClasses()} pointer-events-auto`}
        >
          {/* Arrow */}
          <div className={`absolute w-0 h-0 border-4 border-transparent ${getArrowClasses()}`} />
          
          {/* Tooltip Content */}
          <div className="bg-white rounded-lg shadow-lg border border-green-200 max-w-xs p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-green-600" />
                <Badge variant="secondary" className="text-xs">
                  Tip
                </Badge>
              </div>
              {tooltip.dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(tooltip.id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <h4 className="font-semibold text-sm mb-2">{tooltip.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{tooltip.content}</p>
            
            {tooltip.action && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onAction?.(tooltip.id);
                    tooltip.onAction?.();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-xs"
                >
                  {tooltip.action}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
                {tooltip.dismissible && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDismiss(tooltip.id)}
                    className="text-xs"
                  >
                    Got it
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing tooltips
export function useTooltips() {
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);
  const [dismissedTooltips, setDismissedTooltips] = useState<Set<string>>(new Set());

  const showTooltip = (tooltip: TooltipData) => {
    if (!dismissedTooltips.has(tooltip.id)) {
      setActiveTooltip(tooltip);
    }
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  const dismissTooltip = (id: string) => {
    setDismissedTooltips(prev => new Set(Array.from(prev).concat(id)));
    setActiveTooltip(null);
  };

  const resetTooltips = () => {
    setDismissedTooltips(new Set());
  };

  return {
    activeTooltip,
    showTooltip,
    hideTooltip,
    dismissTooltip,
    resetTooltips,
  };
} 