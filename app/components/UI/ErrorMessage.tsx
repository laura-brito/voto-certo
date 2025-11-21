import React from "react";
import { Button } from "flowbite-react";
import { HiRefresh, HiExclamation } from "react-icons/hi";

interface ErrorMessageProps {
  /** Mensagem técnica ou específica do erro (opcional) */
  error?: string | null;
  /** Função para tentar recarregar os dados (opcional) */
  onRetry?: () => void;
}

/**
 * Componente genérico para exibir estados de erro na aplicação.
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
}) => {
  // Mensagem padrão amigável
  const message =
    error ||
    "Não foi possível conectar ao servidor da Câmara. Por favor, verifique sua conexão ou tente novamente mais tarde.";

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-gray-800">
      <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <HiExclamation className="h-8 w-8" />
      </div>

      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
        Ops! Algo deu errado
      </h3>

      <p className="mb-6 max-w-md text-sm text-gray-600 dark:text-gray-400">
        {message}
      </p>

      {onRetry && (
        <Button color="failure" size="sm" onClick={onRetry}>
          <HiRefresh className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      )}
    </div>
  );
};
