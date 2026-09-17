"use client";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Mic, Square, Upload, Sparkles, Volume2, BookOpen, PenTool, Wind, ArrowRight } from "lucide-react";

interface EvaluationResult {
  pronunciation: { score: number; feedback: string };
  vocabulary: { score: number; feedback: string };
  grammar: { score: number; feedback: string };
  fluency: { score: number; feedback: string };
  overall: number;
  summary: string;
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Không thể truy cập Micro! Hãy đảm bảo bạn đã cấp quyền.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
    }
  };

  const submitAudio = async () => {
    if (!audioBlob) return;
    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        toast.error("Lỗi: " + data.error);
      } else {
        let parsedResult = data.result;
        try {
          const cleanJson = data.result.replace(/```json/g, "").replace(/```/g, "").trim();
          parsedResult = JSON.parse(cleanJson);
        } catch (e) {
          console.warn("Could not parse JSON, falling back to string", e);
        }
        setResult(parsedResult);
      }
    } catch (error) {
      console.error("Lỗi khi gửi API:", error);
      toast.error("Có lỗi xảy ra khi chấm bài. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full px-4 py-16 md:px-8 md:py-24 flex flex-col items-center bg-background overflow-hidden relative">
      
      {/* Decorative Accents - simplified for cleaner look */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-secondary/10 rounded-bl-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 rounded-tr-[100px] pointer-events-none" />

      {/* Eyebrow Pill - Follows anti-slop rules (only one eyebrow) */}
      <div className="animate-reveal inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold tracking-wide uppercase bg-surface text-primary border border-border shadow-sm mb-8">
        AI Evaluation Engine
      </div>

      {/* Hero Typography */}
      <h1 className="animate-reveal delay-100 text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-center text-text-primary tracking-tight max-w-3xl leading-[1.1] mb-6">
        Master Spoken English with <span className="text-primary">Clarity</span>
      </h1>
      
      <p className="animate-reveal delay-200 text-lg md:text-xl text-text-secondary text-center max-w-2xl leading-relaxed mb-12">
        Record your voice or upload audio to receive instant, contextual feedback on pronunciation, vocabulary, and fluency.
      </p>

      {/* Main Interaction Card (Level 2 Claymorphism) */}
      <div className="animate-reveal delay-300 w-full max-w-2xl bg-surface p-6 md:p-10 rounded-[24px] shadow-clay-2 border border-border flex flex-col items-center gap-8 relative z-10">
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          {!isRecording ? (
            <>
              <button 
                onClick={startRecording} 
                className="group flex-1 flex items-center justify-center gap-3 px-6 py-4 min-h-[56px] bg-primary text-white rounded-full font-bold text-lg transition-all duration-200 ease-out active:scale-[0.98] shadow-clay-3 hover:bg-primary-hover"
              >
                <Mic size={22} strokeWidth={2.5} />
                <span>Record Audio</span>
                <ArrowRight size={18} strokeWidth={3} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <label className="group flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 min-h-[56px] bg-surface text-text-primary rounded-full font-bold text-lg transition-all duration-200 ease-out active:scale-[0.98] shadow-clay-1 hover:shadow-clay-2 border border-border cursor-pointer">
                <Upload size={22} strokeWidth={2.5} className="text-text-secondary" />
                <span>Upload File</span>
                <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </>
          ) : (
            <button 
              onClick={stopRecording} 
              className="flex-1 flex items-center justify-center gap-3 px-6 py-4 min-h-[56px] bg-error text-white rounded-full font-bold text-lg transition-all duration-200 ease-out active:scale-[0.98] shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:bg-red-500"
            >
              <Square size={22} fill="currentColor" className="animate-pulse" />
              <span>Stop Recording</span>
            </button>
          )}
        </div>

        {audioBlob && !isRecording && (
          <div className="flex flex-col items-center gap-6 w-full pt-8 border-t border-border mt-2 animate-reveal">
            <audio src={URL.createObjectURL(audioBlob)} controls className="w-full max-w-md h-12 rounded-full opacity-90" />
            <button
              onClick={submitAudio}
              disabled={isLoading}
              className="group flex w-full max-w-md items-center justify-center gap-3 px-6 py-4 min-h-[56px] bg-primary text-white rounded-full font-bold text-lg transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 shadow-clay-3 hover:bg-primary-hover"
            >
              <Sparkles size={22} strokeWidth={2.5} className={isLoading ? "animate-spin" : ""} />
              <span>{isLoading ? "Analyzing..." : "Evaluate Now"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && typeof result === "object" ? (
        <div className="mt-16 md:mt-24 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 relative z-10">
          
          {/* Overall Score - Col Span 4 */}
          <div className="lg:col-span-4 bg-surface p-6 md:p-8 rounded-[24px] animate-reveal delay-100 shadow-clay-2 border border-border flex flex-col justify-center items-center text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-4">Overall Band</h2>
            <div className="text-7xl md:text-8xl font-heading font-black text-primary drop-shadow-sm mb-6">
              {result.overall}
            </div>
            <p className="text-text-primary text-base md:text-lg leading-relaxed font-medium">
              {result.summary}
            </p>
          </div>
          
          {/* Detailed Metrics - Col Span 8 */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            
            {/* Pronunciation */}
            <div className="bg-surface p-6 rounded-[16px] animate-reveal delay-200 shadow-clay-1 border border-border flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-text-primary font-heading font-bold text-xl">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                    <Volume2 size={20} strokeWidth={2.5} />
                  </div>
                  Pronunciation
                </div>
                <div className="bg-background text-text-primary font-bold px-3 py-1 rounded-full text-base border border-border">
                  {result.pronunciation?.score}
                </div>
              </div>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                {result.pronunciation?.feedback}
              </p>
            </div>

            {/* Vocabulary */}
            <div className="bg-surface p-6 rounded-[16px] animate-reveal delay-300 shadow-clay-1 border border-border flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-text-primary font-heading font-bold text-xl">
                  <div className="w-10 h-10 rounded-full bg-success-soft text-success flex items-center justify-center">
                    <BookOpen size={20} strokeWidth={2.5} />
                  </div>
                  Vocabulary
                </div>
                <div className="bg-background text-text-primary font-bold px-3 py-1 rounded-full text-base border border-border">
                  {result.vocabulary?.score}
                </div>
              </div>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                {result.vocabulary?.feedback}
              </p>
            </div>

            {/* Grammar */}
            <div className="bg-surface p-6 rounded-[16px] animate-reveal delay-400 shadow-clay-1 border border-border flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-text-primary font-heading font-bold text-xl">
                  <div className="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center">
                    <PenTool size={20} strokeWidth={2.5} />
                  </div>
                  Grammar
                </div>
                <div className="bg-background text-text-primary font-bold px-3 py-1 rounded-full text-base border border-border">
                  {result.grammar?.score}
                </div>
              </div>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                {result.grammar?.feedback}
              </p>
            </div>

            {/* Fluency */}
            <div className="bg-surface p-6 rounded-[16px] animate-reveal delay-500 shadow-clay-1 border border-border flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-text-primary font-heading font-bold text-xl">
                  <div className="w-10 h-10 rounded-full bg-error-soft text-error flex items-center justify-center">
                    <Wind size={20} strokeWidth={2.5} />
                  </div>
                  Fluency
                </div>
                <div className="bg-background text-text-primary font-bold px-3 py-1 rounded-full text-base border border-border">
                  {result.fluency?.score}
                </div>
              </div>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                {result.fluency?.feedback}
              </p>
            </div>

          </div>
        </div>
      ) : result && typeof result === "string" ? (
        <div className="mt-16 md:mt-24 w-full max-w-4xl bg-surface p-6 md:p-10 rounded-[24px] animate-reveal delay-100 shadow-clay-2 border border-border">
          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-heading prose-headings:font-bold prose-p:text-text-secondary">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      ) : null}
    </main>
  );
}
