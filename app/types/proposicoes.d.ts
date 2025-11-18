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
