import React from "react";

interface NoDataProps {
  message?: string;
  className?: string;
}

const NoData: React.FC<NoDataProps> = ({ message, className }) => (
  <p className={`text-gray-400 text-center mt-10 ${className || ""}`}>
    {message || "Données non disponibles."}
  </p>
);

export default NoData;
