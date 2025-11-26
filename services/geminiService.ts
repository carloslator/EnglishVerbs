import { GoogleGenAI, Type } from "@google/genai";
import { Verb, QuizQuestion, QuestionType } from "../types";

// Initialize the API client
// Note: process.env.API_KEY must be set in the environment
const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Generates a "Fill in the Blank" or "Usage" question for a specific verb.
 * If API key is missing or fails, returns null so the app falls back to static questions.
 */
export const generateContextQuestion = async (verb: Verb, otherVerbs: Verb[]): Promise<QuizQuestion | null> => {
  if (!ai) return null;

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Create a "Fill in the blank" quiz question for the English verb "${verb.english}" (Spanish: ${verb.spanish}).
      The sentence should be simple, suitable for a beginner student.
      The blank should represent where the verb "${verb.english}" (or its conjugation) goes.
      Provide 3 incorrect options (distractors) that are also English verbs.
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentence: { type: Type.STRING, description: "The sentence with a _____ placeholder." },
            correctOption: { type: Type.STRING, description: "The correct form of the verb to fill the blank." },
            distractors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Three incorrect English verb options." 
            },
            explanation: { type: Type.STRING, description: "Brief explanation why the answer is correct." }
          },
          required: ["sentence", "correctOption", "distractors", "explanation"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

    if (!data.sentence || !data.correctOption) return null;

    // Shuffle options
    const options = [...data.distractors, data.correctOption].sort(() => Math.random() - 0.5);

    return {
      type: QuestionType.FILL_BLANK,
      verb: verb,
      questionText: data.sentence,
      options: options,
      correctAnswer: data.correctOption,
      explanation: data.explanation
    };

  } catch (error) {
    console.error("Gemini generation failed:", error);
    return null;
  }
};