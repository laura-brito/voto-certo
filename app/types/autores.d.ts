export interface Autor {
  uri: string;
  nome: string;
  codTipo: number;
  tipo: string;
  ordemAssinatura: number;
  proponente: number;
  // Campos enriquecidos
  siglaPartido?: string;
  siglaUf?: string;
  urlFoto?: string; // Novo campo
}
interface CamaraApiAutoresResponse {
  dados: Autor[];
}
