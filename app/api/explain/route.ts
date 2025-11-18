import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { ementa, proposicaoId } = await request.json();

    if (!ementa || !proposicaoId) {
      return NextResponse.json(
        { error: "ID da proposição e ementa são obrigatórios." },
        { status: 400 },
      );
    }

    const cacheKey = `explanation:${proposicaoId}`;

    const cachedExplanation = await kv.get<string>(cacheKey);

    if (cachedExplanation) {
      return NextResponse.json({ explanation: cachedExplanation });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Você é um assistente especialista em política brasileira.
      Explique a seguinte ementa de proposição legislativa de forma simples, 
      clara e imparcial, como se estivesse explicando para um cidadão leigo.
      Seja direto e foque no objetivo principal.

      Ementa: "${ementa}"

      Explicação:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 6. SALVE A NOVA EXPLICAÇÃO NO CACHE
    // 'ex: 2592000' = expira em 30 dias (em segundos)
    await kv.set(cacheKey, text, { ex: 2592000 });

    // 7. Retorne a nova explicação
    return NextResponse.json({ explanation: text });
  } catch (error) {
    console.error("Erro na API do Gemini:", error);
    return NextResponse.json(
      { error: "Falha ao gerar explicação." },
      { status: 500 },
    );
  }
}
