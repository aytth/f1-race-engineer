import type { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

export default function Panel({ title, children, className = '', headerRight }: PanelProps) {
  return (
    <div className={`glass-panel overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-f1-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-f1-text-secondary">
            {title}
          </h3>
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}
