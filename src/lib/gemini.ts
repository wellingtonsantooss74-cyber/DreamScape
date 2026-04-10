import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Story, BookParams } from "../types";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined") {
      throw new Error("GEMINI_API_KEY is not defined. Please check your environment variables.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

const STORY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    titulo: { type: Type.STRING },
    idade_alvo: { type: Type.STRING },
    personagens_principais: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          nome: { type: Type.STRING },
          descricao: { type: Type.STRING }
        },
        required: ["nome", "descricao"]
      }
    },
    paginas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          numero: { type: Type.INTEGER },
          texto: { type: Type.STRING },
          prompt_imagem: { type: Type.STRING },
          audio_metadata: {
            type: Type.OBJECT,
            properties: {
              efeito_gatilho: { type: Type.STRING },
              ritmo_sugerido: { type: Type.STRING }
            },
            required: ["efeito_gatilho", "ritmo_sugerido"]
          }
        },
        required: ["numero", "texto", "prompt_imagem", "audio_metadata"]
      }
    },
    interatividade: {
      type: Type.OBJECT,
      properties: {
        perguntas: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tipo: { type: Type.STRING },
              pergunta: { type: Type.STRING },
              resposta_esperada_keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              feedback_positivo: { type: Type.STRING }
            },
            required: ["tipo", "pergunta", "feedback_positivo"]
          }
        }
      },
      required: ["perguntas"]
    }
  },
  required: ["titulo", "idade_alvo", "personagens_principais", "paginas", "interatividade"]
};

export async function generateSpeech(text: string): Promise<string> {
  const ai: any = getAI();
  const model = ai.getGenerativeModel({
    model: "gemini-2.5-flash-preview-tts",
  });
  const response = await model.generateContent({
    contents: [{ parts: [{ text: `Leia com uma voz doce e calma de contador de histórias infantil: ${text}` }] }],
    generationConfig: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Falha ao gerar áudio");
  }

  return base64Audio;
}

export async function playAudio(base64Data: string) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const pcm16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768;
  }

  const buffer = audioContext.createBuffer(1, float32.length, 24000);
  buffer.getChannelData(0).set(float32);

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
  return source;
}

export async function generateStory(params: BookParams): Promise<Story> {
  const ai: any = getAI();
  const model = ai.getGenerativeModel({
    model: "gemini-3-flash-preview",
  });
  const prompt = `
    Você é o motor de inteligência artificial por trás do aplicativo "DreamScape", um gerador de livros infantis ilustrados e personalizados. 
    Sua tarefa é criar uma história curta, envolvente e pedagogicamente adequada para crianças.

    Parâmetros do usuário:
    - Nome da criança: ${params.nomeCrianca}
    - Idade: ${params.idade} anos
    - Tema da aventura: ${params.tema}
    - Companheiro de aventura: ${params.companheiro}

    Regras da História:
    1. Estrutura: Exatamente 6 páginas.
    2. Conteúdo por Página: 2 a 4 frases curtas e mágicas.
    3. Consistência Visual: Mantenha a descrição dos personagens e cenários idêntica em todos os prompts de imagem. Use descrições visuais simples e diretas.
    4. Estilo Artístico: "ilustração de livro infantil fofa e colorida, estilo aquarela digital suave, fundo limpo".
    5. Direção de Som: Para cada página, defina um "efeito_gatilho" (som curto inicial).

    Regras de Interatividade:
    1. Gere 3 perguntas de "Pós-Leitura" ao final.
    2. Pergunta 1: COMPREENSÃO (sobre fatos da história).
    3. Pergunta 2: EMPATIA (como o personagem se sentiu).
    4. Pergunta 3: CONEXÃO (trazer o tema para a vida real da criança).

    Retorne o JSON seguindo o esquema fornecido.
  `;

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: STORY_SCHEMA as any
    }
  });

  if (!response.text) {
    throw new Error("Falha ao gerar a história");
  }

  return JSON.parse(response.text) as Story;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generatePageImage(prompt: string, retryCount = 0): Promise<string> {
  const ai: any = getAI();
  const model = ai.getGenerativeModel({
    model: 'gemini-2.5-flash-image',
  });
  const MAX_RETRIES = 2;
  const fallbackUrl = (p: string) => {
    const encodedPrompt = encodeURIComponent(p);
    // Using a more reliable seed and model parameter for the fallback
    return `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&model=flux&nologo=true`;
  };

  try {
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        imageConfig: { aspectRatio: "1:1" } as any,
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    
    throw new Error("Nenhuma imagem gerada na resposta");
  } catch (error: any) {
    const isQuotaError = error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED");
    
    // Smart Retry Logic: If it's a quota error and we haven't reached max retries, wait and try again
    if (isQuotaError && retryCount < MAX_RETRIES) {
      const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s
      console.warn(`Quota excedida. Tentando novamente em ${waitTime/1000}s... (Tentativa ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(waitTime);
      return generatePageImage(prompt, retryCount + 1);
    }

    if (isQuotaError) {
      console.warn("Quota do Gemini Image excedida após tentativas, usando fallback mágico de alta velocidade...");
    } else {
      console.error("Erro ao gerar imagem com Gemini:", error);
    }
    
    return fallbackUrl(prompt);
  }
}
