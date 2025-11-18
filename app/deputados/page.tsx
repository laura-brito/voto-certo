"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ListPageLayout } from "../components/ListPageLayout";
import { Deputado } from "../types/deputados";
import { ListItem } from "../types/ListItem";
import { usePaginatedApi } from "../hooks/usePaginatedApi";
import { Pagination } from "flowbite-react";
import { getDeputados } from "../api/client";

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

const transformDeputado = (dep: Deputado): ListItem => {
  return {
    id: dep.id.toString(),
    icon: <DeputadoAvatar urlFoto={dep.urlFoto} nome={dep.nome} />,
    title: `${dep.nome} (${dep.siglaPartido})`,
    author: `Estado: ${dep.siglaUf}`,
    description: `Email: ${dep.email || "Não informado"}`,
  };
};

const DeputadosPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { items, isLoading, error, currentPage, totalPages, setCurrentPage } =
    usePaginatedApi(getDeputados, transformDeputado, searchTerm);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <ListPageLayout
        items={items}
        searchPlaceholder="Pesquisar por deputados..."
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

export default DeputadosPage;
