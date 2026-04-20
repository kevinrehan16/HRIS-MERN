import React, { ReactNode } from 'react';

interface NoDataFoundProps {
  messageIcon?: ReactNode; // Optional Icon sa kaliwa ng Title
  message: string;
  subMessage?: string; // Optional subtitle
}

const NoDataFound: React.FC<NoDataFoundProps> = ({ messageIcon, message, subMessage }) => {
  return (
    /* Inalis ang mb-8 at rounded-b-xl para maging flat sa ilalim at walang space */
    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
      {messageIcon && <div className="text-slate-400 text-5xl">{messageIcon}</div>}
      <p className="font-medium">{ message }</p>
      {subMessage && <p className="text-xs">{ subMessage }</p>}
    </div>
  );
};

export default NoDataFound;