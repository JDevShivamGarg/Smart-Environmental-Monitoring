import { useState, useEffect } from 'react';

const SyncTimer = ({ interval }) => {
  const [timeLeft, setTimeLeft] = useState(interval / 1000);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : interval / 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [interval]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-lg">
      Next update in: {minutes}:{seconds < 10 ? '0' : ''}{seconds}
    </div>
  );
};

export default SyncTimer;
