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
  Accordion, // Importação necessária
  ListGroup,
  AccordionPanel,
  AccordionContent,
  AccordionTitle,
  TableHeadCell,
  ListGroupItem,
  Pagination,
  Tooltip, // Para a lista de Histórico
} from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import Image from "next/image";
import { DeputadoDetalhes, Frente } from "@/app/types/deputados";
import {
  getDeputadoById,
  getDeputadoDespesas,
  getFrentesDeputado,
  getProposicoesDoDeputado,
} from "@/app/api/client";
import { LuCoins, LuHouse, LuText } from "react-icons/lu";
import { Proposicoes } from "@/app/types/proposicoes";
import Link from "next/link";

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
      <div className="py-4 text-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (proposicoes.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Nenhuma proposição recente encontrada.
      </p>
    );
  }

  return (
    <ListGroup className="w-full">
      {proposicoes.map((prop) => (
        <Link key={prop.id} href={`/proposicoes/${prop.id}`} passHref>
          <ListGroupItem className="block! cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex flex-row justify-around">
              <Tooltip content={prop.ementa} placement="bottom">
                <p className="mt-1 line-clamp-2 cursor-help text-sm text-gray-700 dark:text-gray-300">
                  {prop.ementa}
                </p>
              </Tooltip>
              <div className="mb-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                <span className="text-sm text-blue-600 hover:underline sm:ml-auto">
                  Ver Detalhes
                </span>
              </div>
            </div>
          </ListGroupItem>
        </Link>
      ))}
    </ListGroup>
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
    <ListGroup className="w-full">
      {frentes.map((frente) => (
        <ListGroupItem key={frente.id}>
          <div className="flex justify-start text-start font-semibold text-gray-900 dark:text-white">
            {frente.titulo}
          </div>
        </ListGroupItem>
      ))}
    </ListGroup>
  );
};

const DeputadoDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [deputado, setDeputado] = useState<DeputadoDetalhes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Filtro de Despesas
  const [selectedAno, setSelectedAno] = useState(currentYear);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);

  // Estados de Despesas
  const [aggregatedDespesas, setAggregatedDespesas] = useState<
    AggregatedExpense[]
  >([]);
  const [isDespesasLoading, setIsDespesasLoading] = useState(true);
  const [currentMonthYear, setCurrentMonthYear] = useState("");

  const [frentes, setFrentes] = useState<Frente[]>([]);
  const [isFrentesLoading, setIsFrentesLoading] = useState(true);

  const [frentesCurrentPage, setFrentesCurrentPage] = useState(1);
  const frentesPerPage = 10;

  const [proposicoesDeputado, setProposicoesDeputado] = useState<Proposicoes[]>(
    [],
  );
  const [isProposicoesLoading, setIsProposicoesLoading] = useState(true);

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

  // Efeito 2: Busca de Despesas (depende dos filtros - SEM MUDANÇAS)
  useEffect(() => {
    if (id) {
      // ... (Lógica de fetch e agregação de despesas - MANTIDA) ...
      const fetchDespesas = async () => {
        setIsDespesasLoading(true);
        // Atualiza o título com base nos estados selecionados
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
          // Lógica de agregação
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

  // NOVO EFEITO: Busca de Frentes Parlamentares
  useEffect(() => {
    if (id) {
      const fetchFrentes = async () => {
        setIsFrentesLoading(true); // Liga o novo loading
        try {
          const frentesData = await getFrentesDeputado(id); // Chama a nova função
          setFrentes(frentesData);
        } catch (err) {
          console.error("Erro ao buscar frentes:", err);
          setFrentes([]);
        } finally {
          setIsFrentesLoading(false); // Desliga o novo loading
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
          const proposicoesData = await getProposicoesDoDeputado(id);
          setProposicoesDeputado(proposicoesData);
        } catch (err) {
          console.error("Erro ao buscar proposições:", err);
          setProposicoesDeputado([]);
        } finally {
          setIsProposicoesLoading(false);
        }
      };
      fetchProposicoes();
    }
  }, [id]);
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <ErrorMessage error={error} />;
    }
    if (!deputado) {
      return <ErrorMessage error="Deputado não encontrado." />;
    }

    const { ultimoStatus, dataNascimento, escolaridade } = deputado;
    const { gabinete } = ultimoStatus;
    const totalDespesasAgregado = aggregatedDespesas.reduce(
      (sum, d) => sum + d.valor,
      0,
    );
    const totalFrentesPages = Math.ceil(frentes.length / frentesPerPage);
    const indexOfLastFrente = frentesCurrentPage * frentesPerPage;
    const indexOfFirstFrente = indexOfLastFrente - frentesPerPage;
    // Pega apenas o slice da lista de frentes para a página atual
    const currentFrentes = frentes.slice(indexOfFirstFrente, indexOfLastFrente);

    return (
      <Card className="w-full max-w-3xl">
        <div className="flex flex-col items-center pb-10">
          {/* Foto e Nome (Topo) */}
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

          {/* Seções de Informações Pessoais (Acima do Accordion) */}
          <div className="mt-6 w-full divide-y divide-gray-200 text-left dark:divide-gray-700">
            {/* Informações Pessoais */}
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

            {/* Gabinete */}
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

          {/* 3. ACCORDION PRINCIPAL */}
          <div className="mt-6 w-full">
            <Accordion alwaysOpen collapseAll>
              {/* Painel 1: Despesas */}
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
                  <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                    A Cota para o Exercício da Atividade Parlamentar (CEAP) visa
                    ressarcir despesas como passagens aéreas, combustível e
                    manutenção de escritórios.
                  </p>

                  {/* Filtros */}
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

                  {/* Tabela de Despesas */}
                  {isDespesasLoading ? (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Spinner size="sm" />
                      <span className="ml-2">Carregando despesas...</span>
                    </div>
                  ) : aggregatedDespesas.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table striped hoverable className="text-sm">
                        <TableHead>
                          <TableRow>
                            {/* CORREÇÃO: Use Table.HeadCell */}
                            <TableHeadCell>Tipo de Despesa</TableHeadCell>
                            <TableHeadCell>Valor Total</TableHeadCell>
                          </TableRow>
                        </TableHead>

                        {/* CORREÇÃO: Use Table.Body */}
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

              {/* Painel 2: Histórico de Ocupações */}
              <AccordionPanel>
                <AccordionTitle className="flex items-center">
                  <LuHouse className="mr-3 h-4 w-4" />
                  Frentes Parlamentares
                </AccordionTitle>
                <AccordionContent>
                  <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                    Grupos de deputados de diversos partidos unidos por um
                    interesse comum. A adesão reflete a área de atuação e foco
                    do parlamentar.
                  </p>
                  {isFrentesLoading ? (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Spinner size="sm" />
                      <span className="ml-2">Carregando frentes...</span>
                    </div>
                  ) : (
                    <>
                      {/* Renderiza a lista fatiada (apenas 10 itens) */}
                      <FrentesList
                        frentes={currentFrentes}
                        isLoading={isFrentesLoading}
                      />

                      {/* --- PAGINAÇÃO DE FRENTES --- */}
                      {frentes.length > frentesPerPage && (
                        <div className="mt-4 flex overflow-x-auto sm:justify-center">
                          <Pagination
                            currentPage={frentesCurrentPage}
                            totalPages={totalFrentesPages}
                            onPageChange={setFrentesCurrentPage} // Atualiza o estado da página
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
      {/* Botão "Voltar" */}
      <div className="mb-4">
        <Button onClick={() => router.back()} color="gray" size="sm">
          <HiArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Conteúdo */}
      <div className="flex justify-center">{renderContent()}</div>
    </main>
  );
};

export default DeputadoDetailPage;
