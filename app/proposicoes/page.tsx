"use client";
import React from "react";
import { LuFileText } from "react-icons/lu";
import { ListPageLayout } from "../components/ListPageLayout"; // Import centralizado
import { useApiData } from "../hooks/useApiData"; // Import do Hook
import { Proposicoes } from "../types/proposicoes";
import { ListItem } from "../types/ListItem";
import { getProposicoes } from "../api/client";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import { ErrorMessage } from "../components/UI/ErrorMessage";

// Função que transforma o dado "Proposicao" em "ListItem"
const transformProposicao = (prop: Proposicoes): ListItem => ({
  id: prop.id.toString(),
  icon: <LuFileText className="h-10 w-10 text-blue-600" />,
  title: `${prop.siglaTipo} ${prop.numero}/${prop.ano}`,
  author: `ID Proposição: ${prop.id}`,
  description: prop.ementa || "Sem ementa disponível.",
});

const ProposicoesPage: React.FC = () => {
  // O Hook faz todo o trabalho sujo!
  const { items, isLoading, error } = useApiData(
    getProposicoes,
    transformProposicao,
  );

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {!isLoading && !error && (
        <ListPageLayout
          items={items}
          searchPlaceholder="Pesquisar por proposições..."
        />
      )}
    </main>
  );
};

export default ProposicoesPage;
