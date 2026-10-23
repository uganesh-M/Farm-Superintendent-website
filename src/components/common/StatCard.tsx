import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  highlight = false,
}) => {
  return (
    <div
      className={`p-5 bg-white rounded-xl border transition-shadow duration-200 ${
        highlight
          ? 'border-[#E6B84A] shadow-xs'
          : 'border-[#DCE4DC] hover:shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#657168] uppercase tracking-wider">{label}</span>
        <div className="p-2 rounded-lg bg-[#F7F6EF] text-[#1F5D42]">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold text-[#202A24] font-tabular tracking-tight">
          {value}
        </span>
        {subtext && <p className="text-xs text-[#657168] mt-1">{subtext}</p>}
      </div>
    </div>
  );
};
