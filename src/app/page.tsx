"use client";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
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
      alert("Không thể truy cập Micro! Hãy đảm bảo bạn đã cấp quyền.");
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
        alert("Lỗi: " + data.error);
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
      alert("Có lỗi xảy ra khi chấm bài. Xem console để biết chi tiết.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full px-4 py-32 md:py-48 flex flex-col items-center bg-[#FAFAFA] font-sans relative overflow-hidden">
      
      {/* Soft Structuralism: Ambient Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-rose-100/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Eyebrow Pill */}
      <div className="animate-reveal rounded-full px-5 py-2 text-[10px] uppercase tracking-[0.25em] font-extrabold bg-white text-[var(--color-primary)] mb-10 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-indigo-50">
        AI Evaluator Engine
      </div>

      {/* Macro Typography */}
      <h1 className="animate-reveal delay-100 text-6xl md:text-[5rem] lg:text-[6.5rem] font-black text-center text-slate-900 tracking-tighter max-w-4xl leading-[0.95] drop-shadow-sm">
        Speak with <br/><span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-rose-400">absolute</span> clarity.
      </h1>
      
      <p className="animate-reveal delay-200 mt-10 text-[20px] md:text-[22px] text-slate-500 text-center max-w-2xl leading-relaxed font-medium">
        Record your voice or upload an audio file to receive instant, deeply contextual AI feedback on pronunciation, vocabulary, and fluency.
      </p>

      {/* Main Interaction Card (Extreme Double-Bezel) */}
      <div className="animate-reveal delay-300 mt-20 w-full max-w-2xl bg-black/[0.02] p-2.5 rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(79,70,229,0.1)] relative z-10 backdrop-blur-xl border border-white/50">
        <div className="bg-white/80 backdrop-blur-md rounded-[calc(3.5rem-0.625rem)] shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_4px_12px_rgba(0,0,0,0.02)] border border-white p-10 md:p-14 flex flex-col items-center gap-10">
          
          <div className="flex flex-col sm:flex-row gap-5 w-full justify-center">
            {!isRecording ? (
              <>
                <button 
                  onClick={startRecording} 
                  className="group flex items-center justify-between px-8 py-5 bg-slate-900 text-white rounded-full font-bold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.4)] hover:bg-slate-800 w-full sm:w-auto min-w-[240px]"
                >
                  <span className="flex items-center gap-3 text-lg">
                    <Mic size={22} strokeWidth={2.5} />
                    Record Audio
                  </span>
                  {/* Button-in-Button */}
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1.5 group-hover:scale-110 ml-4">
                    <ArrowRight size={16} strokeWidth={3} />
                  </div>
                </button>
                <label className="group flex items-center justify-between px-8 py-5 bg-slate-100 text-slate-700 rounded-full font-bold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96] hover:bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.06)] border border-slate-200/50 w-full sm:w-auto min-w-[220px] cursor-pointer">
                  <span className="flex items-center gap-3 text-lg">
                    <Upload size={22} strokeWidth={2.5} />
                    Upload
                  </span>
                  <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </>
            ) : (
              <button 
                onClick={stopRecording} 
                className="group flex items-center justify-between px-8 py-5 bg-rose-500 text-white rounded-full font-bold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96] shadow-[0_12px_24px_-8px_rgba(244,63,94,0.4)] hover:bg-rose-400 w-full sm:w-auto min-w-[240px]"
              >
                <span className="flex items-center gap-3 text-lg">
                  <Square size={22} fill="currentColor" className="animate-pulse" />
                  Stop Recording
                </span>
              </button>
            )}
          </div>

          {audioBlob && !isRecording && (
            <div className="flex flex-col items-center gap-10 w-full pt-10 border-t border-slate-100 mt-4 animate-reveal">
              <audio src={URL.createObjectURL(audioBlob)} controls className="w-full max-w-md h-14 rounded-full opacity-80" />
              <button
                onClick={submitAudio}
                disabled={isLoading}
                className="group flex items-center justify-between w-full max-w-md px-8 py-5 bg-indigo-600 text-white rounded-full font-bold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96] disabled:opacity-50 disabled:active:scale-100 shadow-[0_12px_24px_-8px_rgba(79,70,229,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-500"
              >
                <span className="flex items-center gap-3 text-[19px]">
                  <Sparkles size={24} strokeWidth={2.5} className={isLoading ? "animate-spin" : ""} />
                  {isLoading ? "Analyzing..." : "Evaluate Now"}
                </span>
                {!isLoading && (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1.5 group-hover:scale-110 ml-4">
                    <ArrowRight size={16} strokeWidth={3} />
                  </div>
                )}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Results Asymmetrical Bento */}
      {result && typeof result === "object" ? (
        <div className="mt-32 w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
          
          {/* Overall Band - Col Span 5 */}
          <div className="md:col-span-5 bg-black/[0.02] p-2.5 rounded-[3.5rem] animate-reveal delay-100 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)] border border-white/50">
            <div className="bg-white/80 backdrop-blur-md h-full rounded-[calc(3.5rem-0.625rem)] shadow-[inset_0_2px_4px_rgba(255,255,255,1)] border border-white p-12 flex flex-col justify-center items-center text-center transition-transform hover:-translate-y-2 duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-extrabold mb-6">Overall Band</h2>
              <div className="text-[9rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-500 to-indigo-900 drop-shadow-sm">{result.overall}</div>
              <p className="text-slate-500 mt-10 text-[17px] leading-relaxed font-medium">{result.summary}</p>
            </div>
          </div>
          
          {/* Metrics - Col Span 7 */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Pronunciation */}
            <div className="bg-indigo-500/[0.04] p-2 rounded-[3rem] animate-reveal delay-200 transition-transform hover:-translate-y-2 duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] border border-indigo-500/[0.05]">
              <div className="bg-white/90 backdrop-blur-md h-full rounded-[calc(3rem-0.5rem)] shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_4px_12px_rgba(79,70,229,0.05)] border border-indigo-50 p-8 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-indigo-900 font-bold text-[20px]">
                    <Volume2 size={24} strokeWidth={2.5} className="text-indigo-500" /> Pronunciation
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 font-black px-4 py-2 rounded-full text-base">{result.pronunciation?.score}</span>
                </div>
                <p className="text-[16px] text-slate-600 leading-relaxed font-medium">{result.pronunciation?.feedback}</p>
              </div>
            </div>

            {/* Vocabulary */}
            <div className="bg-emerald-500/[0.04] p-2 rounded-[3rem] animate-reveal delay-300 transition-transform hover:-translate-y-2 duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] border border-emerald-500/[0.05]">
              <div className="bg-white/90 backdrop-blur-md h-full rounded-[calc(3rem-0.5rem)] shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_4px_12px_rgba(16,185,129,0.05)] border border-emerald-50 p-8 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-emerald-900 font-bold text-[20px]">
                    <BookOpen size={24} strokeWidth={2.5} className="text-emerald-500" /> Vocabulary
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 font-black px-4 py-2 rounded-full text-base">{result.vocabulary?.score}</span>
                </div>
                <p className="text-[16px] text-slate-600 leading-relaxed font-medium">{result.vocabulary?.feedback}</p>
              </div>
            </div>

            {/* Grammar */}
            <div className="bg-amber-500/[0.04] p-2 rounded-[3rem] animate-reveal delay-400 transition-transform hover:-translate-y-2 duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] border border-amber-500/[0.05]">
              <div className="bg-white/90 backdrop-blur-md h-full rounded-[calc(3rem-0.5rem)] shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_4px_12px_rgba(245,158,11,0.05)] border border-amber-50 p-8 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-amber-900 font-bold text-[20px]">
                    <PenTool size={24} strokeWidth={2.5} className="text-amber-500" /> Grammar
                  </div>
                  <span className="bg-amber-50 text-amber-700 font-black px-4 py-2 rounded-full text-base">{result.grammar?.score}</span>
                </div>
                <p className="text-[16px] text-slate-600 leading-relaxed font-medium">{result.grammar?.feedback}</p>
              </div>
            </div>

            {/* Fluency */}
            <div className="bg-rose-500/[0.04] p-2 rounded-[3rem] animate-reveal delay-500 transition-transform hover:-translate-y-2 duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] border border-rose-500/[0.05]">
              <div className="bg-white/90 backdrop-blur-md h-full rounded-[calc(3rem-0.5rem)] shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_4px_12px_rgba(244,63,94,0.05)] border border-rose-50 p-8 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-rose-900 font-bold text-[20px]">
                    <Wind size={24} strokeWidth={2.5} className="text-rose-500" /> Fluency
                  </div>
                  <span className="bg-rose-50 text-rose-700 font-black px-4 py-2 rounded-full text-base">{result.fluency?.score}</span>
                </div>
                <p className="text-[16px] text-slate-600 leading-relaxed font-medium">{result.fluency?.feedback}</p>
              </div>
            </div>

          </div>
        </div>
      ) : result && typeof result === "string" ? (
        <div className="mt-32 w-full max-w-4xl bg-black/[0.02] p-2.5 rounded-[3.5rem] animate-reveal delay-100">
          <div className="bg-white/80 backdrop-blur-md rounded-[calc(3.5rem-0.625rem)] shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_12px_32px_rgba(0,0,0,0.04)] border border-white p-14 prose prose-lg prose-slate max-w-none prose-headings:font-black">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      ) : null}
    </main>
  );
}

