import React, { Suspense } from "react";
import DeputadosClientPage from "./DeputadosClientPage";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Deputados Federais",
  description:
    "Encontre e pesquise deputados federais em exercício. Veja detalhes, gastos e atividades.",
};
export default function DeputadosPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <DeputadosClientPage />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    </main>
  );
}
