import { getDeputadoById } from "@/app/api/client";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const { id } = params;
    const deputado = await getDeputadoById(id);
    const ultimoStatus = deputado?.ultimoStatus;

    if (!ultimoStatus) {
      return { title: "Deputado - Informação Incompleta" };
    }

    return {
      title: `Perfil de ${deputado.nomeCivil} (${ultimoStatus.siglaPartido}/${ultimoStatus.siglaUf}) | Voto Certo`,
      description: `Acompanhe o perfil, histórico profissional e despesas do deputado ${deputado.nomeCivil}.`,
    };
  } catch (error) {
    console.error("Erro ao gerar metadata:", error);
    return { title: "Deputado Não Encontrado" };
  }
}
