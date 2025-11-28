import {
  CamaraApiVotacoesResponse,
  CamaraApiVotosResponse,
  ProposicaoDetalhes,
  Proposicoes,
  ReferenciaTema,
  ReferenciaTipoProposicao,
  Votacao,
  VotoDeputado,
} from "../types/proposicoes";
import {
  CamaraApiDespesasResponse,
  Deputado,
  DeputadoDetalhes,
  Despesa,
  Frente,
  Partido,
} from "../types/deputados";
import { Autor, CamaraApiAutoresResponse } from "../types/autores";
export interface ProposicaoFilters {
  keywords?: string;
  codTema?: string;
  siglaTipo?: string;
  numero?: string;
  ano?: string;
}
const BASE_URL = "/api/camara";
interface CamaraApiResponse<T> {
  dados: T[];
  links: { rel: string; href: string }[];
}
export interface DeputadoFilters {
  nome?: string;
  siglaPartido?: string;
}
export interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
}

interface CamaraApiSingularResponse<T> {
  dados: T;
}
export interface ProposicaoFilters {
  keywords?: string;
  codTema?: string;
  siglaTipo?: string;
}
function proxifyUrl(url: string): string {
  if (!url) return "";
  // Substitui o domínio oficial pelo nosso prefixo de proxy
  return url.replace("https://dadosabertos.camara.leg.br/api/v2", BASE_URL);
}
function parseTotalPages(links: { rel: string; href: string }[]): number {
  const lastLink = links.find((link) => link.rel === "last");

  if (!lastLink) {
    return 1;
  }

  try {
    const url = new URL(lastLink.href);
    const totalPages = url.searchParams.get("pagina");
    return totalPages ? parseInt(totalPages, 10) : 1;
  } catch (error) {
    console.error("Falha ao parsear total de páginas do link 'last'", error);
    return 1;
  }
}
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
  filters: ProposicaoFilters,
): Promise<PaginatedResponse<Proposicoes>> {
  const params = new URLSearchParams();

  params.set("pagina", pagina.toString());
  params.set("itens", "10");
  params.set("ordenarPor", "id");
  params.set("ordem", "DESC");

  if (filters.keywords) params.set("keywords", filters.keywords);
  if (filters.codTema) params.set("codTema", filters.codTema);

  if (filters.numero) params.set("numero", filters.numero);
  if (filters.ano) params.set("ano", filters.ano);

  if (filters.siglaTipo) {
    const siglas = filters.siglaTipo.split(",");
    siglas.forEach((s) => {
      if (s.trim()) params.append("siglaTipo", s.trim());
    });
  }

  const endpoint = `/proposicoes?${params.toString()}`;
  return fetchCamaraAPI<Proposicoes>(endpoint);
}

export async function getDeputados(
  pagina: number,
  filters: DeputadoFilters, // Mudou de string para objeto
): Promise<PaginatedResponse<Deputado>> {
  const params = new URLSearchParams();

  params.set("pagina", pagina.toString());
  params.set("itens", "12"); // Exibe 12 por página (fica melhor no grid)
  params.set("ordenarPor", "nome");
  params.set("ordem", "ASC");

  if (filters.nome) params.set("nome", filters.nome);
  if (filters.siglaPartido) params.set("siglaPartido", filters.siglaPartido);

  const endpoint = `/deputados?${params.toString()}`;
  return fetchCamaraAPI<Deputado>(endpoint);
}
export async function getPartidos(): Promise<Partido[]> {
  // Busca até 100 partidos (suficiente para todos os atuais)
  const endpoint = `/partidos?ordem=ASC&ordenarPor=sigla`;

  const response = await fetch(BASE_URL + endpoint, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 }, // Cache de 24h
  });

  if (!response.ok) {
    console.error("Falha ao buscar partidos");
    return [];
  }

  const data = await response.json();
  return data.dados || [];
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
  // A. Usa o proxy para a lista de autores
  const urlProxy = proxifyUrl(uri);

  const response = await fetch(urlProxy, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar autores: ${response.statusText}`);
  }

  const data: CamaraApiAutoresResponse = await response.json();
  const autores = data.dados;

  // B. Busca detalhes individuais, também usando o proxy
  const autoresEnriquecidos = await Promise.all(
    autores.map(async (autor) => {
      if (autor.tipo === "Deputado(a)" && autor.uri) {
        try {
          // IMPORTANTE: Converte a URI do deputado para usar o proxy
          const deputadoUrlProxy = proxifyUrl(autor.uri);

          const depResponse = await fetch(deputadoUrlProxy, {
            headers: { Accept: "application/json" },
            next: { revalidate: 86400 },
          });

          if (depResponse.ok) {
            const depData = await depResponse.json();
            const detalhes: DeputadoDetalhes = depData.dados;

            return {
              ...autor,
              siglaPartido: detalhes.ultimoStatus.siglaPartido,
              siglaUf: detalhes.ultimoStatus.siglaUf,
              urlFoto: detalhes.ultimoStatus.urlFoto,
            };
          }
        } catch (error) {
          console.error(
            `Erro ao buscar detalhes do autor ${autor.nome}`,
            error,
          );
        }
      }
      return autor;
    }),
  );

  return autoresEnriquecidos;
}

export async function getVotacoesDaProposicao(
  proposicaoId: string,
): Promise<Votacao[]> {
  const endpoint = `/proposicoes/${proposicaoId}/votacoes?ordem=DESC&ordenarPor=dataHoraRegistro`;

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
  const endpoint = `/deputados/${id}/despesas?ano=${ano}&mes=${mes}&ordem=DESC&ordenarPor=dataDocumento&itens=100`;

  const response = await fetch(BASE_URL + endpoint, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar despesas: ${response.statusText}`);
  }

  const data: CamaraApiDespesasResponse = await response.json();
  return data.dados;
}

export async function getFrentesDeputado(
  idDeputado: string,
): Promise<Frente[]> {
  const url = `${BASE_URL}/deputados/${idDeputado}/frentes`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    console.error(`Falha ao buscar frentes. URL: ${url}`);
    return [];
  }
  const data = await response.json();
  return data.dados || [];
}
export async function getProposicoesDoDeputado(
  idDeputado: string,
  pagina: number,
): Promise<PaginatedResponse<Proposicoes>> {
  const endpoint = `/proposicoes?idDeputadoAutor=${idDeputado}&ordem=DESC&ordenarPor=id&itens=5&pagina=${pagina}`; // Reduzi itens para 5 para testar melhor a paginação

  return fetchCamaraAPI<Proposicoes>(endpoint);
}

export async function getTemas(): Promise<ReferenciaTema[]> {
  const endpoint = `/referencias/proposicoes/codTema`;

  const response = await fetch(BASE_URL + endpoint, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return [];
  const data = await response.json();
  return data.dados;
}

export async function getTiposProposicao(): Promise<
  ReferenciaTipoProposicao[]
> {
  const endpoint = `/referencias/proposicoes/siglaTipo`;

  const response = await fetch(BASE_URL + endpoint, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return [];
  const data = await response.json();
  return data.dados;
}
