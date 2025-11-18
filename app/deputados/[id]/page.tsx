"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner"; // Verifique o caminho
import { ErrorMessage } from "../../components/UI/ErrorMessage"; // Verifique o caminho
import {
  Card,
  Button,
  Table,
  Spinner,
  TableBody,
  TableHead,
  TableHeadCell,
  TableRow,
  TableCell,
  Label,
  Select,
} from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import Image from "next/image";
import { DeputadoDetalhes } from "@/app/types/deputados";
import { getDeputadoById, getDeputadoDespesas } from "@/app/api/client";

/**
 * Helper para formatar moeda (R$)
 */
const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

/**
 * Tipo para nossos dados agregados
 */
interface AggregatedExpense {
  tipo: string;
  valor: number;
}
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Últimos 5 anos
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
const DeputadoDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [deputado, setDeputado] = useState<DeputadoDetalhes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Novos estados para os filtros
  const [selectedAno, setSelectedAno] = useState(currentYear);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);

  const [aggregatedDespesas, setAggregatedDespesas] = useState<
    AggregatedExpense[]
  >([]);
  const [isDespesasLoading, setIsDespesasLoading] = useState(true);
  const [currentMonthYear, setCurrentMonthYear] = useState("");

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

        // Atualiza o título com base nos estados selecionados
        const dateForTitle = new Date(selectedAno, selectedMes - 1);
        setCurrentMonthYear(
          dateForTitle.toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
          }),
        );

        try {
          // Busca usando os estados selecionados
          const despesasData = await getDeputadoDespesas(
            id,
            selectedAno,
            selectedMes,
          );

          // Lógica de agregação (sem mudanças)
          const aggregated = despesasData.reduce(
            (acc, despesa) => {
              const tipo = despesa.tipoDespesa;
              const valor = despesa.valorLiquido;
              if (!acc[tipo]) {
                acc[tipo] = 0;
              }
              acc[tipo] += valor;
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
          setAggregatedDespesas([]); // Limpa em caso de erro
        } finally {
          setIsDespesasLoading(false);
        }
      };
      fetchDespesas();
    }
  }, [id, selectedAno, selectedMes]); // 5. Adicione os filtros às dependências
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

          {/* Seções de Informações com Divisor */}
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

            {/* NOVA SEÇÃO: Despesas */}
            <div className="py-4">
              <h6 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Resumo de Despesas ({currentMonthYear})
              </h6>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="mes">Mês</Label>
                  </div>
                  <Select
                    id="mes"
                    value={selectedMes}
                    onChange={(e) => setSelectedMes(Number(e.target.value))}
                    disabled={isDespesasLoading} // Desativa durante o load
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
                    disabled={isDespesasLoading} // Desativa durante o load
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
                    <TableHead>
                      <TableHeadCell>Tipo de Despesa</TableHeadCell>
                      <TableHeadCell>Valor Total</TableHeadCell>
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
                          <TableCell>{formatCurrency(despesa.valor)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma despesa registrada para este mês.
                </p>
              )}
            </div>
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
