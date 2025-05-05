import { ReactNode } from "react";

interface StatCardProps {
  value: number;
  title: string;
  subtitle: string;
  icon: ReactNode;
  bgColor: string;
}

const StatCard = ({ value, title, subtitle, icon, bgColor }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-xs text-gray-500 uppercase mt-1">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <div className={`${bgColor} p-2 rounded-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
