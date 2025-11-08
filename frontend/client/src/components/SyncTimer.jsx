import { useState, useEffect } from 'react';
import { getTimeUntilNextRefresh } from '../utils/cache';
import { Clock } from 'lucide-react';

const SyncTimer = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextRefresh());

  useEffect(() => {
    // Update countdown every second
    const intervalId = setInterval(() => {
      setTimeLeft(getTimeUntilNextRefresh());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="flex items-center gap-2 glass px-4 py-2 rounded-lg">
      <Clock className="w-4 h-4 text-blue-500" />
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        <span className="text-gray-500 dark:text-gray-400">Next refresh: </span>
        <span className="font-mono text-blue-600 dark:text-blue-400">
          {hours}h {minutes}m {seconds}s
        </span>
      </div>
    </div>
  );
};

export default SyncTimer;
