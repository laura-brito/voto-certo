"use client";
import { useState, useEffect, useRef } from "react"; // 1. Importe useRef
import { ListItem } from "../types/ListItem";
import { PaginatedResponse } from "../api/client";

type FetchPaginatedFunction<T> = (
  pagina: number,
  searchTerm: string,
) => Promise<PaginatedResponse<T>>;

type TransformFunction<T> = (data: T) => ListItem;

export function usePaginatedApi<T>(
  fetchFunction: FetchPaginatedFunction<T>,
  transformFunction: TransformFunction<T>,
  searchTerm: string,
) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const prevSearchTerm = useRef(searchTerm);

  useEffect(() => {
    const hasSearchChanged = prevSearchTerm.current !== searchTerm;

    const pageToFetch = hasSearchChanged ? 1 : currentPage;

    if (hasSearchChanged && currentPage !== 1) {
      setCurrentPage(1);
      // Atualize o ref para a próxima renderização
      prevSearchTerm.current = searchTerm;
      return; // NÃO BUSQUE (evita a race condition)
    }

    // 8. Atualize o ref para a próxima renderização
    prevSearchTerm.current = searchTerm;

    // 9. Lógica principal de busca
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setItems([]);
      try {
        // Use 'pageToFetch' para garantir que
        // uma nova busca sempre use a página 1.
        const response = await fetchFunction(pageToFetch, searchTerm);
        setItems(response.items.map(transformFunction));
        setTotalPages(response.totalPages);
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

    // As dependências continuam as mesmas
  }, [currentPage, searchTerm, fetchFunction, transformFunction]);

  return {
    items,
    isLoading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
  };
}
