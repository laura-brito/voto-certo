"use client";
import React, { useEffect, useState } from "react";
import { ListItem } from "../types/ListItem";
import { LuSearchCheck } from "react-icons/lu";
import Link from "next/link";
import { ProposicaoExplainer } from "./ProposicaoExplainer";

interface ListPageLayoutProps {
  items: ListItem[];
  searchPlaceholder: string;
  onSearchSubmit: (searchTerm: string) => void;
  isLoading: boolean;
  error: string | null;
  initialSearchTerm: string;
}

const ItemContent: React.FC<{ item: ListItem }> = ({ item }) => (
  <>
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
      {item.ementa && (
        <div className="mt-4">
          <ProposicaoExplainer ementa={item.ementa} proposicaoId={item.id} />
        </div>
      )}
    </div>
  </>
);

export const ListPageLayout: React.FC<ListPageLayoutProps> = ({
  items,
  searchPlaceholder,
  onSearchSubmit,
  isLoading,
  error,
  initialSearchTerm,
}) => {
  const [inputValue, setInputValue] = useState(initialSearchTerm);
  useEffect(() => {
    setInputValue(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    if (inputValue !== initialSearchTerm) {
      const timer = setTimeout(() => {
        onSearchSubmit(inputValue);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [inputValue, initialSearchTerm, onSearchSubmit]);

  const cardClasses =
    "flex items-start space-x-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700";

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-10 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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

    if (items.length === 0) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          {inputValue.length > 0
            ? "Nenhum resultado encontrado."
            : "Nenhum item encontrado."}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((item) =>
          item.href ? (
            <Link href={item.href} key={item.id} className={cardClasses}>
              <ItemContent item={item} />
            </Link>
          ) : (
            <article key={item.id} className={cardClasses}>
              <ItemContent item={item} />
            </article>
          ),
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
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
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder={searchPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      </div>

      <div>{renderContent()}</div>
    </div>
  );
};
