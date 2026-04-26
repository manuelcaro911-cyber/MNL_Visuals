import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const ScrollableContainer: React.FC<Props> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = () => {
    if (!isScrolling) setIsScrolling(true);
    
    if (containerRef.current && progressBarRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const progress = scrollTop / (scrollHeight - clientHeight);
      const heightPercentage = Math.max(10, (progress || 0) * 100);
      progressBarRef.current.style.height = `${heightPercentage}%`;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div 
      className="relative flex-1 w-full h-full overflow-hidden flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto scroll-smooth ${className}`}
        style={{ WebkitOverflowScrolling: 'touch', willChange: 'scroll-position' }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScrollableContainer;
