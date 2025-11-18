"use client";
import React from "react";
// 1. Importe os hooks de roteamento
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ListPageLayout } from "../components/ListPageLayout";
import { Deputado } from "../types/deputados";
import { ListItem } from "../types/ListItem";
import { usePaginatedApi } from "../hooks/usePaginatedApi";
import { Pagination } from "flowbite-react";
import { getDeputados } from "../api/client";

// --- Componente Avatar (Fora da página) ---
interface DeputadoAvatarProps {
  urlFoto?: string;
  nome: string;
}
const DeputadoAvatar: React.FC<DeputadoAvatarProps> = ({ urlFoto, nome }) => {
  const [src, setSrc] = React.useState<string | undefined>(urlFoto);
  return (
    <div className="h-12 w-12 overflow-hidden rounded-full">
      <Image
        src={src || "https://placehold.co/100x100/E2E8F0/64748B?text=Foto"}
        alt={`Foto de ${nome}`}
        width={48}
        height={48}
        className="object-cover"
        onError={() =>
          setSrc("https://placehold.co/100x100/E2E8F0/64748B?text=Foto")
        }
        unoptimized
      />
    </div>
  );
};

// --- Função de Transformação (Fora da página) ---
const transformDeputado = (dep: Deputado): ListItem => {
  return {
    id: dep.id.toString(),
    icon: <DeputadoAvatar urlFoto={dep.urlFoto} nome={dep.nome} />,
    title: `${dep.nome} (${dep.siglaPartido})`,
    author: `Estado: ${dep.siglaUf}`,
    description: `Email: ${dep.email || "Não informado"}`,
    href: `/deputados/${dep.id}`,
  };
};

// --- Componente da Página ---
const DeputadosPage: React.FC = () => {
  // 2. Inicialize os hooks de roteamento
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 3. LEIA o estado *diretamente* da URL
  const searchTerm = searchParams.get("q") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  // 4. Passe o estado da URL (searchTerm, currentPage) para o hook
  const { items, isLoading, error, totalPages } = usePaginatedApi(
    getDeputados,
    transformDeputado,
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
      <ListPageLayout
        items={items}
        searchPlaceholder="Pesquisar por deputados..."
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

export default DeputadosPage;
