
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GeminiResponse } from "../types";

export const generateFoodCaption = async (
  base64Image: string,
  language: 'vi' | 'en' = 'vi'
): Promise<GeminiResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const systemInstruction = `
    Bạn là một chuyên gia ẩm thực Việt Nam. 
    Nhiệm vụ của bạn là phân tích hình ảnh món ăn và cung cấp thông tin chi tiết.
    Hãy trả về dữ liệu dưới dạng JSON với các trường: foodName (Tên món), category (Phân loại: Cơm, Phở, Bún, Tráng miệng, v.v.), description (Mô tả chi tiết và hấp dẫn), ingredients (Danh sách nguyên liệu chính).
    Ngôn ngữ trả về phải là: ${language === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}.
    Nếu không phải là món ăn, hãy cố gắng nhận diện vật thể nhưng ghi chú là không phải thực phẩm.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1],
          },
        },
        { text: "Phân tích món ăn trong ảnh này." }
      ],
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          ingredients: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["foodName", "category", "description", "ingredients"]
      }
    },
  });

  const text = response.text || "{}";
  return JSON.parse(text) as GeminiResponse;
};
