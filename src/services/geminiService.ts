import { Flashcard, QuizQuestion, SummaryActivity, ClozeTest, CaseStudy, MindMapActivity, ComparisonActivity, SelfExplanationResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const MODEL_NAME = 'gemini-1.5-flash';
const STRICT_INSTRUCTION =
  'IMPORTANT: Use ONLY the provided text. If information is missing, return the closest valid result and explain the gap.';

type SchemaDefinition = Record<string, unknown>;

interface AIProxyPayload {
  prompt: string;
  responseSchema?: SchemaDefinition;
  responseMimeType?: string;
  config?: Record<string, unknown>;
  model?: string;
  systemInstruction?: string;
}

interface AIProxyResponse {
  text: string;
  raw: unknown;
}

const defaultConfig = {
  temperature: 0.2,
  topK: 32,
  topP: 0.95
};

async function callAI<T>(payload: AIProxyPayload, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: payload.model ?? MODEL_NAME,
        prompt: payload.prompt,
        responseSchema: payload.responseSchema,
        responseMimeType: payload.responseMimeType ?? 'application/json',
        config: payload.config ?? defaultConfig,
        systemInstruction: payload.systemInstruction
      })
    });

    if (!response.ok) {
      throw new Error(`AI proxy returned status ${response.status}`);
    }

    const data = (await response.json()) as AIProxyResponse;
    if (!data.text) {
      return fallback;
    }

    if (payload.responseMimeType === 'application/json' || payload.responseSchema) {
      return JSON.parse(data.text) as T;
    }

    return (data.text as unknown as T) ?? fallback;
  } catch (error) {
    console.error('AI proxy error:', error);
    return fallback;
  }
}

export const generateCourseMetadata = async (
  text: string
): Promise<{ title: string; description: string; category: string; tags: string[] }> => {
  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      category: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } }
    },
    required: ['title', 'description', 'category', 'tags']
  };

  return callAI(
    {
      systemInstruction: `Você é um especialista pedagógico. Analise o texto fornecido e extraia metadados relevantes. ${STRICT_INSTRUCTION}`,
      prompt: `<source_text>\n${text}\n</source_text>\n\nGere o título, descrição, categoria e tags baseados EXCLUSIVAMENTE no texto acima.`,
      responseSchema: schema
    },
    { title: 'Novo Curso', description: 'Conteúdo importado.', category: 'Geral', tags: [] }
  );
};

export const generateActiveFlashcards = async (text: string): Promise<Flashcard[]> => {
  const schema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        front: { type: 'string' },
        back: { type: 'string' },
        mode: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } },
        correctOptionIndex: { type: 'integer' },
        vfStatement: { type: 'string' },
        isTrue: { type: 'boolean' },
        sourceSnippet: { type: 'string' }
      },
      required: ['id', 'front', 'back', 'mode']
    }
  };

  return callAI(
    {
      systemInstruction: `Você é um criador de flashcards experiente. Crie 5 flashcards desafiadores baseados no texto fornecido. ${STRICT_INSTRUCTION}`,
      prompt: `<source_text>\n${text}\n</source_text>\n\nGere 5 flashcards (misturando MCQ, VF e clássicos) usando APENAS o texto acima.`,
      responseSchema: schema
    },
    []
  );
};

export const generateQuiz = async (text: string): Promise<QuizQuestion[]> => {
  const schema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } },
        correctAnswerIndex: { type: 'integer' },
        explanation: { type: 'string' },
        sourceSnippet: { type: 'string' }
      },
      required: ['question', 'options', 'correctAnswerIndex']
    }
  };

  return callAI(
    {
      systemInstruction: `Você é um elaborador de provas. Crie um quiz objetivo com 5 perguntas baseadas no texto. ${STRICT_INSTRUCTION}`,
      prompt: `<source_text>\n${text}\n</source_text>\n\nCrie 5 perguntas de múltipla escolha baseadas EXCLUSIVAMENTE no texto acima.`,
      responseSchema: schema
    },
    []
  );
};

export const generateSummary = async (text: string): Promise<SummaryActivity> => {
  const schema = {
    type: 'object',
    properties: {
      markdownContent: { type: 'string' },
      correctStatements: { type: 'array', items: { type: 'string' } },
      distractors: { type: 'array', items: { type: 'string' } }
    },
    required: ['markdownContent', 'correctStatements', 'distractors']
  };

  return callAI(
    {
      systemInstruction: `Você é um especialista em síntese. Gere um resumo estruturado do texto. ${STRICT_INSTRUCTION}`,
      prompt: `<source_text>\n${text}\n</source_text>\n\nGere um resumo curto em markdown, 3 afirmações verdadeiras e 3 distratores baseados no texto acima.`,
      responseSchema: schema
    },
    { markdownContent: '', correctStatements: [], distractors: [] }
  );
};

