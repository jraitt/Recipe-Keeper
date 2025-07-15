import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Clock, Plus, Minus } from 'lucide-react';
import { useToast } from '../common/Toast';

interface CookingTimerProps {
  className?: string;
  presetTimes?: { label: string; minutes: number }[];
}

interface TimerState {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isActive: boolean;
  isPaused: boolean;
}

export const CookingTimer: React.FC<CookingTimerProps> = ({ 
  className = '',
  presetTimes = [
    { label: 'Boil Eggs', minutes: 10 },
    { label: 'Pasta', minutes: 12 },
    { label: 'Rice', minutes: 18 },
    { label: 'Bake Cookies', minutes: 15 },
  ]
}) => {
  const [timers, setTimers] = useState<TimerState[]>([]);
  const [newTimerMinutes, setNewTimerMinutes] = useState(5);
  const [newTimerLabel, setNewTimerLabel] = useState('');
  const { addToast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers(prev => prev.map(timer => {
        if (timer.isActive && !timer.isPaused && timer.remainingSeconds > 0) {
          const newRemaining = timer.remainingSeconds - 1;
          if (newRemaining === 0) {
            // Timer finished
            addToast({
              type: 'warning',
              title: 'Timer Finished!',
              message: `${timer.label} timer has finished.`,
              duration: 10000,
            });
            // Play notification sound if available
            if ('Notification' in window) {
              new Notification(`Timer Finished: ${timer.label}`, {
                body: 'Your cooking timer has finished!',
                icon: '/favicon.ico',
              });
            }
            return { ...timer, remainingSeconds: 0, isActive: false };
          }
          return { ...timer, remainingSeconds: newRemaining };
        }
        return timer;
      }));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [addToast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTimer = (label: string, minutes: number) => {
    const newTimer: TimerState = {
      id: Date.now().toString(),
      label,
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      isActive: false,
      isPaused: false,
    };
    setTimers(prev => [...prev, newTimer]);
    setNewTimerLabel('');
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(timer => {
      if (timer.id === id) {
        if (timer.remainingSeconds === 0) {
          // Reset timer
          return {
            ...timer,
            remainingSeconds: timer.totalSeconds,
            isActive: false,
            isPaused: false,
          };
        }
        return {
          ...timer,
          isActive: !timer.isActive,
          isPaused: timer.isActive ? true : false,
        };
      }
      return timer;
    }));
  };

  const resetTimer = (id: string) => {
    setTimers(prev => prev.map(timer => {
      if (timer.id === id) {
        return {
          ...timer,
          remainingSeconds: timer.totalSeconds,
          isActive: false,
          isPaused: false,
        };
      }
      return timer;
    }));
  };

  const removeTimer = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
  };

  const getTimerColor = (timer: TimerState) => {
    if (timer.remainingSeconds === 0) return 'text-red-600';
    if (timer.remainingSeconds < 60) return 'text-yellow-600';
    if (timer.isActive && !timer.isPaused) return 'text-green-600';
    return 'text-gray-600';
  };

  const getProgressPercentage = (timer: TimerState) => {
    return ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Timer className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Cooking Timers</h3>
      </div>

      {/* Add New Timer */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newTimerLabel}
            onChange={(e) => setNewTimerLabel(e.target.value)}
            placeholder="Timer name (e.g., Boil pasta)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Timer name"
          />
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setNewTimerMinutes(Math.max(1, newTimerMinutes - 1))}
              className="p-1 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              aria-label="Decrease minutes"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={newTimerMinutes}
              onChange={(e) => setNewTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="999"
              className="w-16 text-center px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Minutes"
            />
            <button
              onClick={() => setNewTimerMinutes(newTimerMinutes + 1)}
              className="p-1 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              aria-label="Increase minutes"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => addTimer(newTimerLabel || 'Timer', newTimerMinutes)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            aria-label="Add timer"
          >
            Add
          </button>
        </div>

        {/* Preset Timer Buttons */}
        <div className="flex flex-wrap gap-2">
          {presetTimes.map((preset) => (
            <button
              key={preset.label}
              onClick={() => addTimer(preset.label, preset.minutes)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
              aria-label={`Add ${preset.label} timer for ${preset.minutes} minutes`}
            >
              {preset.label} ({preset.minutes}m)
            </button>
          ))}
        </div>
      </div>

      {/* Active Timers */}
      <div className="space-y-3">
        {timers.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No active timers</p>
          </div>
        ) : (
          timers.map((timer) => (
            <div
              key={timer.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{timer.label}</h4>
                <button
                  onClick={() => removeTimer(timer.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                  aria-label="Remove timer"
                >
                  ×
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`text-2xl font-mono ${getTimerColor(timer)}`}>
                  {formatTime(timer.remainingSeconds)}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleTimer(timer.id)}
                    className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                    aria-label={timer.isActive && !timer.isPaused ? 'Pause timer' : 'Start timer'}
                  >
                    {timer.isActive && !timer.isPaused ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => resetTimer(timer.id)}
                    className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    aria-label="Reset timer"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    timer.remainingSeconds === 0 ? 'bg-red-500' : 
                    timer.remainingSeconds < 60 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${getProgressPercentage(timer)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CookingTimer;