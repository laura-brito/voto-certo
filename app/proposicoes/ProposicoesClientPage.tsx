"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LuFileText } from "react-icons/lu";
import { ListPageLayout } from "../components/ListPageLayout";
import {
  Proposicoes,
  ReferenciaTema,
  ReferenciaTipoProposicao,
} from "../types/proposicoes";
import { ListItem } from "../types/ListItem";
import { usePaginatedApi } from "../hooks/usePaginatedApi";
import { Pagination, Label } from "flowbite-react";
import ReactSelect, { MultiValue } from "react-select";
import { getProposicoes, getTemas, getTiposProposicao } from "../api/client";

interface SelectOption {
  value: string;
  label: string;
}

const transformProposicao = (prop: Proposicoes): ListItem => ({
  id: prop.id.toString(),
  icon: <LuFileText className="h-10 w-10 text-blue-600" />,
  title: `${prop.siglaTipo} ${prop.numero}/${prop.ano}`,
  author: `ID Proposição: ${prop.id}`,
  description: prop.ementa || "Sem ementa disponível.",
  ementa: prop.ementa || "",
  href: `/proposicoes/${prop.id}`,
});
const DEFAULT_SIGLAS = "PL,PEC,PET"; // Projetos de Lei, Emendas à Const., Medidas Provisórias

const ProposicoesClientPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasSetDefaults = useRef(false);
  const [temas, setTemas] = useState<ReferenciaTema[]>([]);
  const [tipos, setTipos] = useState<ReferenciaTipoProposicao[]>([]);

  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const [temasData, tiposData] = await Promise.all([
          getTemas(),
          getTiposProposicao(),
        ]);

        // FILTRO DE SEGURANÇA: Remove itens sem nome ou código/sigla
        const temasValidos = temasData
          .filter((t) => t.cod && t.nome)
          .sort((a, b) => a.nome.localeCompare(b.nome));

        const tiposValidos = tiposData
          .filter((t) => t.sigla && t.nome)
          .sort((a, b) => a.nome.localeCompare(b.nome));

        setTemas(temasValidos);
        setTipos(tiposValidos);
      } catch (error) {
        console.error("Erro ao carregar referências:", error);
      }
    };
    fetchRefs();
  }, []);
  const searchTerm = searchParams.get("q") || "";
  const tema = searchParams.get("tema");
  const sigla = searchParams.get("sigla"); // Agora pode ser null se estiver vazio
  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    // Se ainda não aplicamos os defaults E não existe o parametro 'sigla' na URL
    if (!hasSetDefaults.current && !searchParams.has("sigla")) {
      hasSetDefaults.current = true;

      // Atualiza a URL com os padrões (usando replace para não sujar o histórico)
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("sigla", DEFAULT_SIGLAS);
      router.replace(`${pathname}?${newParams.toString()}`);
    }
  }, [searchParams, pathname, router]);

  // Objeto de filtros para o hook
  const filters = {
    keywords: searchTerm,
    codTema: tema || undefined,
    siglaTipo: sigla || undefined,
  };

  const { items, isLoading, error, totalPages } = usePaginatedApi(
    getProposicoes,
    transformProposicao,
    filters,
    currentPage,
  );
  // Helper para atualizar URL
  const handleQueryChange = (
    params: Record<string, string | number | undefined | null>,
  ) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      // Remove se for undefined, string vazia, null ou página 1
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
  const handleRetry = () => {
    window.location.reload();
  };
  const onPageChange = (page: number) => {
    handleQueryChange({ page: page });
    window.scrollTo(0, 0);
  };

  const onSearchSubmit = (newSearchTerm: string) => {
    handleQueryChange({ q: newSearchTerm || undefined, page: undefined });
  };

  // 2. Preparar Opções para o React Select
  const temaOptions: SelectOption[] = temas.map((t) => ({
    value: t.cod,
    label: t.nome,
  }));

  const tipoOptions: SelectOption[] = tipos.map((t) => ({
    value: t.sigla,
    label: `${t.sigla} - ${t.nome}`,
  }));

  // 3. Lógica de Seleção Robusta
  // Só busca a opção se houver um valor válido na URL (não nulo e não vazio)
  const selectedTemaOption =
    (tema && temaOptions.find((option) => option.value === tema)) || null;

  const selectedSiglaOptions = sigla
    ? tipoOptions.filter((option) => sigla.split(",").includes(option.value))
    : [];

  // 4. Estilos customizados para Dark Mode com Tailwind
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
          Proposições Legislativas
        </h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
          Pesquise projetos de lei (PL), propostas de emenda (PEC) e outras
          propostas em tramitação.
        </p>
      </div>

      {/* --- ÁREA DE FILTROS --- */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Filtro de Tema (Com React Select) */}
        <div>
          <div className="mb-2 block">
            <Label htmlFor="tema">Filtrar por Tema</Label>
          </div>
          <ReactSelect
            instanceId="select-tema"
            options={temaOptions}
            value={selectedTemaOption}
            onChange={(newValue) =>
              handleQueryChange({
                tema: (newValue as SelectOption)?.value || null,
                page: 1,
              })
            }
            placeholder="Selecione ou digite um tema..."
            isClearable
            isSearchable
            classNames={reactSelectClassNames}
            classNamePrefix="react-select"
          />
        </div>

        {/* Filtro de Sigla/Tipo (Com React Select) */}
        <div>
          <div className="mb-2 block">
            <Label htmlFor="sigla">Tipo de Proposição</Label>
          </div>
          <ReactSelect
            instanceId="select-sigla"
            options={tipoOptions}
            value={selectedSiglaOptions} // Agora aceita array
            isMulti // Habilita seleção múltipla
            onChange={(newValue) => {
              // Transforma o array de objetos em string separada por vírgula
              const values = (newValue as MultiValue<SelectOption>)
                .map((v) => v.value)
                .join(",");
              handleQueryChange({
                sigla: values || null,
                page: 1,
              });
            }}
            placeholder="Selecione os tipos..."
            isClearable
            isSearchable
            classNames={reactSelectClassNames}
            classNamePrefix="react-select"
          />
        </div>
      </div>

      <ListPageLayout
        items={items}
        searchPlaceholder="Pesquisar por palavras-chave (ementa)..."
        onSearchSubmit={onSearchSubmit}
        isLoading={isLoading}
        error={error}
        initialSearchTerm={searchTerm}
        onRetry={handleRetry}
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
