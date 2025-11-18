"use client";
import React from "react";
import { ListPageLayout } from "../components/ListPageLayout"; // Import centralizado
import { useApiData } from "../hooks/useApiData"; // Import do Hook
import { Deputado } from "../types/deputados";
import { ListItem } from "../types/ListItem";
import { getDeputados } from "../api/client";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import { ErrorMessage } from "../components/UI/ErrorMessage";

const transformDeputado = (dep: Deputado): ListItem => ({
  id: dep.id.toString(),
  icon: (
    <img
      className="h-12 w-12 rounded-full object-cover"
      src={dep.urlFoto}
      alt={`Foto de ${dep.nome}`}
      onError={(e) => {
        e.currentTarget.src =
          "https://placehold.co/100x100/E2E8F0/64748B?text=Foto";
      }}
    />
  ),
  title: `${dep.nome} (${dep.siglaPartido})`,
  author: `Estado: ${dep.siglaUf}`,
  description: `Email: ${dep.email || "Não informado"}`,
});

const DeputadosPage: React.FC = () => {
  const { items, isLoading, error } = useApiData(
    getDeputados,
    transformDeputado,
  );

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {!isLoading && !error && (
        <ListPageLayout
          items={items}
          searchPlaceholder="Pesquisar por deputados..."
        />
      )}
    </main>
  );
};

export default DeputadosPage;
