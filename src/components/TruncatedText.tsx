import React from 'react';

function truncateMiddle(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const totalShown = maxLength - 3; // Subtract 3 for "..."
  const halfSize = Math.floor(totalShown / 2);

  return `${text.slice(0, halfSize)}...${text.slice(-(totalShown - halfSize))}`;
}

type Props = {
  text?: string;
  maxLength: number
}

const TruncatedText: React.FC<Props> = ({ text, maxLength }) => {
  const truncatedText = text ? truncateMiddle(text, maxLength) : '';

  return (
    <span className="truncate text-gray-700">{truncatedText}</span>
  );
};

export default TruncatedText;