export const generateClozeTest = async (text: string): Promise<ClozeTest> => {
  const schema = {
    type: 'object',
    properties: {
      textWithBlanks: { type: 'string' },
      answers: { type: 'array', items: { type: 'string' } }
    },
    required: ['textWithBlanks', 'answers']
  };

  return callAI(
    {
      systemInstruction: `Você é um professor de línguas/conceitos. Crie um exercício de preenchimento de lacunas. ${STRICT_INSTRUCTION}`,
      prompt: `<source_text>\n${text}\n</source_text>\n\nCrie um exercício Cloze (lacunas) usando frases retiradas do texto acima.`,
      responseSchema: schema
    },
    { textWithBlanks: '', answers: [] }
  );
};

export const generateCaseStudy = async (text: string): Promise<CaseStudy> => {
  const schema = {
    type: 'object',
    properties: {
      scenario: { type: 'string' },
      question: { type: 'string' },
      options: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            type: { type: 'string' },
            feedback: { type: 'string' }
          },
          required: ['text', 'type', 'feedback']
        }
      },
      sourceSnippet: { type: 'string' },
      requiresJustification: { type: 'boolean' }
    },
    required: ['scenario', 'question', 'options']
  };

  return callAI(
    {
      systemInstruction: `Você é um consultor de negócios/educação. Crie um estudo de caso prático. ${STRICT_INSTRUCTION}`,
      prompt: `<source_text>\n${text}\n</source_text>\n\nConstrua um estudo de caso com 3 opções (correta, risco e errada) baseado no texto acima.`,
      responseSchema: schema
    },
    {
      scenario: '',
      question: '',
      options: [],
      sourceSnippet: ''
    }
  );
};

export const generateMindMap = async (text: string): Promise<MindMapActivity> => {
  const schema = {
    type: 'object',
    properties: {
      rootLabel: { type: 'string' },
      nodes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            label: { type: 'string' },
            parentId: { type: 'string' }
          },
          required: ['id', 'label']
        }
      }
    },
    required: ['rootLabel', 'nodes']
  };

  return callAI(
    {
      systemInstruction: `Você é um especialista em visualização de dados. Crie um mapa mental hierárquico. ${STRICT_INSTRUCTION}`,
      prompt: `<source_text>\n${text}\n</source_text>\n\nCrie um mapa mental hierárquico com os conceitos principais do texto acima.`,
      responseSchema: schema
    },
    { rootLabel: '', nodes: [] }
  );
};

export const generateComparison = async (text: string): Promise<ComparisonActivity> => {
  const schema = {
    type: 'object',
    properties: {
      columns: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            label: { type: 'string' }
          },
          required: ['id', 'label']
        }
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            text: { type: 'string' },
            correctColumnId: { type: 'string' },
            sourceSnippet: { type: 'string' }
          },
          required: ['id', 'text', 'correctColumnId']
        }
      }
    },
    required: ['columns', 'items']
  };

  return callAI(
    {
      systemInstruction: `Você é um analista. Crie uma tabela comparativa. ${STRICT_INSTRUCTION}`,
      prompt: `<source_text>\n${text}\n</source_text>\n\nMonte uma tabela comparativa categorizando conceitos presentes no texto acima.`,
      responseSchema: schema
    },
    { columns: [], items: [] }
  );
};

export const validateGeneratedContent = async (
  originalText: string,
  generatedItemsJson: string
): Promise<{ validIndices: number[]; reason: string }> => {
  const schema = {
    type: 'object',
    properties: {
      validIndices: { type: 'array', items: { type: 'integer' } },
      reason: { type: 'string' }
    },
    required: ['validIndices', 'reason']
  };

  return callAI(
    {
      systemInstruction: `Você é um auditor pedagógico rigoroso. Verifique a fidelidade do conteúdo gerado.`,
      prompt: `<source_text>\n${originalText}\n</source_text>\n\nItens gerados (JSON):\n${generatedItemsJson}\n\nVerifique quais itens da lista são fiéis ao texto base. Responda com os índices válidos e um resumo.`,
      responseSchema: schema,
      config: { temperature: 0.1 }
    },
    { validIndices: [], reason: 'Validação não executada.' }
  );
};

export const evaluateSelfExplanation = async (
  userAnswer: string,
  sourceReference: string
): Promise<SelfExplanationResult> => {
  const schema = {
    type: 'object',
    properties: {
      score: { type: 'integer' },
      feedback: { type: 'string' },
      missingPoints: { type: 'array', items: { type: 'string' } },
      misconceptions: { type: 'array', items: { type: 'string' } }
    },
    required: ['score', 'feedback']
  };

  return callAI(
    {
      systemInstruction: `Você é um avaliador. Avalie a resposta do aluno.`,
      prompt: `<source_text>\n${sourceReference}\n</source_text>\n\nResposta do usuário:\n${userAnswer}\n\nAvalie a resposta do colaborador com foco em clareza e fidelidade ao texto de referência. Utilize escala de 0 a 100.`,
      responseSchema: schema,
      config: { temperature: 0.15 }
    },
    { score: 0, feedback: 'Não foi possível avaliar.', missingPoints: [], misconceptions: [] }
  );
};

