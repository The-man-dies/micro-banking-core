import type React from "react";

interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  children,
  className,
}) => (
  <div
    className={`bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg ${className || ""}`}
  >
    <h3 className="text-white text-lg font-bold mb-4">{title}</h3>
    <div className="h-80">{children}</div>
  </div>
);

export default ChartWrapper;
