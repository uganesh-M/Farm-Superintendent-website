import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-[#DCE4DC] rounded-xl my-4">
      <div className="p-4 bg-[#F7F6EF] text-[#1F5D42] rounded-xl mb-4 border border-[#DCE4DC]">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-[#202A24] tracking-tight">{title}</h3>
      <p className="text-sm text-[#657168] mt-1 max-w-md leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1F5D42] rounded-lg hover:bg-[#16432F] transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F5D42]"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
