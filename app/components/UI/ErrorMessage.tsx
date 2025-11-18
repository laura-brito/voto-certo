import React from "react";

interface ErrorMessageProps {
  /** A mensagem de erro específica a ser exibida. */
  error: string;
}

/**
 * Um componente para exibir uma mensagem de erro formatada
 * em um card de destaque.
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  return (
    <div className="rounded-lg border border-red-400 bg-red-100 p-10 text-red-700 shadow-lg dark:border-red-700 dark:bg-gray-800 dark:text-red-300">
      <h3 className="mb-2 text-lg font-semibold">Ocorreu um Erro</h3>
      <p>{error}</p>
    </div>
  );
};
