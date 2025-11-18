import React from "react";
import { Card, Button, ButtonGroup } from "flowbite-react";
import Link from "next/link";
import { LuGithub, LuLinkedin, LuMessagesSquare } from "react-icons/lu";
// Importando ícones para os links de contato

// Esta página pode ser um Server Component, pois não precisa de estado (useState)
export default function SobrePage() {
  const GITHUB_USERNAME = "laura-brito";
  const LINKEDIN_USERNAME = "laura-brito-lisboa-b12889149";
  const EMAIL_ADDRESS = "laurabritolisboa@gmail.com";

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      {/* Centraliza o card na página */}
      <div className="flex justify-center">
        <Card className="w-full max-w-3xl">
          <h5 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Sobre o Projeto Voto Certo
          </h5>

          <div className="w-full divide-y divide-gray-200 text-left dark:divide-gray-700">
            {/* Seção 1: Missão */}
            <div className="py-4">
              <h6 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Nossa Missão
              </h6>
              <p className="text-gray-700 dark:text-gray-300">
                O projeto{" "}
                <b>
                  <i>Voto Certo</i>
                </b>{" "}
                nasceu com o objetivo de facilitar o acesso à informação e
                promover a transparência na política brasileira. Acreditamos que
                um eleitor bem-informado é a base de uma democracia forte.
              </p>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                Nossa plataforma busca tornar o acompanhamento da atividade
                legislativa, como proposições, votações e despesas
                parlamentares, uma tarefa mais simples, direta e acessível para
                qualquer cidadão.
              </p>
            </div>

            {/* Seção 2: Fonte dos Dados */}
            <div className="py-4">
              <h6 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Fonte dos Dados (API)
              </h6>
              <p className="text-gray-700 dark:text-gray-300">
                Todas as informações apresentadas neste site são consumidas em
                tempo real diretamente do portal{" "}
                <Link
                  href="https://dadosabertos.camara.leg.br/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-500"
                >
                  Dados Abertos da Câmara dos Deputados
                </Link>
                .
              </p>
              <blockquote className="mt-3 border-l-4 border-gray-300 bg-gray-50 p-3 italic dark:border-gray-600 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Aviso:</strong> Este é um projeto independente e não
                  possui qualquer vínculo oficial com a Câmara dos Deputados ou
                  qualquer órgão governamental.
                </p>
              </blockquote>
            </div>

            {/* Seção 3: Sobre a Desenvolvedora */}
            <div className="py-4">
              <h6 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Sobre a Desenvolvedora
              </h6>
              <p className="text-gray-700 dark:text-gray-300">
                Este projeto foi idealizado e desenvolvido por{" "}
                <strong>Laura Brito Lisboa</strong>, Desenvolvedora Fullstack.
              </p>

              {/* Seção de Contato */}
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                  Entre em contato ou veja outros projetos:
                </p>
                <ButtonGroup>
                  <Button
                    as={Link}
                    href={`https://github.com/${GITHUB_USERNAME}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="gray"
                  >
                    <LuGithub className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button
                    as={Link}
                    href={`https://linkedin.com/in/${LINKEDIN_USERNAME}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="gray"
                  >
                    <LuLinkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button
                    as={Link}
                    href={`mailto:${EMAIL_ADDRESS}`}
                    color="gray"
                  >
                    <LuMessagesSquare className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
