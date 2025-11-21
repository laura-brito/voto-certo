export interface Deputado {
  id: number;
  uri: string;
  nome: string;
  siglaPartido: string;
  uriPartido: string;
  siglaUf: string;
  idLegislatura: number;
  urlFoto: string;
  email: string;
}
export interface DeputadoDetalhes {
  id: number;
  uri: string;
  nomeCivil: string;
  ultimoStatus: {
    nome: string;
    siglaPartido: string;
    siglaUf: string;
    email: string;
    urlFoto: string;
    data: string;
    condicaoEleitoral: string;
    // ADICIONE O GABINETE AQUI
    gabinete?: {
      nome: string;
      predio: string;
      andar: string;
      sala: string;
      telefone: string;
    };
  };
  cpf: string;
  dataNascimento: string;
  escolaridade: string;
  siglaPartido: string;
  siglaUf: string;
}
export interface Despesa {
  ano: number;
  mes: number;
  tipoDespesa: string;
  codDocumento: number;
  dataDocumento: string;
  valorDocumento: number;
  valorLiquido: number;
  nomeFornecedor: string;
  cnpjCpfFornecedor: string;
}

interface CamaraApiDespesasResponse {
  dados: Despesa[];
}

export interface Frente {
  id: number;
  titulo: string;
  idLegislatura: number;
  uri: string;
}
export interface Partido {
  id: number;
  sigla: string;
  nome: string;
  uri: string;
}
