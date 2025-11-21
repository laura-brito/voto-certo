"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ListPageLayout } from "../components/ListPageLayout";
import { Deputado, Partido } from "../types/deputados";
import { ListItem } from "../types/ListItem";
import { usePaginatedApi } from "../hooks/usePaginatedApi";
import { Pagination, Label } from "flowbite-react";
import ReactSelect, { SingleValue } from "react-select";
import { getDeputados, getPartidos } from "../api/client";

interface SelectOption {
  value: string;
  label: string;
}

interface DeputadoAvatarProps {
  urlFoto?: string;
  nome: string;
}

const DeputadoAvatar: React.FC<DeputadoAvatarProps> = ({ urlFoto, nome }) => {
  const [src, setSrc] = React.useState<string | undefined>(urlFoto);
  return (
    <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-200 dark:border-gray-600">
      <Image
        src={src || "https://placehold.co/100x100/E2E8F0/64748B?text=Foto"}
        alt={`Foto de ${nome}`}
        width={48}
        height={48}
        className="h-full w-full object-cover"
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
    title: `${dep.nome}`,
    author: `Partido: ${dep.siglaPartido} - ${dep.siglaUf}`,
    description: `Email: ${dep.email || "Não informado"}`,
    href: `/deputados/${dep.id}`,
  };
};

const DeputadosClientPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [partidos, setPartidos] = useState<Partido[]>([]);

  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const dados = await getPartidos();
        setPartidos(dados);
      } catch (error) {
        console.error("Erro ao carregar partidos:", error);
      }
    };
    fetchRefs();
  }, []);

  const searchTerm = searchParams.get("q") || "";
  const partidoParam = searchParams.get("partido");
  const currentPage = Number(searchParams.get("page")) || 1;

  const filters = {
    nome: searchTerm,
    siglaPartido: partidoParam || undefined,
  };

  const { items, isLoading, error, totalPages } = usePaginatedApi(
    getDeputados,
    transformDeputado,
    filters,
    currentPage,
  );
  const handleRetry = () => {
    window.location.reload();
  };
  const handleQueryChange = (
    params: Record<string, string | number | undefined | null>,
  ) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === "" ||
        value === null ||
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

  const partidoOptions: SelectOption[] = partidos.map((p) => ({
    value: p.sigla,
    label: `${p.sigla} - ${p.nome}`,
  }));

  const selectedPartidoOption = partidoParam
    ? partidoOptions.find((p) => p.value === partidoParam) || null
    : null;

  const reactSelectClassNames = {
    control: (state: { isFocused: boolean }) =>
      `!min-h-[42px] !rounded-lg !border !bg-gray-50 !text-sm dark:!bg-gray-700 dark:!text-white ${
        state.isFocused
          ? "!border-blue-500 !ring-1 !ring-blue-500"
          : "!border-gray-300 dark:!border-gray-600"
      }`,
    menu: () => "!bg-white dark:!bg-gray-700 dark:!text-white !z-20",
    option: (state: { isFocused: boolean; isSelected: boolean }) =>
      `${
        state.isSelected
          ? "!bg-blue-600 !text-white"
          : state.isFocused
            ? "!bg-gray-100 dark:!bg-gray-600"
            : "!bg-white dark:!bg-gray-700"
      } !cursor-pointer`,
    singleValue: () => "!text-gray-900 dark:!text-white",
    input: () => "!text-gray-900 dark:!text-white",
    placeholder: () => "!text-gray-500 dark:!text-gray-400",
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Deputados Federais
        </h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
          Encontre e pesquise deputados em exercício.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="partido">Filtrar por Partido</Label>
          </div>
          <ReactSelect
            instanceId="select-partido"
            options={partidoOptions}
            value={selectedPartidoOption}
            onChange={(newValue) =>
              handleQueryChange({
                partido: (newValue as SingleValue<SelectOption>)?.value || null,
                page: 1,
              })
            }
            placeholder="Selecione um partido..."
            isClearable
            isSearchable
            classNames={reactSelectClassNames}
            classNamePrefix="react-select"
          />
        </div>
      </div>

      <ListPageLayout
        items={items}
        searchPlaceholder="Pesquisar por nome..."
        onSearchSubmit={onSearchSubmit}
        isLoading={isLoading}
        error={error}
        initialSearchTerm={searchTerm}
        onRetry={handleRetry}
      />

      <div className="mt-4">
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex justify-center overflow-x-auto sm:justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              previousLabel=""
              nextLabel=""
              showIcons
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default DeputadosClientPage;
