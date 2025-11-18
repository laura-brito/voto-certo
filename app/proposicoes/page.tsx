import React, { Suspense } from "react";
import ProposicoesClientPage from "./ProposicoesClientPage";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proposições Legislativas",
  description:
    "Pesquise projetos de lei (PL), propostas de emenda (PEC) e outras proposições em tramitação na Câmara.",
};
export default function ProposicoesPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ProposicoesClientPage />
    </Suspense>
  );
}

// Fallback que imita o layout
function PageFallback() {
  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    </main>
  );
}
