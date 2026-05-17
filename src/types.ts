export interface ColorRecommendation {
  name: string;
  hex: string;
  reason: string;
}

export interface AnalysisResult {
  disclaimer: string;
  summary: string;
  tone_direction: 'warm' | 'cool' | 'neutral';
  season_type: string;
  sub_type: string;
  confidence: number;
  analysis: {
    skin_tone: string;
    brightness: string;
    saturation: string;
    contrast: string;
    overall_impression: string;
  };
  recommended_colors: ColorRecommendation[];
  avoid_colors: ColorRecommendation[];
  makeup_recommendations: {
    lip: string[];
    blush: string[];
    eyeshadow: string[];
  };
  hair_recommendations: string[];
  fashion_recommendations: string[];
  style_tip: string;
  photo_quality_note: string;
}
