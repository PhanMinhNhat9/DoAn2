
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface FoodAnalysisResult {
  caption: string;
  recipe: string;
}

export const generateFoodAnalysis = async (
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<FoodAnalysisResult> => {
  // @ts-ignore
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (window as any).GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') || '';
  
  if (!apiKey) {
    throw new Error("Gemini API key is not set. Please check your .env file.");
  }

  // 1. Khởi tạo theo đúng pattern của @google/generative-ai
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const systemInstruction = `
    Bạn là một chuyên gia ẩm thực Việt Nam và đầu bếp chuyên nghiệp. 
    Nhiệm vụ của bạn là phân tích hình ảnh món ăn và thực hiện 2 việc:
    1. Viết một tiêu đề (caption) hấp dẫn cho bài đăng mạng xã hội.
    2. Đưa ra công thức nấu món đó (bao gồm danh sách nguyên liệu và các bước thực hiện chi tiết).
    
    Hãy trả về kết quả theo định dạng JSON như sau:
    {
      "caption": "tiêu đề hấp dẫn ở đây",
      "recipe": "danh sách nguyên liệu và các bước làm chi tiết ở đây"
    }
    Trả về duy nhất JSON, không thêm văn bản khác.
  `;

  try {
    // 2. Sử dụng model được xác nhận có trong danh sách key này
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // 3. Truyền ảnh theo định dạng của GoogleGenerativeAI
    const result = await model.generateContent([
      systemInstruction,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      }
    ]);

    const response = await result.response;
    const text = response.text() || "{}";
    
    // Tách JSON từ chuỗi (đề phòng AI trả về thêm text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        return {
          caption: data.caption || "Món ăn tuyệt vời!",
          recipe: data.recipe || "Đang cập nhật công thức..."
        };
      } catch (e) {
        console.error("JSON Parse Error:", e);
      }
    }
    
    return {
      caption: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      recipe: text
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
