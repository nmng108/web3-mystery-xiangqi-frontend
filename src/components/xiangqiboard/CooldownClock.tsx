import React, { useState, useEffect } from 'react';

type Props = {
  timeLeft: number; // Initial cooldown time in milliseconds
  setTimeLeft: (cb: (prev: number) => number) => void; // Initial cooldown time in minutes
  stopped?: boolean;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

const CooldownClock: React.FC<Props> = (props) => {
  useEffect(() => {
    if (props.stopped || props.timeLeft <= 0) return; // Stop countdown if time reaches 0

    const interval = setInterval(() => {
      props.setTimeLeft((prev) => prev - 1000);
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [props.timeLeft, props.stopped, props]);

  const htmlProps = { ...props };

  delete htmlProps.timeLeft;
  delete htmlProps.stopped;

  return <span {...props}>{props.timeLeft > 0 ? formatTime(props.timeLeft) : 'Timeout!'}</span>;
};

export default CooldownClock;

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 1000 / 60);
  const seconds = Math.round((time / 1000) % 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
