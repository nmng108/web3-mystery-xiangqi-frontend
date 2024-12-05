import React, { useState, useEffect } from 'react';

type Props = {
  initialMilliseconds: number; // Initial cooldown time in minutes
  stopped?: boolean;
};

const CooldownClock: React.FC<
  Props & React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
> = (props) => {
  const [timeLeft, setTimeLeft] = useState<number>(props.initialMilliseconds / 1000);

  useEffect(() => {
    if (!props.stopped || timeLeft <= 0) return; // Stop countdown if time reaches 0

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [timeLeft, props.stopped]);

  return <span {...props}>{timeLeft > 0 ? formatTime(timeLeft) : 'Timeout!'}</span>;
};

export default CooldownClock;

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
