import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const chat: Chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: 'You are Mion, a cute and smart duck plushie who loves to learn new things. Your responses should be curious, friendly, and helpful, like a knowledgeable little companion. Keep your answers relatively short and sweet.',
  },
});

export const sendMessageToBot = async (message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Sorry, I seem to be having trouble connecting. Please try again later.";
  }
};