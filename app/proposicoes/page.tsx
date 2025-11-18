"use client";
import React, { useState } from "react";
import { LuFileText } from "react-icons/lu";
import { ListPageLayout } from "../components/ListPageLayout";
import { Proposicoes } from "../types/proposicoes";
import { ListItem } from "../types/ListItem";
import { usePaginatedApi } from "../hooks/usePaginatedApi";
import { Pagination } from "flowbite-react";
import { getProposicoes } from "../api/client";

const transformProposicao = (prop: Proposicoes): ListItem => ({
  id: prop.id.toString(),
  icon: <LuFileText className="h-10 w-10 text-blue-600" />,
  title: `${prop.siglaTipo} ${prop.numero}/${prop.ano}`,
  author: `ID Proposição: ${prop.id}`,
  description: prop.ementa || "Sem ementa disponível.",
  href: `/proposicoes/${prop.id}`,
});

const ProposicoesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { items, isLoading, error, currentPage, totalPages, setCurrentPage } =
    usePaginatedApi(getProposicoes, transformProposicao, searchTerm);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <ListPageLayout
        items={items}
        searchPlaceholder="Pesquisar por proposições..."
        onSearchSubmit={setSearchTerm}
        isLoading={isLoading}
        error={error}
      />

      {!isLoading && !error && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showIcons
          />
        </div>
      )}
    </main>
  );
};

export default ProposicoesPage;
