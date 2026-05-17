import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Palette, 
  ChevronRight, 
  Sparkles, 
  Info,
  RefreshCw,
  X,
  ArrowRight,
  User,
  Heart,
  Scissors,
  Shirt
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnalysisResult } from './types.ts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일을 업로드해주세요.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      // Remove data:image/xxx;base64, prefix
      const base64Image = image.split(',')[1];
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '분석에 실패했습니다.');
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-8 pt-8 pb-4 flex justify-between items-end border-b border-[#E5E7EB] mb-8">
        <div>
          <h2 className="text-sm font-medium text-text-secondary">Personal Color Analysis</h2>
          <h1 className="text-2xl font-extrabold tracking-tight cursor-pointer" onClick={reset}>
            퍼스널 컬러 진단 리포트
          </h1>
        </div>
        {result && (
          <div className="text-right flex flex-col items-end gap-2">
            <div className={cn(
              "px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider",
              result.tone_direction === 'warm' ? "bg-brand-warm-bg text-brand-warm-text" : "bg-brand-cool-bg text-brand-cool-text"
            )}>
              {result.tone_direction === 'warm' ? 'Warm Tone' : 'Cool Tone'}
            </div>
            <p className="text-[13px] text-text-secondary max-w-[200px] leading-tight">
              {result.summary}
            </p>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-8 pb-12">
        {/* Hero Section / Upload */}
        {!result && !isAnalyzing && (
          <section className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-5xl font-extrabold leading-[1.1] text-text-primary">
                  고유의 아름다움을 <br />
                  <span className="text-accent underline underline-offset-8 decoration-accent/30 tracking-tighter">데이터</span>로 찾다
                </h2>
                <p className="text-lg text-text-secondary leading-relaxed max-w-md">
                  전문 퍼스널컬러 컨설턴트의 로직을 학습한 AI가 당신의 이미지를 분석하여 최적의 팔레트를 제안합니다.
                </p>
              </div>

              <div 
                className={cn(
                  "relative cursor-pointer transition-all duration-300",
                  dragActive ? "scale-[1.02]" : "scale-100"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  accept="image/*"
                />
                <div className={cn(
                  "w-full h-48 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center gap-4 bg-white transition-all",
                  dragActive ? "border-accent bg-accent/5" : "border-[#D1D5DB] hover:border-accent hover:bg-bg-primary"
                )}>
                  <div className="w-12 h-12 rounded-2xl bg-bg-primary flex items-center justify-center text-text-secondary">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-text-primary">사진 업로드 (드래그 & 드롭)</p>
                    <p className="text-xs text-text-secondary mt-1">정면의 고화질 사진을 권장합니다</p>
                  </div>
                </div>
              </div>

              {image && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={analyzeImage}
                  className="w-full py-5 bg-text-primary text-white rounded-[20px] font-bold flex items-center justify-center gap-2 hover:bg-accent transition-all active:scale-[0.98]"
                >
                  리포트 생성하기 <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>

            <div className="relative">
              <div className="aspect-[4/5] bg-[#E5E7EB] rounded-[24px] flex items-center justify-center text-text-secondary text-sm font-medium overflow-hidden border border-[#E5E7EB]">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-12 flex flex-col items-center gap-4 opacity-50">
                     <div className="w-16 h-16 rounded-full border-2 border-dashed border-text-secondary flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                     </div>
                     <p>분석할 이미지를 선택해주세요</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <section className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
            <div className="w-24 h-24 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            <div className="text-center">
               <h2 className="text-xl font-bold mb-2">당신의 고유한 톤을 추출하는 중...</h2>
               <p className="text-sm text-text-secondary italic">인공지능 이미지 분석 엔진이 조명과 대비를 보정하고 있습니다.</p>
            </div>
          </section>
        )}

        {/* Results Page */}
        <AnimatePresence mode="wait">
          {result && !isAnalyzing && (
            <motion.section 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid lg:grid-cols-[320px_1fr] gap-8 items-start"
            >
              {/* Photo & Main Season */}
              <div className="flex flex-col gap-6">
                <div className="aspect-[4/5] rounded-[24px] bg-[#E5E7EB] overflow-hidden border-2 border-white shadow-lg">
                  <img src={image!} alt="Analyzed" className="w-full h-full object-cover" />
                </div>
                
                <div className="sleek-card space-y-6">
                  <div>
                    <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-[12px] font-bold rounded-full mb-3 uppercase tracking-wider">
                      Best Season
                    </span>
                    <h2 className="text-[32px] font-extrabold text-accent leading-none mb-4">{result.sub_type}</h2>
                    <p className="text-sm text-text-primary leading-relaxed font-medium italic">
                      {result.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <AnalysisBlock label="피부 톤" value={result.analysis.skin_tone} />
                    <AnalysisBlock label="명도" value={result.analysis.brightness} />
                    <AnalysisBlock label="채도" value={result.analysis.saturation} />
                    <AnalysisBlock label="대비감" value={result.analysis.contrast} />
                  </div>
                </div>
              </div>

              {/* Recommendations Column */}
              <div className="flex flex-col gap-6">
                {/* Palette Section */}
                <div className="sleek-card flex-1">
                  <SectionHeader title="Best Recommended Colors" accentColor="#D97706" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                    {result.recommended_colors.map((color, idx) => (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="color-chip" style={{ backgroundColor: color.hex }}>
                           <div className="color-chip-info">{color.name}</div>
                        </div>
                        <p className="text-[10px] text-text-secondary leading-tight line-clamp-2">{color.reason}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12">
                    <SectionHeader title="Avoid Colors" accentColor="#EF4444" />
                    <div className="grid grid-cols-5 gap-3 mt-6">
                      {result.avoid_colors.map((color, idx) => (
                        <div key={idx} className="color-chip h-12" style={{ backgroundColor: color.hex }}>
                           <div className="color-chip-info text-[8px]">{color.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sub recommendations */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="sleek-card">
                    <SectionHeader title="Makeup & Beauty" />
                    <div className="mt-6 space-y-6">
                       <div>
                         <p className="text-[12px] mb-3 text-text-secondary font-medium uppercase tracking-tighter">Lip & Blush</p>
                         <div className="flex flex-wrap gap-2">
                            {result.makeup_recommendations.lip.map(l => <Tag key={l}>{l}</Tag>)}
                            {result.makeup_recommendations.blush.map(l => <Tag key={l}>{l}</Tag>)}
                         </div>
                       </div>
                       <div>
                         <p className="text-[12px] mb-3 text-text-secondary font-medium uppercase tracking-tighter">Hair Color</p>
                         <div className="flex flex-wrap gap-2">
                            {result.hair_recommendations.map(l => <Tag key={l}>{l}</Tag>)}
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="sleek-card">
                    <SectionHeader title="Styling & Fashion" />
                    <div className="mt-6 space-y-6">
                       <div>
                         <p className="text-[12px] mb-3 text-text-secondary font-medium uppercase tracking-tighter">Recommended Items</p>
                         <div className="flex flex-wrap gap-2">
                            {result.fashion_recommendations.map(l => <Tag key={l}>{l}</Tag>)}
                         </div>
                       </div>
                       <div className="style-tip-box">
                         <strong>Expert Tip:</strong> {result.style_tip}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {error && (
          <div className="max-w-md mx-auto mt-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-8 mt-12 border-t border-[#E5E7EB] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-secondary italic">
        <div className="max-w-lg">
          ※ {result?.disclaimer || "본 분석은 사진 기반이며 조명 및 필터에 따라 실제와 다를 수 있으므로 참고용으로 활용 바랍니다."}
          {result?.photo_quality_note && <span className="block mt-1 opacity-70">{result.photo_quality_note}</span>}
        </div>
        <div className="font-bold flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
           Image Analysis Expert Report v1.0
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ title, accentColor = "#1F1F1F" }: { title: string; accentColor?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-4 rounded-[2px]" style={{ backgroundColor: accentColor }} />
      <h3 className="text-base font-bold tracking-tight text-text-primary">{title}</h3>
    </div>
  );
}

function AnalysisBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="analysis-item">
      <label className="text-[10px] text-text-secondary font-bold uppercase tracking-tight">{label}</label>
      <span className="text-[13px] font-bold text-text-primary leading-none">{value}</span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1.5 bg-[#F9FAFB] border border-[#F3F4F6] rounded-[6px] text-[12px] text-[#4B5563] font-medium whitespace-nowrap">
      {children}
    </span>
  );
}
