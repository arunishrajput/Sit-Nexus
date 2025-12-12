
import { GoogleGenAI } from "@google/genai";
import { User, LocationId, ActivityLog, BehaviorAnalysisResult } from '../types';

// NOTE: In a real app, this should be a backend call to protect the key.
// For this frontend-only demo, we assume the environment variable is available.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  async enhanceBio(user: User): Promise<string> {
    if (!apiKey) return "API Key missing.";
    
    try {
      const model = 'gemini-2.5-flash';
      const prompt = `
        You are a friendly and professional social media profile consultant for college students.
        Rewrite the following user bio to be more engaging, fun, yet suitable for a college networking platform.
        Keep it under 30 words.
        
        Name: ${user.name}
        Major: ${user.department}
        Interests: ${user.interests.join(', ')}
        Current Bio: ${user.bio}
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Could not generate bio. Please try again.";
    }
  },

  async suggestMeetupIdeas(locationId: LocationId): Promise<string[]> {
    if (!apiKey) return ["Study Session", "Coffee Break", "Project Brainstorm"];

    try {
      const model = 'gemini-2.5-flash';
      const prompt = `
        Suggest 3 creative and realistic short meetup activity titles for college students at the "${locationId}".
        Return ONLY a JSON array of strings. No markdown formatting.
        Example: ["Quick Lunch", "Chess Match", "Math Homework Help"]
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("Gemini Error:", error);
      return ["General Hangout", "Quick Chat", "Study Group"];
    }
  },

  async analyzeBehavior(user: User, logs: ActivityLog[]): Promise<BehaviorAnalysisResult> {
    if (!apiKey) {
      // Mock data for development if key is missing
      return {
        personalityTitle: "The Offline Enigma",
        summary: "We can't analyze you without an API Key, but you seem mysterious.",
        insights: ["Connect API Key to see real stats", "You are here, that's a start", "Try exploring more"],
        predictions: { nextMood: "Curious", likelyMeetup: "Tech Workshop" },
        radarChart: { social: 50, stability: 50, chaos: 10, exploration: 20, energy: 30 },
        recommendedSpots: ["Main Canteen"]
      };
    }

    try {
      // Summarize logs to avoid token limits if list is huge
      const recentLogs = logs.slice(-100); 
      const logSummary = JSON.stringify(recentLogs.map(l => ({ 
        type: l.type, 
        time: new Date(l.timestamp).getHours(), // Just hour is enough for patterns
        details: l.metadata 
      })));

      const prompt = `
        Analyze the following college student behavior logs and user profile to generate a fun, personality-based analysis.

        User: ${user.name}, ${user.department}, ${user.year}.
        Interests: ${user.interests.join(', ')}.
        Current Mood: ${user.currentMood || 'Unknown'}.
        
        Activity Log JSON:
        ${logSummary}

        Task:
        1. Determine a creative "Personality Title" (e.g., "The Chill Wizard", "Social Meteor").
        2. Write a short, fun summary paragraph about their habits.
        3. Provide 5 actionable/interesting insights (bullets).
        4. Predict their next mood and likely meetup type.
        5. Calculate 0-100 scores for: Social, Stability (Mood), Chaos (Unpredictability), Exploration (Locations), Energy.
        6. Recommend 2 campus spots based on their vibe.

        Output JSON format ONLY:
        {
          "personalityTitle": "string",
          "summary": "string",
          "insights": ["string", "string", "string", "string", "string"],
          "predictions": { "nextMood": "string", "likelyMeetup": "string" },
          "radarChart": { "social": number, "stability": number, "chaos": number, "exploration": number, "energy": number },
          "recommendedSpots": ["string", "string"]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("Behavior Analysis Failed", error);
      throw new Error("Analysis failed");
    }
  }
};
