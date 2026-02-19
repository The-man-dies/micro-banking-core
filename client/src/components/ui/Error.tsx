import React from "react";

interface ErrorProps {
  message: string;
  className?: string;
}

const ErrorComponent: React.FC<ErrorProps> = ({ message, className }) => {
  return (
    <div
      className={`flex justify-center items-center h-screen bg-gray-900 text-red-400 ${className || ""}`}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Une erreur est survenue</h2>
        <p>{message || "Une erreur inconnue est survenue."}</p>
      </div>
    </div>
  );
};

export { ErrorComponent };
