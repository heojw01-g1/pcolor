import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit for base64 image uploads
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY as string,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post('/api/analyze', async (req, res) => {
  try {
    const { image } = req.body; // base64 string without data:image/xxx;base64, prefix

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const prompt = `
너는 전문 퍼스널컬러 컨설턴트이자 이미지 분석 전문가야.
사용자가 업로드한 얼굴 사진을 바탕으로 퍼스널컬러를 분석해줘. 
단, 사진의 조명, 화장, 필터, 카메라 색감에 따라 결과가 달라질 수 있으므로 최종 진단이 아니라 참고용 분석으로 안내해줘.

분석할 항목은 다음과 같아.
1. 피부 톤 (밝기, 노란기/붉은기/푸른기, 맑은 느낌인지 차분한 느낌인지)
2. 전체 인상 (얼굴의 명도, 채도, 대비감, 부드러운 이미지인지 선명한 이미지인지)
3. 웜톤 / 쿨톤 판단
4. 4계절 퍼스널컬러 추천 (봄 웜톤, 여름 쿨톤, 가을 웜톤, 겨울 쿨톤 중 하나와 세부 타입)
5. 추천 컬러 (잘 어울리는 색상 8개, 피하면 좋은 색상 5개, 립, 블러셔, 헤어, 의류 컬러)
6. 결과 설명 (친절하고 자연스럽게, 단정적이지 않은 표현 사용)

출력 형식은 반드시 제공된 스키마를 따른 JSON 형식이어야 해.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            disclaimer: { type: Type.STRING },
            summary: { type: Type.STRING },
            tone_direction: { type: Type.STRING, description: "warm | cool | neutral" },
            season_type: { type: Type.STRING, description: "봄 웜톤 | 여름 쿨톤 | 가을 웜톤 | 겨울 쿨톤 | 중립톤" },
            sub_type: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            analysis: {
              type: Type.OBJECT,
              properties: {
                skin_tone: { type: Type.STRING },
                brightness: { type: Type.STRING },
                saturation: { type: Type.STRING },
                contrast: { type: Type.STRING },
                overall_impression: { type: Type.STRING }
              },
              required: ["skin_tone", "brightness", "saturation", "contrast", "overall_impression"]
            },
            recommended_colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["name", "hex", "reason"]
              }
            },
            avoid_colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["name", "hex", "reason"]
              }
            },
            makeup_recommendations: {
              type: Type.OBJECT,
              properties: {
                lip: { type: Type.ARRAY, items: { type: Type.STRING } },
                blush: { type: Type.ARRAY, items: { type: Type.STRING } },
                eyeshadow: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["lip", "blush", "eyeshadow"]
            },
            hair_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            fashion_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            style_tip: { type: Type.STRING },
            photo_quality_note: { type: Type.STRING }
          },
          required: ["disclaimer", "summary", "tone_direction", "season_type", "sub_type", "analysis", "recommended_colors", "avoid_colors", "makeup_recommendations", "hair_recommendations", "fashion_recommendations", "style_tip", "photo_quality_note"]
        }
      }
    });

    const result = JSON.parse(response.text);
    res.json(result);
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Vite Middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
