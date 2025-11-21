"use client";
import { useState, useEffect } from "react";
import { ListItem } from "../types/ListItem";
import { PaginatedResponse } from "../api/client";

type FetchPaginatedFunction<T, F> = (
  pagina: number,
  filters: F,
) => Promise<PaginatedResponse<T>>;

type TransformFunction<T> = (data: T) => ListItem;

export function usePaginatedApi<T, F>(
  fetchFunction: FetchPaginatedFunction<T, F>,
  transformFunction: TransformFunction<T>,
  filters: F,
  currentPage: number,
) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setItems([]);

      try {
        const response = await fetchFunction(currentPage, filters);
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
  }, [currentPage, JSON.stringify(filters), fetchFunction, transformFunction]);

  return { items, isLoading, error, totalPages };
}
