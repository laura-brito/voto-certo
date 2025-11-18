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
  // ... outros campos
}
