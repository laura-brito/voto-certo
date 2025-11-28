export interface BaseResponse<T> {
  dados: T[];
  links: Link[];
}

export interface Proposicoes {
  id: number;
  uri: string;
  siglaTipo: string;
  codTipo: number;
  numero: number;
  ano: number;
  ementa: string;
  ementaDetalhada: string;
  dataApresentacao: string;
}

export interface Link {
  href: string;
  rel: string;
  type: string;
}

export interface ProposicaoDetalhes {
  id: number;
  uri: string;
  siglaTipo: string;
  numero: number;
  ano: number;
  ementa: string;
  ementaDetalhada: string;
  dataApresentacao: string;
  uriAutores: string;
  statusProposicao: {
    dataHora: string;
    descricaoSituacao: string;
    descricaoTramitacao: string;
    despacho: string;
  };
  keywords?: string;
  urlInteiroTeor?: string;
  uriPropPrincipal?: string;
}
interface CamaraApiVotacoesResponse {
  dados: Votacao[];
}

// A resposta da lista de votos
interface CamaraApiVotosResponse {
  dados: VotoDeputado[];
}

// Tipo para uma Votação (simplificado)
export interface Votacao {
  id: string;
  data: string;
  // A 'ementa' da votação pode ser diferente da proposição
  ementa: string | null;
}

// Tipo para um Voto individual de um deputado
export interface VotoDeputado {
  tipoVoto: "Sim" | "Não" | "Abstenção" | "Obstrução" | string;
  // ATENÇÃO: A API retorna 'deputado_' com underscore!
  deputado_: {
    id: string;
    nome: string;
    siglaPartido: string;
    siglaUf: string;
    urlFoto: string;
  };
}
export interface ReferenciaTema {
  cod: string;
  sigla: string;
  nome: string;
  descricao: string;
}

export interface ReferenciaTipoProposicao {
  id: number;
  sigla: string;
  nome: string;
  descricao: string;
}
