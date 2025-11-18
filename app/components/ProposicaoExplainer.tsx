"use client";

import { useState } from "react";
import { Button, Spinner, Alert } from "flowbite-react";
import { HiSparkles, HiExclamation } from "react-icons/hi";
import ReactMarkdown from "react-markdown"; // 1. Importe o ReactMarkdown

interface ProposicaoExplainerProps {
  ementa: string;
  proposicaoId: string;
}

export const ProposicaoExplainer: React.FC<ProposicaoExplainerProps> = ({
  ementa,
  proposicaoId,
}) => {
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setExplanation("");

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ementa, proposicaoId }),
      });

      if (!response.ok) {
        throw new Error("Falha ao buscar explicação da API.");
      }

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleExplain}
        disabled={isLoading}
        color="purple"
        size="xs"
      >
        {isLoading ? (
          <>
            <Spinner size="sm" />
            <span className="pl-2">Analisando...</span>
          </>
        ) : (
          <>
            <HiSparkles className="mr-1 h-4 w-4" />
            Explicar
          </>
        )}
      </Button>

      {/* --- MUDANÇA AQUI --- */}
      {explanation && (
        <Alert
          color="purple"
          withBorderAccent
          className="mt-2"
          onDismiss={() => setExplanation("")}
        >
          {/* 2. Substitua o <span> por <ReactMarkdown> */}
          {/* 'prose' é uma classe do Tailwind para formatar Markdown */}
          <div className="prose prose-sm dark:prose-invert">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        </Alert>
      )}
      {/* --- FIM DA MUDANÇA --- */}

      {error && (
        <Alert
          color="failure"
          icon={HiExclamation}
          className="mt-2"
          onDismiss={() => setError(null)}
        >
          <span className="font-medium">Erro:</span> {error}
        </Alert>
      )}
    </div>
  );
};
