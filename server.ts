import express from "express";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { User, UserRole, DishAnalysis, CommunityPost, Language } from "./types";
import { readDb, writeDb } from "./db/database";

// Load .env.local for local dev (Node 20.12+ built-in, no extra dependency needed)
// On production (Render etc.), env vars are injected by the platform directly.
try {
  (process as any).loadEnvFile('.env.local');
} catch {
  // file not found or already loaded — safe to ignore
}


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || "vietfood-super-secret-2026";
const UPLOADS_DIR = path.join(__dirname, "uploads");
const PAGE_SIZE = 10;

// --- Rate limiter: max 20 AI calls per 15 min per IP ---
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút." },
});

// --- Zod schema: validates history POST body ---
const DishAnalysisSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  timestamp: z.number().int().positive(),
  imageUrl: z.string().min(1),
  dishName: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  description: z.string().min(1),
  history: z.string(),
  ingredients: z.array(z.string()).min(1),
  nutrition: z.object({
    calories: z.number().nonnegative(),
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fat: z.number().nonnegative(),
  }).optional(),
  language: z.enum(['vi', 'en']),
  isPublic: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  userNote: z.string().max(500).optional(),
});

// --- Multer setup: save images to disk ---
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

// --- DB interfaces ---
interface UserRecord extends User {
  passwordHash: string;
}

