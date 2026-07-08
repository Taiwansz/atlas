import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, projectStack, messages } = await request.json();

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA API Key not configured on server' }, { status: 500 });
    }

    const SYSTEM_PROMPT = `Você é o Maestro, o Arquiteto IA do Atlas Engineering Operating System.
Sua missão é entrevistar o desenvolvedor para alinhar os requisitos técnicos antes de compilar o Blueprint de governança.
Você recebeu a ideia do software: "${prompt}" e a stack desejada: "${projectStack}".

REGRAS DE CONDUTA:
1. Seja tático, breve e direto ao ponto. Use tom brutalista e profissional. Não use saudações amigáveis nem emojis.
2. Formule perguntas cirúrgicas sobre dependências físicas, isolamento de dados ou limites lógicos do projeto.
3. Se você já fez perguntas suficientes (duas perguntas são suficientes para concluir o alinhamento) ou se o desenvolvedor responder adequadamente às suas questões, responda EXATAMENTE com a palavra-chave: "CONVERT_TO_COMPILER_NOW" para sinalizar que o alinhamento foi concluído.
4. Suas respostas devem ser curtas (máximo de 3 linhas de texto).`;

    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(messages || [])
    ];

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-v4-flash',
        max_tokens: 150,
        temperature: 0.2,
        messages: chatMessages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || errorData.message || 'Error from NVIDIA API');
    }

    const data = await response.json();
    const reply = (data.choices?.[0]?.message?.content || '').trim()
      .replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
