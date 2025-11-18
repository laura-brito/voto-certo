"use client";
import React, { useEffect, useState } from "react";
import { ListItem } from "../types/ListItem";
import { LuSearchCheck } from "react-icons/lu";

interface ListPageLayoutProps {
  items: ListItem[];
  searchPlaceholder: string;
  onSearchSubmit: (searchTerm: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const ListPageLayout: React.FC<ListPageLayoutProps> = ({
  items,
  searchPlaceholder,
  onSearchSubmit,
  isLoading,
  error,
}) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchSubmit(inputValue);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue, onSearchSubmit]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-10">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
          <span className="ml-4 text-lg font-medium">Carregando...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-red-400 bg-red-100 p-10 text-red-700 shadow-lg dark:border-red-700 dark:bg-gray-800 dark:text-red-300">
          <h3 className="mb-2 text-lg font-semibold">Ocorreu um Erro</h3>
          <p>{error}</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.length > 0 ? (
          items.map((item) => (
            <article
              key={item.id}
              className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                  {item.author}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {item.description}
                </p>
              </div>
            </article>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {inputValue.length > 0
              ? "Nenhum resultado encontrado."
              : "Nenhum item encontrado."}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b p-4 dark:border-gray-700">
        <label htmlFor="search" className="sr-only">
          Pesquisar
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <LuSearchCheck className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            id="search"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder={searchPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      </div>

      {renderContent()}
    </div>
  );
};
