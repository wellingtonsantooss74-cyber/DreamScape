export interface Character {
  nome: string;
  descricao: string;
}

export interface Page {
  numero: number;
  texto: string;
  prompt_imagem: string;
  imageUrl?: string;
  audio_metadata: {
    efeito_gatilho: string;
    ritmo_sugerido: string;
  };
}

export interface Question {
  tipo: "compreensao" | "empatia" | "conexao";
  pergunta: string;
  resposta_esperada_keywords?: string[];
  feedback_positivo: string;
}

export interface Story {
  id: string;
  uid: string;
  createdAt: string;
  titulo: string;
  idade_alvo: string;
  personagens_principais: Character[];
  paginas: Page[];
  interatividade: {
    perguntas: Question[];
  };
}

export interface BookParams {
  nomeCrianca: string;
  idade: number;
  tema: string;
  companheiro: string;
}
