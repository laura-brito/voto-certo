"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { ErrorMessage } from "../../components/UI/ErrorMessage";
import { Card, Button, Badge } from "flowbite-react";
import { HiArrowLeft, HiOutlineCalendar, HiOutlineUser } from "react-icons/hi";
import { getAutoresProposicao, getProposicaoById } from "@/app/api/client";
import { ProposicaoDetalhes } from "@/app/types/proposicoes";
import { Autor } from "@/app/types/autores";

const ProposicaoDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [proposicao, setProposicao] = useState<ProposicaoDetalhes | null>(null);
  const [autores, setAutores] = useState<Autor[]>([]); // 3. Crie o estado para autores
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoresLoading, setIsAutoresLoading] = useState(true); // 4. Crie um loading separado
  const [error, setError] = useState<string | null>(null);

  // 5. Efeito 1: Busca a Proposição Principal
  useEffect(() => {
    if (id) {
      const fetchDetalhes = async () => {
        setIsLoading(true);
        setIsAutoresLoading(true); // Liga os dois loaders
        setError(null);
        setProposicao(null);
        setAutores([]);

        try {
          const data = await getProposicaoById(id);
          setProposicao(data); // Isso vai disparar o Efeito 2
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Falha ao buscar detalhes.";
          setError(msg);
          setIsAutoresLoading(false); // Pare o outro loader se falhar
        } finally {
          setIsLoading(false); // Termina o loading *principal*
        }
      };

      fetchDetalhes();
    }
  }, [id]);

  // 6. Efeito 2: Busca os Autores (disparado quando 'proposicao' é setado)
  useEffect(() => {
    if (proposicao && proposicao.uriAutores) {
      const fetchAutores = async () => {
        try {
          const autoresData = await getAutoresProposicao(proposicao.uriAutores);
          setAutores(autoresData);
        } catch (err) {
          console.error("Erro ao buscar autores:", err);
          // Opcional: setar um erro específico para autores
        } finally {
          setIsAutoresLoading(false); // Termina o loading *dos autores*
        }
      };

      fetchAutores();
    }
  }, [proposicao]); // Depende do objeto 'proposicao'

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return <ErrorMessage error={error} />;
    }

    if (!proposicao) {
      return <ErrorMessage error="Proposição não encontrada." />;
    }

    const { statusProposicao } = proposicao;

    // 7. Renderiza o nome do autor (com estado de loading)
    const autorPrincipal =
      isAutoresLoading && autores.length === 0
        ? "Carregando..."
        : autores[0]?.nome || "Autor desconhecido";

    return (
      <Card className="w-full max-w-3xl">
        {/* Cabeçalho do Card */}
        <div className="flex flex-col pb-4">
          <h5 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            {proposicao.siglaTipo} {proposicao.numero}/{proposicao.ano}
          </h5>
          <div className="flex flex-wrap gap-2">
            <Badge icon={HiOutlineUser} color="gray">
              {autorPrincipal}
            </Badge>
            <Badge icon={HiOutlineCalendar} color="gray">
              Apresentada em:{" "}
              {new Date(proposicao.dataApresentacao).toLocaleDateString(
                "pt-BR",
              )}
            </Badge>
          </div>
        </div>

        {/* Corpo do Card com Seções */}
        <div className="w-full divide-y divide-gray-200 text-left dark:divide-gray-700">
          {/* Ementa */}
          <div className="py-4">
            <h6 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Ementa
            </h6>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {proposicao.ementa}
            </p>
          </div>

          {/* 8. Seção de Autoria */}
          <div className="py-4">
            <h6 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Autoria
            </h6>
            {isAutoresLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Carregando autores...
              </p>
            ) : (
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                {autores.length > 0 ? (
                  autores.map((autor) => (
                    <li key={autor.uri}>
                      {autor.nome} ({autor.tipo})
                    </li>
                  ))
                ) : (
                  <li>Nenhum autor listado.</li>
                )}
              </ul>
            )}
          </div>

          {/* Situação Atual */}
          {statusProposicao && (
            <div className="py-4">
              <h6 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Situação
              </h6>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>
                  <strong>Tramitação:</strong>{" "}
                  {statusProposicao.descricaoTramitacao}
                </li>
                <li>
                  <strong>Situação:</strong>{" "}
                  {statusProposicao.descricaoSituacao}
                </li>
                <li>
                  <strong>Último Despacho:</strong> {statusProposicao.despacho}
                </li>
                <li>
                  <strong>Data:</strong>{" "}
                  {new Date(statusProposicao.dataHora).toLocaleString("pt-BR")}
                </li>
              </ul>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      {/* Botão "Voltar" no topo */}
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

export default ProposicaoDetailPage;
