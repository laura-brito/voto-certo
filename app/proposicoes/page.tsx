// app/proposicoes/page.tsx (Este é um arquivo NOVO)

import React, { Suspense } from "react";
import ProposicoesClientPage from "./ProposicoesClientPage"; // Importe o componente de lógica
import { LoadingSpinner } from "../components/UI/LoadingSpinner";

// Esta é a página "real" que o Next.js renderiza.
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
