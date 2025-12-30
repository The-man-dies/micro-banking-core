// components/ui/StatusBadge.tsx
import React from 'react';
import type { TransactionStatus, TransactionType } from './type';

interface StatusBadgeProps {
  type?: TransactionType;
  status?: TransactionStatus;
  label: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status, label }) => {
  let className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ";
  
  if (type) {
    className += type === 'depot' 
      ? 'bg-green-500/20 text-green-400' 
      : 'bg-rose-500/20 text-rose-400';
  } else if (status) {
    className += status === 'Complet' 
      ? 'bg-green-500/20 text-green-400' 
      : status === 'En cours'
      ? 'bg-yellow-500/20 text-yellow-400'
      : 'bg-blue-500/20 text-blue-400';
  }
  
  return <span className={className}>{label}</span>;
};

export default StatusBadge;