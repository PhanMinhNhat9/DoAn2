import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";

export const analyzeDish = async (
  base64Image: string,
  language: Language
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPrompt = `You are a world-class Vietnamese culinary expert. 
  Analyze the image and provide a detailed description of the Vietnamese dish.
  Respond in ${language === Language.VIETNAMESE ? 'Vietnamese' : 'English'}.
  Format your response as valid JSON with the following structure:
  {
    "dishName": "string",
    "category": "string (one of: Bún/Phở, Cơm, Bánh, Ăn vặt, Lẩu, Hải sản, Khác)",
    "description": "short appetizing description",
    "history": "brief historical context or origin",
    "ingredients": ["list", "of", "key", "ingredients"],
    "nutrition": {
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  }`;

  // Always use { parts: [...] } for contents with multimodal data as per guidelines
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Identify this Vietnamese dish and provide details in JSON format as specified." }
      ]
    },
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      // Define responseSchema as recommended for JSON responses to ensure type safety
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dishName: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          history: { type: Type.STRING },
          ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          nutrition: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER }
            },
            required: ["calories", "protein", "carbs", "fat"]
          }
        },
        required: ["dishName", "category", "description", "history", "ingredients", "nutrition"]
      }
    }
  });

  try {
    // response.text is a property, not a method. Access it directly.
    const text = response.text;
    return JSON.parse(text || '{}');
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Invalid response from AI");
  }
};

export const findNearbyRestaurants = async (dishName: string, location: { latitude: number, longitude: number }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Where can I eat the best ${dishName} near my current location?`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      }
    }
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  // MUST ALWAYS extract the URLs from groundingChunks and list them on the web app as links
  const links = groundingChunks?.map((chunk: any) => ({
    title: chunk.maps?.title || "View on Google Maps",
    uri: chunk.maps?.uri
  })).filter((l: any) => l.uri) || [];

  return {
    text: response.text,
    links
  };
};