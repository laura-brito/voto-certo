"use client";
import React from "react";
import { ListItem } from "../types/ListItem"; // Ajuste o import se necessário
import { LuSearchCheck } from "react-icons/lu";

// --- Props do Componente ---
interface ListPageLayoutProps {
  items: ListItem[];
  searchPlaceholder: string;
}

// --- Componente Layout ---
export const ListPageLayout: React.FC<ListPageLayoutProps> = ({
  items,
  searchPlaceholder,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
      {/* --- Seção de Busca --- */}
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
          />
        </div>
      </div>

      {/* --- Lista de Itens --- */}
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
            Nenhum item encontrado.
          </div>
        )}
      </div>
    </div>
  );
};
