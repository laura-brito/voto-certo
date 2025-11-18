import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { ementa } = await request.json();

    if (!ementa) {
      return NextResponse.json(
        { error: "O texto da ementa é obrigatório." },
        { status: 400 },
      );
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

    return NextResponse.json({ explanation: text });
  } catch (error) {
    console.error("Erro na API do Gemini:", error);
    return NextResponse.json(
      { error: "Falha ao gerar explicação." },
      { status: 500 },
    );
  }
}