// --- Auth middleware ---
function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: UserRole };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// --- Seed default users on first run ---
async function seedDefaultUsers() {
  const users = readDb<UserRecord[]>("users.json");
  if (users.length === 0) {
    const adminHash = await bcrypt.hash("admin", 10);
    const user1Hash = await bcrypt.hash("user1", 10);
    const defaults: UserRecord[] = [
      { id: "admin-id", username: "admin", role: UserRole.ADMIN, passwordHash: adminHash },
      { id: "user1-id", username: "user1", role: UserRole.USER, passwordHash: user1Hash },
    ];
    writeDb("users.json", defaults);
    console.log("[DB] Default users seeded.");
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Serve uploaded images as static files
  app.use("/uploads", express.static(UPLOADS_DIR));

  await seedDefaultUsers();

  // ============================================================
  // AUTH ROUTES
  // ============================================================

  app.post("/api/auth/register", async (req: any, res: any) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });
    const users = readDb<UserRecord[]>("users.json");
    if (users.some((u) => u.username === username)) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: UserRecord = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      role: UserRole.USER,
      passwordHash,
    };
    users.push(newUser);
    writeDb("users.json", users);

    const token = jwt.sign({ id: newUser.id, username: newUser.username, role: newUser.role }, JWT_SECRET, {
      expiresIn: "7d",
    });
    const { passwordHash: _, ...safeUser } = newUser;
    res.json({ ...safeUser, token });
  });

  app.post("/api/auth/login", async (req: any, res: any) => {
    const { username, password } = req.body;
    const users = readDb<UserRecord[]>("users.json");
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });
    const { passwordHash: _, ...safeUser } = user;
    res.json({ ...safeUser, token });
  });

  // ============================================================
  // ADMIN ROUTES (Phase 4)
  // ============================================================

  const adminMiddleware = (req: any, res: any, next: any) => {
    authMiddleware(req, res, () => {
      if (req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: "Access denied: Admins only" });
      }
      next();
    });
  };

  app.get("/api/admin/stats", adminMiddleware, (req: any, res: any) => {
    const users = readDb<UserRecord[]>("users.json");
    const history = readDb<DishAnalysis[]>("history.json");
    const communityPosts = readDb<CommunityPost[]>("community.json");

    res.json({
      totalUsers: users.length,
      totalHistoryItems: history.length,
      totalCommunityPosts: communityPosts.length
    });
  });

  app.delete("/api/admin/community/:id", adminMiddleware, (req: any, res: any) => {
    const { id } = req.params;
    let posts = readDb<CommunityPost[]>("community.json");
    const initialLength = posts.length;
    posts = posts.filter(p => p.id !== id);
    
    if (posts.length < initialLength) {
      writeDb("community.json", posts);
      res.json({ message: "Post deleted by admin" });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  });

  // ============================================================
  // IMAGE UPLOAD ROUTE (Phase 2)
  // ============================================================

  app.post("/api/upload", authMiddleware, upload.single("image"), (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // ============================================================
  // HISTORY ROUTES (with pagination)
  // ============================================================

  app.get("/api/history", authMiddleware, (req: any, res: any) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const q = (req.query.q as string || "").toLowerCase();

    const histories = readDb<DishAnalysis[]>("history.json");
    let userHistory = histories
      .filter((h) => h.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);

    // Server-side search filter
    if (q) {
      userHistory = userHistory.filter((h) => h.dishName.toLowerCase().includes(q));
    }

    const total = userHistory.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const paginated = userHistory.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    res.json({ data: paginated, total, totalPages, page });
  });

  app.post("/api/history", authMiddleware, (req: any, res: any) => {
    // Zod validation: reject malformed or malicious payloads
    const parseResult = DishAnalysisSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid dish data",
        details: parseResult.error.flatten().fieldErrors
      });
    }
    const dish = parseResult.data as DishAnalysis;

    // Security: enforce that userId matches authenticated user
    if (dish.userId !== req.user.id) {
      return res.status(403).json({ error: "userId mismatch" });
    }

    const histories = readDb<DishAnalysis[]>("history.json");
    histories.push(dish);
    writeDb("history.json", histories);
    res.json({ success: true });
  });

  app.delete("/api/history/:id", authMiddleware, (req: any, res: any) => {
    const { id } = req.params;
    const histories = readDb<DishAnalysis[]>("history.json");
    const index = histories.findIndex((h) => h.id === id);
    if (index !== -1) {
      // Delete image file if it's a stored file (not base64)
      const dish = histories[index];
      if (dish.imageUrl && dish.imageUrl.startsWith("/uploads/")) {
        const filePath = path.join(UPLOADS_DIR, path.basename(dish.imageUrl));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      histories.splice(index, 1);
      writeDb("history.json", histories);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  // ============================================================
  // COMMUNITY ROUTES (with pagination)
  // ============================================================

  app.get("/api/community", (req: any, res: any) => {
    const page = parseInt(req.query.page as string) || 1;
    const communityPosts = readDb<CommunityPost[]>("community.json");
    const sorted = communityPosts.sort((a, b) => b.timestamp - a.timestamp);
    const total = sorted.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    res.json({ data: paginated, total, totalPages, page });
  });

  app.post("/api/community/share", authMiddleware, (req: any, res: any) => {
    const { dishId, username } = req.body;
    const userId = req.user.id;

    const histories = readDb<DishAnalysis[]>("history.json");
    const dish = histories.find((h) => h.id === dishId && h.userId === userId);
    if (!dish) return res.status(404).json({ error: "Dish not found" });

    const communityPosts = readDb<CommunityPost[]>("community.json");
    if (communityPosts.some((p) => p.id === dishId)) {
      return res.status(400).json({ error: "Already shared" });
    }

    const post: CommunityPost = { ...dish, username, likes: 0, comments: [], isPublic: true };
    communityPosts.push(post);
    writeDb("community.json", communityPosts);

    // Update history entry to mark as public
    const hIndex = histories.findIndex((h) => h.id === dishId);
    if (hIndex !== -1) {
      histories[hIndex].isPublic = true;
      writeDb("history.json", histories);
    }

    res.json(post);
  });

  // authMiddleware added to prevent spam likes
  app.post("/api/community/like/:id", authMiddleware, (req: any, res: any) => {
    const { id } = req.params;
    const communityPosts = readDb<CommunityPost[]>("community.json");
    const post = communityPosts.find((p) => p.id === id);
    if (post) {
      post.likes += 1;
      writeDb("community.json", communityPosts);
      res.json(post);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  });

  app.post("/api/community/comment/:id", authMiddleware, (req: any, res: any) => {
    const { id } = req.params;
    const { text } = req.body;
    const username = req.user.username;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: "Comment text cannot be empty" });
    }

    const communityPosts = readDb<CommunityPost[]>("community.json");
    const postIndex = communityPosts.findIndex((p) => p.id === id);
    
    if (postIndex !== -1) {
      const newComment = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        text: text.trim(),
        timestamp: Date.now()
      };
      
      if (!communityPosts[postIndex].comments) {
        communityPosts[postIndex].comments = [];
      }
      
      communityPosts[postIndex].comments.push(newComment);
      writeDb("community.json", communityPosts);
      res.json(communityPosts[postIndex]);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  });

  // ============================================================
  // AI ROUTES (Phase 1 — Gemini calls moved to backend)
  // ============================================================

  app.post("/api/analyze", authMiddleware, aiRateLimit, async (req: any, res: any) => {
    const { base64Image, language } = req.body as { base64Image: string; language: Language };

    if (!base64Image) {
      return res.status(400).json({ error: "base64Image is required" });
    }
    if (!language || !Object.values(Language).includes(language)) {
      return res.status(400).json({ error: "Invalid language" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured on server" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `You are a world-class Vietnamese culinary expert. 
  Analyze the image and provide a detailed description of the Vietnamese dish.
  Respond in ${language === Language.VIETNAMESE ? "Vietnamese" : "English"}.
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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
            { text: "Identify this Vietnamese dish and provide details in JSON format as specified." },
          ],
        },
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dishName: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              history: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              nutrition: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER },
                },
                required: ["calories", "protein", "carbs", "fat"],
              },
            },
            required: ["dishName", "category", "description", "history", "ingredients", "nutrition"],
          },
        },
      });

      const text = response.text;
      const result = JSON.parse(text || "{}");
      res.json(result);
    } catch (err: any) {
      console.error("[/api/analyze] Gemini error:", err?.message || err);
      res.status(502).json({ error: "AI analysis failed. Please try again." });
    }
  });

  app.post("/api/nearby", authMiddleware, async (req: any, res: any) => {
    const { dishName, latitude, longitude } = req.body as {
      dishName: string;
      latitude: number;
      longitude: number;
    };

    if (!dishName || latitude == null || longitude == null) {
      return res.status(400).json({ error: "dishName, latitude, and longitude are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured on server" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Where can I eat the best ${dishName} near my current location?`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: { latitude, longitude },
            },
          },
        },
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const links = groundingChunks
        ?.map((chunk: any) => ({
          title: chunk.maps?.title || "View on Google Maps",
          uri: chunk.maps?.uri,
        }))
        .filter((l: any) => l.uri) || [];

      res.json({ text: response.text, links });
    } catch (err: any) {
      console.error("[/api/nearby] Gemini error:", err?.message || err);
      res.status(502).json({ error: "Restaurant search failed. Please try again." });
    }
  });

  // ============================================================
  // VITE MIDDLEWARE
  // ============================================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, () => {
    console.log(`[VietFood] Server running on http://localhost:${PORT}`);
  });
}

startServer();
