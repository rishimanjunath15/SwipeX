import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

/**
 * Timer Component
 * Countdown timer that triggers callback when time expires
 */
export default function Timer({ initialTime, onExpire }) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Reset when initialTime changes
    setTimeRemaining(initialTime);
    setIsExpired(false);
  }, [initialTime]);

  useEffect(() => {
    if (timeRemaining <= 0 && !isExpired) {
      setIsExpired(true);
      if (onExpire) {
        onExpire();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isExpired, onExpire]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    if (timeRemaining <= 10) return 'text-red-600 bg-red-50';
    if (timeRemaining <= 30) return 'text-amber-600 bg-amber-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${getColorClass()}`}>
      {timeRemaining <= 10 ? (
        <AlertCircle size={18} className="animate-pulse" />
      ) : (
        <Clock size={18} />
      )}
      <span className="font-mono font-semibold text-lg">
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}
