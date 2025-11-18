export interface Autor {
  nome: string;
  tipo: string;
  uri: string;
}

interface CamaraApiAutoresResponse {
  dados: Autor[];
}
