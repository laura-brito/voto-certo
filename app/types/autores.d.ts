export interface Autor {
  nome: string;
  tipo: string;
  uri: string;
  siglaPartido?: string;
  siglaUf?: string;
}

interface CamaraApiAutoresResponse {
  dados: Autor[];
}
