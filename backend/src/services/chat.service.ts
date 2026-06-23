import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../config/supabase";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export class ChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
    });
  }

  async buildContext() {
    try {
      const { data: companies } = await supabase
        .from("companies")
        .select("name, phone, registration_number")
        .eq("is_active", true);

      const { data: routes } = await supabase
        .from("routes")
        .select("*, companies(name)")
        .eq("is_active", true);

      const { data: trips } = await supabase
        .from("trips")
        .select("*, routes(*), companies(name)")
        .gte("departure_time", new Date().toISOString())
        .order("departure_time")
        .limit(50);

      return JSON.stringify({ companies, routes, trips });
    } catch (error) {
      logger.error(`Error building chat context: ${error}`);
      return "{}";
    }
  }

  async getChatResponse(message: string, sessionId: string, companyId?: string) {
    const liveData = await this.buildContext();

    const systemPrompt = `You are ShuttleBot, a helpful booking assistant for ShuttleConnect — Kenya's online shuttle booking platform. You have access to real-time data about all shuttle companies, routes, prices, and upcoming departures. Answer in a friendly, concise way. If asked to book, guide the user to the booking page. Always mention prices in KES. If you don't know, say so.

LIVE DATA: ${liveData}`;

    const chat = this.model.startChat({
      history: [], // For simplicity, we'll start a fresh chat or use sessionId to manage state if needed
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    // In a real RAG system, we'd use sessionId to retrieve previous messages
    // For this prototype, we'll just prepend the system prompt or use it as instructions
    const result = await this.model.generateContent([systemPrompt, message]);
    const response = await result.response;
    return response.text();
  }

  async streamChatResponse(message: string, sessionId: string, onToken: (token: string) => void) {
    const liveData = await this.buildContext();

    const systemPrompt = `You are ShuttleBot, a helpful booking assistant for ShuttleConnect — Kenya's online shuttle booking platform. You have access to real-time data about all shuttle companies, routes, prices, and upcoming departures. Answer in a friendly, concise way. If asked to book, guide the user to the booking page. Always mention prices in KES. If you don't know, say so.

LIVE DATA: ${liveData}`;

    const result = await this.model.generateContentStream([systemPrompt, message]);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      onToken(chunkText);
    }
  }
}

export const chatService = new ChatService();
