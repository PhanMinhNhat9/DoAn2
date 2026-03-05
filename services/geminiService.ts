
import { GoogleGenAI } from "@google/genai";

export const generateFoodCaption = async (
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const systemInstruction = `
    Bạn là một chuyên gia ẩm thực Việt Nam. 
    Nhiệm vụ của bạn là phân tích hình ảnh món ăn và viết một tiêu đề (caption) hấp dẫn, mô tả ngắn gọn về món ăn, hương vị và cảm xúc khi thưởng thức.
    Hãy trả về duy nhất chuỗi văn bản tiêu đề bằng Tiếng Việt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
            { text: systemInstruction + "\n\nHãy viết một bài đăng hấp dẫn cho món ăn này." }
          ],
        }
      ]
    });

    return response.text || "Không thể tạo caption.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
