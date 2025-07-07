import React, { ReactNode, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({ top: 0, left: 0, placement: 'top' });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (visible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const margin = 8;
      let top = triggerRect.bottom + margin;
      let placement: 'top' | 'bottom' = 'bottom';
      if (top + tooltipRect.height > window.innerHeight) {
        // Not enough space below, show above
        top = triggerRect.top - tooltipRect.height - margin;
        placement = 'top';
      }
      // Clamp horizontally
      let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));
      setCoords({ top: Math.max(top, margin), left, placement });
    }
  }, [visible, content]);

  return (
    <span
      ref={triggerRef}
      className="relative inline-block focus:outline-none"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
    >
      {children}
      {visible && typeof window !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
            pointerEvents: 'none',
            transition: 'opacity 0.15s',
          }}
          className="px-3 py-2 rounded bg-gray-900 text-white text-xs shadow-lg whitespace-pre-line min-w-[180px] max-w-xs text-center opacity-100"
        >
          {content}
        </div>,
        document.body
      )}
    </span>
  );
}; 