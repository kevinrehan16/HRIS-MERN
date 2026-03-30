import React, { ReactNode } from 'react';

// Magse-set tayo ng props para pwede nating baguhin ang text sa bawat page
interface PageHeaderProps {
  title: string;
  subtitle?: string; // Optional subtitle
  titleIcon?: ReactNode; // Optional Icon sa kaliwa ng Title
  children?: ReactNode; // Dito natin ilalagay yung nasa kanan (Date Picker, Buttons, etc.)
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, titleIcon, children }) => {
  return (
    /* Inalis ang mb-8 at rounded-b-xl para maging flat sa ilalim at walang space */
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 pt-2 pb-32 px-4 text-white shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {titleIcon && <div className="text-white/70 text-2xl">{titleIcon}</div>}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          </div>
          {subtitle && <p className="mt-2 text-white/80 text-[1.1rem] font-medium">{subtitle}</p>}
        </div>
        <div className="flex-shrink-0">{children}</div>
      </div>
    </div>
  );
};

export default PageHeader;