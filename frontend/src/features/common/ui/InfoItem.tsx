import React from 'react';
import { marked } from 'marked';

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
}

export function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-base text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  );
}

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
}

export function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {children}
    </div>
  );
} 