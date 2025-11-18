import React from "react";

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-10 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
      <span className="ml-4 text-lg font-medium">Carregando...</span>
    </div>
  );
};
