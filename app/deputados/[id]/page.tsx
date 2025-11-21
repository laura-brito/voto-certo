"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { ErrorMessage } from "../../components/UI/ErrorMessage";
import {
  Card,
  Button,
  Table,
  Spinner,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Label,
  Select,
  Accordion,
  AccordionPanel,
  AccordionTitle,
  AccordionContent,
  TableHeadCell,
  Pagination,
} from "flowbite-react";
import {
  HiArrowLeft,
  HiOutlineDocumentText,
  HiChevronRight,
} from "react-icons/hi";
import { LuCoins, LuHouse, LuText } from "react-icons/lu";
import Image from "next/image";
import Link from "next/link";
import { DeputadoDetalhes, Frente } from "@/app/types/deputados";
import { Proposicoes } from "@/app/types/proposicoes";
import {
  getDeputadoById,
  getDeputadoDespesas,
  getFrentesDeputado,
  getProposicoesDoDeputado,
} from "@/app/api/client";

interface AggregatedExpense {
  tipo: string;
  valor: number;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const months = [
  { value: 1, name: "Janeiro" },
  { value: 2, name: "Fevereiro" },
  { value: 3, name: "Março" },
  { value: 4, name: "Abril" },
  { value: 5, name: "Maio" },
  { value: 6, name: "Junho" },
  { value: 7, name: "Julho" },
  { value: 8, name: "Agosto" },
  { value: 9, name: "Setembro" },
  { value: 10, name: "Outubro" },
  { value: 11, name: "Novembro" },
  { value: 12, name: "Dezembro" },
];
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

interface ProposicoesDeputadoListProps {
  proposicoes: Proposicoes[];
  isLoading: boolean;
}

const ProposicoesDeputadoList: React.FC<ProposicoesDeputadoListProps> = ({
  proposicoes,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <Spinner size="lg" />
        <span className="mt-3 text-sm">Carregando proposições...</span>
      </div>
    );
  }

