// Tipos básicos (você pode movê-los para app/types/...)
interface BaseResponse<T> {
  dados: T[];
  links: { rel: string; href: string }[];
}

// Assumindo que você já tem esses tipos
import { Proposicoes } from "../types/proposicoes";
import { Deputado } from "../types/deputados";

const BASE_URL = "https://dadosabertos.camara.leg.br/api/v2";

/**
 * Função genérica para fazer o fetch na API
 */
async function fetchCamaraAPI<T>(endpoint: string): Promise<T[]> {
  const response = await fetch(BASE_URL + endpoint, {
    headers: {
      Accept: "application/json",
    },
    // Sugestão: Adicionar cache para melhorar a performance
    next: { revalidate: 3600 }, // Cache de 1 hora
  });

  if (!response.ok) {
    throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
  }

  const data: BaseResponse<T> = await response.json();
  return data.dados;
}

/**
 * Busca as 10 últimas proposições
 */
export async function getProposicoes(): Promise<Proposicoes[]> {
  const endpoint = "/proposicoes?itens=10&ordem=DESC&ordenarPor=ano";
  return fetchCamaraAPI<Proposicoes>(endpoint);
}

/**
 * Busca 10 deputados ordenados por nome
 */
export async function getDeputados(): Promise<Deputado[]> {
  const endpoint = "/deputados?itens=10&ordem=ASC&ordenarPor=nome";
  return fetchCamaraAPI<Deputado>(endpoint);
}
