// app/services/camaraAPI.ts

import {
  CamaraApiVotacoesResponse,
  CamaraApiVotosResponse,
  ProposicaoDetalhes,
  Proposicoes,
  Votacao,
  VotoDeputado,
} from "../types/proposicoes";
import {
  CamaraApiDespesasResponse,
  Deputado,
  DeputadoDetalhes,
  Despesa,
} from "../types/deputados";
import { Autor, CamaraApiAutoresResponse } from "../types/autores";

const BASE_URL = "https://dadosabertos.camara.leg.br/api/v2";

// --- Tipos de Resposta ---
interface CamaraApiResponse<T> {
  dados: T[];
  links: { rel: string; href: string }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalPages: number; // Voltamos a ter o totalPages!
}

interface CamaraApiSingularResponse<T> {
  dados: T; // A resposta singular não é um array
}

/**
 * Helper para extrair o número total de páginas
 * do link "last" da API.
 */
function parseTotalPages(links: { rel: string; href: string }[]): number {
  const lastLink = links.find((link) => link.rel === "last");

  // Fallback: Se não houver link "last", assumimos que há apenas 1 página
  if (!lastLink) {
    // Se não há "last", mas há "prev", significa que estamos na página 1 e não há outras.
    // Se não há "last" nem "prev", também é página 1.
    return 1;
  }

  try {
    const url = new URL(lastLink.href);
    const totalPages = url.searchParams.get("pagina");
    // Garante que retornamos um número, com fallback para 1
    return totalPages ? parseInt(totalPages, 10) : 1;
  } catch (error) {
    console.error("Falha ao parsear total de páginas do link 'last'", error);
    return 1; // Retorna 1 em caso de erro
  }
}

/**
 * Função genérica ATUALIZADA para fazer o fetch na API
 * Retorna um objeto PaginatedResponse
 */
async function fetchCamaraAPI<T>(
  endpoint: string,
): Promise<PaginatedResponse<T>> {
  const response = await fetch(BASE_URL + endpoint, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
  }

  const data: CamaraApiResponse<T> = await response.json();

  // Extrai o total de páginas dos links
  const totalPages = parseTotalPages(data.links);

  return {
    items: data.dados,
    totalPages: totalPages,
  };
}
async function fetchCamaraAPISingular<T>(endpoint: string): Promise<T> {
  const response = await fetch(BASE_URL + endpoint, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
  }

  const data: CamaraApiSingularResponse<T> = await response.json();
  return data.dados;
}
export async function getProposicoes(
  pagina: number,
  searchTerm: string, // Novo parâmetro
): Promise<PaginatedResponse<Proposicoes>> {
  const searchParam = searchTerm
    ? `&keywords=${encodeURIComponent(searchTerm)}`
    : "";

  const endpoint = `/proposicoes?pagina=${pagina}&itens=10&ordenarPor=id&ordem=DESC${searchParam}`;
  return fetchCamaraAPI<Proposicoes>(endpoint);
}

/**
 * Busca deputados (PAGINADO E COM BUSCA)
 */
export async function getDeputados(
  pagina: number,
  searchTerm: string, // Novo parâmetro
): Promise<PaginatedResponse<Deputado>> {
  // Adiciona o termo de busca apenas se ele não for vazio
  const searchParam = searchTerm
    ? `&nome=${encodeURIComponent(searchTerm)}`
    : "";

  const endpoint = `/deputados?pagina=${pagina}&itens=10&ordenarPor=nome&ordem=ASC${searchParam}`;

  return fetchCamaraAPI<Deputado>(endpoint);
}
export async function getDeputadoById(id: string): Promise<DeputadoDetalhes> {
  const endpoint = `/deputados/${id}`;
  return fetchCamaraAPISingular<DeputadoDetalhes>(endpoint);
}

export async function getProposicaoById(
  id: string,
): Promise<ProposicaoDetalhes> {
  const endpoint = `/proposicoes/${id}`;
  return fetchCamaraAPISingular<ProposicaoDetalhes>(endpoint);
}
export async function getAutoresProposicao(uri: string): Promise<Autor[]> {
  // Esta 'uri' é uma URL completa, então fazemos o fetch direto
  const response = await fetch(uri, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar autores: ${response.statusText}`);
  }

  const data: CamaraApiAutoresResponse = await response.json();
  return data.dados;
}

export async function getVotacoesDaProposicao(
  proposicaoId: string,
): Promise<Votacao[]> {
  const endpoint = `/proposicoes/${proposicaoId}/votacoes`;

  const response = await fetch(BASE_URL + endpoint, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar votações: ${response.statusText}`);
  }

  const data: CamaraApiVotacoesResponse = await response.json();
  return data.dados;
}

export async function getVotosDaVotacao(
  votacaoId: string,
): Promise<VotoDeputado[]> {
  const endpoint = `/votacoes/${votacaoId}/votos`;

  const response = await fetch(BASE_URL + endpoint, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar votos: ${response.statusText}`);
  }

  const data: CamaraApiVotosResponse = await response.json();
  return data.dados;
}
export async function getDeputadoDespesas(
  id: string,
  ano: number,
  mes: number,
): Promise<Despesa[]> {
  // Pedimos até 100 lançamentos no mês, ordenados por data
  const endpoint = `/deputados/${id}/despesas?ano=${ano}&mes=${mes}&ordem=DESC&ordenarPor=dataDocumento&itens=100`;

  const response = await fetch(BASE_URL + endpoint, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 }, // Cache de 1h
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar despesas: ${response.statusText}`);
  }

  const data: CamaraApiDespesasResponse = await response.json();
  return data.dados;
}