  if (!proposicoes || proposicoes.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhuma proposição encontrada para este período.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proposicoes.map((prop) => (
        <Link
          key={prop.id}
          href={`/proposicoes/${prop.id}`}
          className="group dark:hover:bg-gray-750 flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200 group-hover:text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <HiOutlineDocumentText className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between">
              <h4 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
                {prop.siglaTipo} {prop.numero}/{prop.ano}
              </h4>
              {prop.dataApresentacao && (
                <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  {new Date(prop.dataApresentacao).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>

            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
              {prop.ementa}
            </p>
          </div>

          <div className="flex h-full items-center justify-center text-gray-300 transition-colors group-hover:text-blue-500 dark:text-gray-600">
            <HiChevronRight className="h-5 w-5" />
          </div>
        </Link>
      ))}
    </div>
  );
};

const FrentesList: React.FC<{ frentes: Frente[]; isLoading: boolean }> = ({
  frentes,
  isLoading,
}) => {
  if (frentes.length === 0 && !isLoading) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        O deputado não está registrado em frentes ativas.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
      {frentes.map((frente) => (
        <div
          key={frente.id}
          className="bg-white p-3 text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-white"
        >
          {frente.titulo}
        </div>
      ))}
    </div>
  );
};

const DeputadoDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [deputado, setDeputado] = useState<DeputadoDetalhes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAno, setSelectedAno] = useState(currentYear);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [aggregatedDespesas, setAggregatedDespesas] = useState<
    AggregatedExpense[]
  >([]);
  const [isDespesasLoading, setIsDespesasLoading] = useState(true);
  const [currentMonthYear, setCurrentMonthYear] = useState("");

  const [frentes, setFrentes] = useState<Frente[]>([]);
  const [isFrentesLoading, setIsFrentesLoading] = useState(true);
  const [frentesCurrentPage, setFrentesCurrentPage] = useState(1);
  const frentesPerPage = 5;

  const [proposicoesDeputado, setProposicoesDeputado] = useState<Proposicoes[]>(
    [],
  );
  const [isProposicoesLoading, setIsProposicoesLoading] = useState(true);
  const [proposicoesPage, setProposicoesPage] = useState(1);
  const [totalProposicoesPages, setTotalProposicoesPages] = useState(1);

  useEffect(() => {
    if (id) {
      const fetchDetalhes = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getDeputadoById(id);
          setDeputado(data);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Falha ao buscar detalhes.",
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetalhes();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const fetchDespesas = async () => {
        setIsDespesasLoading(true);
        const dateForTitle = new Date(selectedAno, selectedMes - 1);
        setCurrentMonthYear(
          dateForTitle.toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
          }),
        );

        try {
          const despesasData = await getDeputadoDespesas(
            id,
            selectedAno,
            selectedMes,
          );
          const aggregated = despesasData.reduce(
            (acc, despesa) => {
              const tipo = despesa.tipoDespesa;
              acc[tipo] = (acc[tipo] || 0) + despesa.valorLiquido;
              return acc;
            },
            {} as Record<string, number>,
          );
          const aggregatedArray = Object.entries(aggregated)
            .map(([tipo, valor]) => ({ tipo, valor }))
            .sort((a, b) => b.valor - a.valor);
          setAggregatedDespesas(aggregatedArray);
        } catch (err) {
          console.error("Erro ao buscar despesas:", err);
          setAggregatedDespesas([]);
        } finally {
          setIsDespesasLoading(false);
        }
      };
      fetchDespesas();
    }
  }, [id, selectedAno, selectedMes]);

  useEffect(() => {
    if (id) {
      const fetchFrentes = async () => {
        setIsFrentesLoading(true);
        try {
          const frentesData = await getFrentesDeputado(id);
          setFrentes(frentesData);
        } catch (err) {
          console.error("Erro ao buscar frentes:", err);
          setFrentes([]);
        } finally {
          setIsFrentesLoading(false);
        }
      };
      fetchFrentes();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const fetchProposicoes = async () => {
        setIsProposicoesLoading(true);
        try {
          const response = await getProposicoesDoDeputado(id, proposicoesPage);
          setProposicoesDeputado(response.items);
          setTotalProposicoesPages(response.totalPages);
        } catch (err) {
          console.error("Erro ao buscar proposições:", err);
          setProposicoesDeputado([]);
        } finally {
          setIsProposicoesLoading(false);
        }
      };
      fetchProposicoes();
    }
  }, [id, proposicoesPage]);

  // Handler seguro para paginação
  const handleProposicoesPageChange = (page: number) => {
    if (page !== proposicoesPage) {
      setProposicoesPage(page);
    }
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    if (!deputado) return <ErrorMessage error="Deputado não encontrado." />;

    const { ultimoStatus, dataNascimento, escolaridade } = deputado;
    const { gabinete } = ultimoStatus;
    const totalDespesasAgregado = aggregatedDespesas.reduce(
      (sum, d) => sum + d.valor,
      0,
    );

    const totalFrentesPages = Math.ceil(frentes.length / frentesPerPage);
    const indexOfLastFrente = frentesCurrentPage * frentesPerPage;
    const indexOfFirstFrente = indexOfLastFrente - frentesPerPage;
    const currentFrentes = frentes.slice(indexOfFirstFrente, indexOfLastFrente);

    return (
      <Card className="w-full max-w-3xl">
        <div className="flex flex-col items-center pb-10">
          <Image
            src={ultimoStatus.urlFoto}
            alt={`Foto de ${ultimoStatus.nome}`}
            width={128}
            height={128}
            className="mb-3 h-32 w-32 rounded-full object-cover shadow-lg"
            unoptimized
          />
          <h5 className="mb-1 text-2xl font-medium text-gray-900 dark:text-white">
            {ultimoStatus.nome}
          </h5>
          <span className="text-md text-gray-500 dark:text-gray-400">
            {deputado.nomeCivil}
          </span>
          <div className="mt-4 flex space-x-3">
            <span className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1.5 text-center text-sm font-medium text-blue-800 dark:bg-blue-200 dark:text-blue-800">
              {ultimoStatus.siglaPartido} - {ultimoStatus.siglaUf}
            </span>
          </div>

          <div className="mt-6 w-full divide-y divide-gray-200 text-left dark:divide-gray-700">
            <div className="py-4">
              <h6 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Informações Pessoais
              </h6>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>
                  <strong>Email:</strong> {ultimoStatus.email}
                </li>
                <li>
                  <strong>Nascimento:</strong>{" "}
                  {new Date(dataNascimento).toLocaleDateString("pt-BR")}
                </li>
                <li>
                  <strong>Escolaridade:</strong> {escolaridade}
                </li>
                <li>
                  <strong>Situação:</strong> {ultimoStatus.condicaoEleitoral}
                </li>
              </ul>
            </div>

            {gabinete && (
              <div className="py-4">
                <h6 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Gabinete
                </h6>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>
                    <strong>Local:</strong> Prédio {gabinete.predio}, Anexo{" "}
                    {gabinete.andar}, Sala {gabinete.sala}
                  </li>
                  <li>
                    <strong>Telefone:</strong> {gabinete.telefone}
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 w-full">
            <Accordion alwaysOpen collapseAll>
              <AccordionPanel>
                <AccordionTitle className="flex items-center">
                  <LuCoins className="mr-3 h-4 w-4" />
                  Despesas (Cota Parlamentar)
                  <span className="ml-auto text-sm font-normal text-gray-500">
                    {formatCurrency(totalDespesasAgregado)} em{" "}
                    {currentMonthYear}
                  </span>
                </AccordionTitle>
                <AccordionContent>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="mb-2 block">
                        <Label htmlFor="mes">Mês</Label>
                      </div>
                      <Select
                        id="mes"
                        value={selectedMes}
                        onChange={(e) => setSelectedMes(Number(e.target.value))}
                        disabled={isDespesasLoading}
                      >
                        {months.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <div className="mb-2 block">
                        <Label htmlFor="ano">Ano</Label>
                      </div>
                      <Select
                        id="ano"
                        value={selectedAno}
                        onChange={(e) => setSelectedAno(Number(e.target.value))}
                        disabled={isDespesasLoading}
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {isDespesasLoading ? (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Spinner size="sm" />
                      <span className="ml-2">Carregando despesas...</span>
                    </div>
                  ) : aggregatedDespesas.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table striped hoverable className="text-sm">
                        {/* CORREÇÃO DE HIDRATAÇÃO: TableRow adicionado dentro de TableHead */}
                        <TableHead>
                          <TableRow>
                            <TableHeadCell>Tipo de Despesa</TableHeadCell>
                            <TableHeadCell>Valor Total</TableHeadCell>
                          </TableRow>
                        </TableHead>
                        <TableBody className="divide-y">
                          {aggregatedDespesas.map((despesa) => (
                            <TableRow
                              key={despesa.tipo}
                              className="bg-white dark:border-gray-700 dark:bg-gray-800"
                            >
                              <TableCell className="font-medium text-gray-900 dark:text-white">
                                {despesa.tipo}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(despesa.valor)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nenhuma despesa registrada para {currentMonthYear}.
                    </p>
                  )}
                </AccordionContent>
              </AccordionPanel>

              <AccordionPanel>
                <AccordionTitle className="flex items-center">
                  <LuHouse className="mr-3 h-4 w-4" />
                  Frentes Parlamentares
                </AccordionTitle>
                <AccordionContent>
                  {isFrentesLoading ? (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Spinner size="sm" />
                      <span className="ml-2">Carregando frentes...</span>
                    </div>
                  ) : (
                    <>
                      <FrentesList
                        frentes={currentFrentes}
                        isLoading={isFrentesLoading}
                      />
                      {frentes.length > frentesPerPage && (
                        <div className="mt-4 flex overflow-x-auto sm:justify-center">
                          <Pagination
                            currentPage={frentesCurrentPage}
                            totalPages={totalFrentesPages}
                            onPageChange={setFrentesCurrentPage}
                            showIcons
                          />
                        </div>
                      )}
                    </>
                  )}
                </AccordionContent>
              </AccordionPanel>

              <AccordionPanel>
                <AccordionTitle className="flex items-center">
                  <LuText className="mr-3 h-4 w-4" />
                  Proposições Apresentadas
                </AccordionTitle>
                <AccordionContent>
                  <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                    Últimos projetos de lei, PECs e outras proposições nas quais
                    o deputado é autor ou co-autor.
                  </p>

                  <ProposicoesDeputadoList
                    proposicoes={proposicoesDeputado}
                    isLoading={isProposicoesLoading}
                  />

                  {/* Paginação */}
                  {!isProposicoesLoading &&
                    proposicoesDeputado.length > 0 &&
                    totalProposicoesPages > 1 && (
                      <div className="mt-4 flex justify-center">
                        <Pagination
                          currentPage={proposicoesPage}
                          totalPages={totalProposicoesPages}
                          onPageChange={handleProposicoesPageChange}
                          showIcons
                          layout="pagination"
                        />
                      </div>
                    )}
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="mb-4">
        <Button onClick={() => router.back()} color="gray" size="sm">
          <HiArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
      <div className="flex justify-center">{renderContent()}</div>
    </main>
  );
};

export default DeputadoDetailPage;
