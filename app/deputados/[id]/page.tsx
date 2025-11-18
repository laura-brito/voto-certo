"use client";

import React, { useEffect, useState } from "react";
// 1. Importe 'useRouter' para navegação e 'Button'
import { useParams, useRouter } from "next/navigation";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { ErrorMessage } from "../../components/UI/ErrorMessage";
import { Card, Button } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi"; // Ícone para o botão voltar
import Image from "next/image";
import { getDeputadoById } from "@/app/api/client";
import { DeputadoDetalhes } from "@/app/types/deputados";

const DeputadoDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter(); // 2. Instancie o router
  const id = params.id as string;

  const [deputado, setDeputado] = useState<DeputadoDetalhes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    // Se tudo deu certo, mostre os detalhes
    const { ultimoStatus, dataNascimento, escolaridade } = deputado;
    const { gabinete } = ultimoStatus; // Pegue o gabinete

    return (
      // 3. Card maior (max-w-3xl) e w-full para responsividade
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

          {/* 4. Seções de Informações com Divisor */}
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

            {/* Informações do Gabinete (só aparece se existir) */}
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
        </div>
      </Card>
    );
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      {/* 5. Botão "Voltar" no topo */}
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
