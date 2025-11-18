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
  dataApresentacao: string;
  uriAutores: string; // CORREÇÃO: Esta é a string que você nos mostrou
  statusProposicao: {
    dataHora: string;
    descricaoSituacao: string;
    descricaoTramitacao: string;
    despacho: string;
  };
}
