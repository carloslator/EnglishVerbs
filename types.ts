export enum Category {
  GENERAL = "General Actions",
  SPEAKING = "Communication",
  EMOTIONS = "Thoughts & Emotions",
  MOVEMENT = "Movement",
  DAILY_LIFE = "Daily Life",
  SHOPPING = "Shopping"
}

export interface Verb {
  id: number;
  english: string;
  spanish: string;
  category: Category;
}

export enum QuestionType {
  TRANSLATE_TO_SPANISH = "TRANSLATE_TO_SPANISH",
  TRANSLATE_TO_ENGLISH = "TRANSLATE_TO_ENGLISH",
  FILL_BLANK = "FILL_BLANK", // AI Powered
  LISTENING = "LISTENING"
}

export interface QuizQuestion {
  type: QuestionType;
  verb: Verb;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string; // Optional AI explanation
}

export interface UserState {
  xp: number;
  level: number;
  hearts: number;
  completedVerbs: number[]; // IDs of verbs mastered
  streak: number;
}