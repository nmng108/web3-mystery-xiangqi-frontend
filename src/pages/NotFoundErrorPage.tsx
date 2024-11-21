import React from 'react';

const NotFoundErrorPage: React.FC = () => {
  return (
    <div className="w-full h-max bg-black">
      <p className="text-5xl text-blue-900 font-bold">
        Error: page is not found :((
      </p>
    </div>
  );
};

export default NotFoundErrorPage;