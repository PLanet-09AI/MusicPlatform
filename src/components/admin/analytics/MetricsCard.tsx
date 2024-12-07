import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: Icon
}) => {
  return (
    <div className="bg-primary-black/50 p-6 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-primary-gray text-sm">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="p-2 bg-accent-blue/10 rounded-lg">
          <Icon className="h-6 w-6 text-accent-blue" />
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;