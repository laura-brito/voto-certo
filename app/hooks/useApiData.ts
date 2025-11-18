"use client";
import { useState, useEffect } from "react";
import { ListItem } from "../types/ListItem";

/**
 * Hook customizado para buscar e transformar dados da API da Câmara.
 * @param fetchFunction A função de serviço que busca os dados (ex: getProposicoes).
 * @param transformFunction A função que converte o dado bruto em ListItem.
 */
export function useApiData<T>(
  fetchFunction: () => Promise<T[]>,
  transformFunction: (data: T) => ListItem,
) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setItems([]);

      try {
        const apiData = await fetchFunction();
        const transformedItems = apiData.map(transformFunction);
        setItems(transformedItems);
      } catch (err) {
        let errorMessage = "Falha ao carregar dados.";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // Apenas executa na montagem do componente.
    // fetchFunction e transformFunction devem ser estáveis.
  }, [fetchFunction, transformFunction]);

  return { items, isLoading, error };
}
