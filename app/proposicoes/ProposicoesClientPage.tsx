"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  ementa: prop.ementa || "",
  href: `/proposicoes/${prop.id}`,
});

const ProposicoesClientPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchTerm = searchParams.get("q") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  const { items, isLoading, error, totalPages } = usePaginatedApi(
    getProposicoes,
    transformProposicao,
    searchTerm,
    currentPage,
  );

  const handleQueryChange = (
    params: Record<string, string | number | undefined>,
  ) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === "" ||
        (key === "page" && value === 1)
      ) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const onPageChange = (page: number) => {
    handleQueryChange({ page: page });
    window.scrollTo(0, 0);
  };

  const onSearchSubmit = (newSearchTerm: string) => {
    handleQueryChange({ q: newSearchTerm || undefined, page: undefined });
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Proposições Legislativas
        </h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
          Pesquise projetos de lei (PL), propostas de emenda (PEC) e outras
          propostas em tramitação.
        </p>
      </div>
      <ListPageLayout
        items={items}
        searchPlaceholder="Pesquisar por proposições..."
        onSearchSubmit={onSearchSubmit}
        isLoading={isLoading}
        error={error}
        initialSearchTerm={searchTerm}
      />

      <div className="mt-4">
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
      </div>
    </main>
  );
};

export default ProposicoesClientPage;
