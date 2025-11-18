"use client";
import React from "react";
// 1. Importe os hooks de roteamento
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LuFileText } from "react-icons/lu";
import { ListPageLayout } from "../components/ListPageLayout";
import { Proposicoes } from "../types/proposicoes";
import { ListItem } from "../types/ListItem";
import { usePaginatedApi } from "../hooks/usePaginatedApi";
import { Pagination } from "flowbite-react";
import { getProposicoes } from "../api/client";

// --- Função de Transformação (Fora da página) ---
const transformProposicao = (prop: Proposicoes): ListItem => ({
  id: prop.id.toString(),
  icon: <LuFileText className="h-10 w-10 text-blue-600" />,
  title: `${prop.siglaTipo} ${prop.numero}/${prop.ano}`,
  author: `ID Proposição: ${prop.id}`,
  description: prop.ementa || "Sem ementa disponível.",
  ementa: prop.ementa || "", // Para o "Explicador"
  href: `/proposicoes/${prop.id}`,
});

// --- Componente da Página ---
const ProposicoesClientPage: React.FC = () => {
  // 2. Inicialize os hooks de roteamento
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 3. LEIA o estado *diretamente* da URL
  const searchTerm = searchParams.get("q") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  // 4. Passe o estado da URL (searchTerm, currentPage) para o hook
  const { items, isLoading, error, totalPages } = usePaginatedApi(
    getProposicoes,
    transformProposicao,
    searchTerm,
    currentPage,
  );

  /**
   * 5. Função helper para ATUALIZAR a URL com novos parâmetros
   */
  const handleQueryChange = (
    params: Record<string, string | number | undefined>,
  ) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      // Remove o parâmetro se o valor for indefinido, vazio ou 1 (para a página)
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
    // Atualiza a URL sem recarregar a página
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // 6. Handler de paginação (agora atualiza a URL)
  const onPageChange = (page: number) => {
    handleQueryChange({ page: page }); // A lógica de '1' é tratada no helper
    window.scrollTo(0, 0);
  };

  // 7. Handler de busca (agora atualiza a URL e reseta a página)
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
        // 8. Passe o 'searchTerm' da URL para o layout
        initialSearchTerm={searchTerm}
      />

      <div className="mt-4">
        {!isLoading && !error && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage} // Controlado pela URL
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
