"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { ErrorMessage } from "../../components/UI/ErrorMessage";
import {
  Card,
  Button,
  Badge,
  Modal,
  ModalFooter,
  ModalBody,
  ModalHeader,
  Spinner,
  Avatar,
} from "flowbite-react";
import {
  HiArrowLeft,
  HiOutlineCalendar,
  HiOutlineUser,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";
import {
  ProposicaoDetalhes,
  Votacao,
  VotoDeputado,
} from "@/app/types/proposicoes";
import { Autor } from "@/app/types/autores";
import {
  getAutoresProposicao,
  getProposicaoById,
  getVotacoesDaProposicao,
  getVotosDaVotacao,
} from "@/app/api/client";
import { ProposicaoExplainer } from "@/app/components/ProposicaoExplainer";

/**
 * Helper para extrair o ID do Deputado da URI
 */
const getDeputadoIdFromUri = (uri: string): string | null => {
  const match = uri.match(/\/deputados\/(\d+)$/);
  return match ? match[1] : null;
};

const ProposicaoDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Estados principais
  const [proposicao, setProposicao] = useState<ProposicaoDetalhes | null>(null);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Estados de Votação
  const [votacaoPrincipal, setVotacaoPrincipal] = useState<Votacao | null>(
    null,
  );
  const [votos, setVotos] = useState<VotoDeputado[]>([]);

  // Estados de Loading
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoresLoading, setIsAutoresLoading] = useState(true);
  const [isVotosLoading, setIsVotosLoading] = useState(true);

  // Estados do Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedAutor, setSelectedAutor] = useState<Autor | null>(null);

  // Efeito 1: Busca a Proposição Principal
  useEffect(() => {
    if (id) {
      const fetchDetalhes = async () => {
        setIsLoading(true);
        setIsAutoresLoading(true);
        setIsVotosLoading(true); // Liga todos os loaders
        setError(null);
        setProposicao(null);
        setAutores([]);
        setVotos([]);

        try {
          const data = await getProposicaoById(id);
          setProposicao(data); // Dispara os Efeitos 2 e 3
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Falha ao buscar detalhes.";
          setError(msg);
          // Pare os outros loaders se a proposição principal falhar
          setIsAutoresLoading(false);
          setIsVotosLoading(false);
        } finally {
          setIsLoading(false); // Termina o loading principal
        }
      };
      fetchDetalhes();
    }
  }, [id]);

  // Efeito 2: Busca os Autores
  useEffect(() => {
    if (proposicao && proposicao.uriAutores) {
      const fetchAutores = async () => {
        try {
          const autoresData = await getAutoresProposicao(proposicao.uriAutores);
          setAutores(autoresData);
        } catch (err) {
          console.error("Erro ao buscar autores:", err);
        } finally {
          setIsAutoresLoading(false);
        }
      };
      fetchAutores();
    } else if (proposicao) {
      // Se 'proposicao' existe mas não tem 'uriAutores'
      setIsAutoresLoading(false);
    }
  }, [proposicao]); // Depende do objeto 'proposicao'

  useEffect(() => {
    if (id) {
      const fetchVotacoes = async () => {
        try {
          const votacoesData = await getVotacoesDaProposicao(id);

          if (votacoesData && votacoesData.length > 0) {
            // Como ordenamos DESC na API, o índice 0 é a votação mais recente
            const mainVotacao = votacoesData[0];
            setVotacaoPrincipal(mainVotacao);

            // Busca os votos individuais (se houver)
            try {
              const votosData = await getVotosDaVotacao(mainVotacao.id);
              setVotos(votosData);
            } catch (votoErr) {
              console.warn(
                "Votação sem votos individuais (provável simbólica)",
                votoErr,
              );
              setVotos([]); // Garante array vazio se falhar ou não tiver votos
            }
          }
        } catch (err) {
          console.error("Erro ao buscar votações:", err);
        } finally {
          setIsVotosLoading(false);
        }
      };
      fetchVotacoes();
    }
  }, [id]);
  // Função para abrir o modal
  const handleAutorClick = (autor: Autor) => {
    setSelectedAutor(autor);
    setShowModal(true);
  };

  // Funções helper para filtrar e renderizar os votos
  const votosSim = votos.filter((v) => v.tipoVoto === "Sim");
  const votosNao = votos.filter((v) => v.tipoVoto === "Não");

  const renderVotoList = (votos: VotoDeputado[]) => (
    <ul className="list-inside list-disc space-y-1 text-sm">
      {votos.map((voto) => (
        <li key={voto.deputado_.id}>
          <Link
            href={`/deputados/${voto.deputado_.id}`}
            className="text-blue-600 hover:underline dark:text-blue-500"
          >
            {voto.deputado_.nome}
          </Link>{" "}
          <span className="text-gray-500 dark:text-gray-400">
            ({voto.deputado_.siglaPartido}-{voto.deputado_.siglaUf})
          </span>
        </li>
      ))}
    </ul>
  );

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
    const primeiroAutor =
      !isAutoresLoading && autores.length > 0 ? autores[0] : null;
    const autorPrincipalNome = primeiroAutor
      ? primeiroAutor.nome
      : isAutoresLoading
        ? "Carregando..."
        : "Autor desconhecido";

    return (
      <Card className="w-full max-w-3xl">
        {/* Cabeçalho do Card */}
        <div className="flex flex-col pb-4">
          <h5 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            {proposicao.siglaTipo} {proposicao.numero}/{proposicao.ano}
          </h5>
          <div className="flex flex-wrap gap-2">
            <Badge
              icon={HiOutlineUser}
              color="gray"
              onClick={() => primeiroAutor && handleAutorClick(primeiroAutor)}
              className={
                primeiroAutor
                  ? "cursor-pointer transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                  : ""
              }
            >
              {autorPrincipalNome}
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
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              {proposicao.ementa}
            </p>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              {proposicao.ementaDetalhada}
            </p>
            {/* 2. Adicione o ProposicaoExplainer aqui */}
            <ProposicaoExplainer
              ementa={proposicao.ementa}
              proposicaoId={proposicao.id.toString()}
            />
          </div>

          {/* Autoria */}
          <div className="py-4">
            <h6 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Autoria
            </h6>
            {isAutoresLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Carregando autores...
              </p>
            ) : (
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {autores.length > 0 ? (
                  autores.map((autor) => (
                    <li
                      key={autor.uri}
                      className="cursor-pointer text-blue-600 hover:underline dark:text-blue-500"
                      onClick={() => handleAutorClick(autor)}
                    >
                      {autor.nome}
                      {autor.siglaPartido
                        ? ` (${autor.siglaPartido}${
                            autor.siglaUf ? `-${autor.siglaUf}` : ""
                          })`
                        : ` (${autor.tipo})`}
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

          {/* Votação Principal */}
          <div className="py-4">
            <h6 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Última Votação
              {votacaoPrincipal && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  (em{" "}
                  {new Date(votacaoPrincipal.data).toLocaleDateString("pt-BR")})
                </span>
              )}
            </h6>

            {isVotosLoading ? (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Spinner size="sm" />
                <span className="ml-2">Buscando dados da votação...</span>
              </div>
            ) : votacaoPrincipal ? (
              // TEMOS UMA VOTAÇÃO (Seja nominal ou simbólica)
              <div className="space-y-4">
                {/* Exibe o resumo/ementa da votação se disponível */}
                {votacaoPrincipal.ementa && (
                  <p className="text-sm text-gray-600 italic dark:text-gray-400">
                    {votacaoPrincipal.ementa}
                  </p>
                )}

                {votos.length > 0 ? (
                  // CASO 1: Votação Nominal (tem lista de votos)
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h5 className="mb-2 flex items-center font-semibold text-green-600">
                        <HiCheckCircle className="mr-2 h-5 w-5" />A Favor (
                        {votosSim.length})
                      </h5>
                      {votosSim.length > 0 ? (
                        renderVotoList(votosSim)
                      ) : (
                        <p className="text-sm text-gray-500">
                          Nenhum voto Sim.
                        </p>
                      )}
                    </div>
                    <div>
                      <h5 className="mb-2 flex items-center font-semibold text-red-600">
                        <HiXCircle className="mr-2 h-5 w-5" />
                        Contra ({votosNao.length})
                      </h5>
                      {votosNao.length > 0 ? (
                        renderVotoList(votosNao)
                      ) : (
                        <p className="text-sm text-gray-500">
                          Nenhum voto Não.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  // CASO 2: Votação Simbólica (sem lista de votos)
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-gray-800 dark:text-yellow-300">
                    <span className="font-semibold">
                      Votação Simbólica ou Unânime:
                    </span>
                    <p className="mt-1">
                      Nesta modalidade, não há registro individual de votos
                      (Sim/Não). Geralmente ocorre quando há acordo entre as
                      lideranças partidárias.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // CASO 3: Nenhuma votação encontrada
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Esta proposição ainda não passou por votação nominal ou
                registrada no Plenário.
              </p>
            )}
          </div>
        </div>

        {/* Modal de Informações do Autor */}
        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          size="md"
          popup
        >
          <ModalHeader />
          <ModalBody>
            <div className="flex flex-col items-center text-center">
              <Avatar
                img={selectedAutor?.urlFoto}
                alt={`Foto de ${selectedAutor?.nome}`}
                rounded
                size="xl" // Tamanho maior para o modal
                className="mb-4"
                placeholderInitials={selectedAutor?.nome?.charAt(0)}
              />

              <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                {selectedAutor?.nome}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedAutor?.tipo}
              </span>

              {selectedAutor?.siglaPartido && (
                <div className="mt-4 flex items-center space-x-2">
                  <Badge color="info" size="sm">
                    {selectedAutor.siglaPartido}
                    {selectedAutor.siglaUf && ` - ${selectedAutor.siglaUf}`}
                  </Badge>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter className="justify-center border-t-0 pt-0">
            {selectedAutor &&
              selectedAutor.tipo === "Deputado(a)" &&
              getDeputadoIdFromUri(selectedAutor.uri) && (
                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(
                      `/deputados/${getDeputadoIdFromUri(selectedAutor.uri)}`,
                    )
                  }
                >
                  Ver Perfil Completo
                </Button>
              )}
          </ModalFooter>
        </Modal>
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

export default ProposicaoDetailPage;
