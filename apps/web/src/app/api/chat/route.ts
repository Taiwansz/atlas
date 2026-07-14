import { NextResponse } from 'next/server';
import { getAiConfig } from '../../lib/ai-config';
import {
  fetchWithTimeout,
  getAssistantContent,
  getErrorMessage,
  getProviderError,
  isRecord,
  readJson,
  requireString,
  unwrapJsonCodeBlock,
} from '../../lib/api-utils';

interface IChatMessage {
  role: string;
  content: string;
}

interface IChatRequest {
  prompt: string;
  projectStack: string;
  messages: IChatMessage[];
}

function parseChatRequest(data: unknown): IChatRequest {
  if (!isRecord(data)) {
    throw new Error('Request body must be a JSON object');
  }

  const messagesValue = data.messages;
  if (messagesValue !== undefined && !Array.isArray(messagesValue)) {
    throw new Error('messages must be an array');
  }

  const messages = (messagesValue ?? []).map((message: unknown) => {
    if (!isRecord(message)) {
      throw new Error('Each message must be a JSON object');
    }

    return {
      role: requireString(message, 'role'),
      content: requireString(message, 'content'),
    };
  });

  return {
    prompt: requireString(data, 'prompt'),
    projectStack: requireString(data, 'projectStack'),
    messages,
  };
}

export async function POST(request: Request) {
  try {
    const { prompt, projectStack, messages } = parseChatRequest(await readJson(request));
    const { apiKey, model } = getAiConfig();

    const systemPrompt = `Você é o Maestro, o Agente de Discovery e Arquiteto de Software do Atlas Engineering Operating System.
Sua missão é entrevistar o usuário em português para mapear os requisitos de negócio da ideia dele: "${prompt}".
Stack Técnica Selecionada: "${projectStack}".

REGRAS DE DIÁLOGO E NEGÓCIO:
1. Conduza uma entrevista amigável, clara e progressiva.
2. Faça perguntas estritamente sobre REGRAS DE NEGÓCIO, necessidades dos usuários, personas, problemas, fluxos de uso e objetivos.
3. Proibido fazer perguntas técnicas (evite termos como SQL, REST, Docker, ORM, gRPC, JWT, etc.). Traduza o negócio para a tecnologia internamente.
4. Se você já fez perguntas suficientes (duas perguntas são suficientes para concluir o alinhamento) ou se o usuário responder adequadamente, retorne a palavra-chave "CONVERT_TO_COMPILER_NOW" no campo "reply".
5. Suas perguntas devem ser curtas e diretas ao ponto (máximo de 3 linhas).

Você DEVE retornar APENAS um objeto JSON válido que siga exatamente o seguinte esquema, sem markdown e sem caixas de código (code blocks):
{
  "reply": "Sua pergunta para o usuário ou a palavra-chave CONVERT_TO_COMPILER_NOW",
  "partialProfile": {
    "projectName": "Nome do projeto sugerido (ex: frota-segura)",
    "domainDescription": "Descrição de 1-2 sentenças explicando o domínio de negócio descoberto",
    "personas": ["Persona 1: Exemplo de papel de usuário", "Persona 2: Outro papel de usuário"],
    "suggestedTechs": ["Tecnologia 1", "Tecnologia 2", "Tecnologia 3"],
    "entities": ["Entidade A (ex: Veículo: id, placa, status)", "Entidade B (ex: Motorista: id, CNH)"],
    "modules": [
      { "name": "modulo-1", "purpose": "Módulo de API/Ingress" },
      { "name": "modulo-2", "purpose": "Módulo de Regras de Negócio" }
    ],
    "features": ["Funcionalidade A (ex: Cadastro de veículos)", "Funcionalidade B (ex: Escalonamento de rotas)"],
    "complexity": "Baixa / Média / Alta (Estimativa)",
    "risks": ["Risco 1 (ex: Latência de GPS)", "Risco 2 (ex: Consistência de inventário)"]
  }
}`;

    const response = await fetchWithTimeout(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 1000,
          temperature: 0.15,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
      },
      6000,
    );

    const responseBody = await readJson(response);
    if (!response.ok) {
      throw new Error(getProviderError(responseBody, 'Error from NVIDIA API'));
    }

    const content = unwrapJsonCodeBlock(getAssistantContent(responseBody));
    const parsed = JSON.parse(content) as unknown;
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
