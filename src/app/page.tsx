"use client";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

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
          // Gemini JSON response may be wrapped in ```json ... ```
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
    <main className="min-h-screen p-8 max-w-3xl mx-auto flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold text-center mt-10">🎙️ IELTS Speaking AI Evaluator</h1>
      <p className="text-gray-500 text-center">Bấm để thu âm đoạn nói tiếng Anh của bạn hoặc tải file lên</p>

      <div className="flex gap-4 mt-8">
        {!isRecording ? (
          <>
            <button 
              onClick={startRecording} 
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition shadow-md"
            >
              🔴 Bắt đầu thu âm
            </button>
            <label className="px-6 py-3 bg-gray-600 text-white rounded-full font-semibold hover:bg-gray-700 transition shadow-md cursor-pointer flex items-center">
              📁 Tải file lên
              <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </>
        ) : (
          <button 
            onClick={stopRecording} 
            className="px-6 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition animate-pulse shadow-md"
          >
            ⏹ Dừng thu âm
          </button>
        )}
      </div>

      {audioBlob && !isRecording && (
        <div className="flex flex-col items-center gap-4 mt-6 w-full p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <audio src={URL.createObjectURL(audioBlob)} controls className="w-full max-w-md" />
          <button
            onClick={submitAudio}
            disabled={isLoading}
            className="w-full max-w-md px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 shadow-md"
          >
            {isLoading ? "⏳ AI đang phân tích và chấm điểm..." : "✨ Gửi cho Giám Khảo AI"}
          </button>
        </div>
      )}

      {result && typeof result === "object" ? (
        <div className="w-full mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Overall Score</h2>
            <div className="text-5xl font-extrabold text-blue-600 mt-2">{result.overall}</div>
            <p className="text-gray-600 mt-4 text-lg">{result.summary}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-800 flex justify-between items-center text-lg">
                <span>🗣️ Phát âm</span>
                <span className="bg-white px-2 py-1 rounded-md shadow-sm">{result.pronunciation?.score}/10</span>
              </h3>
              <p className="text-sm text-gray-700 mt-3">{result.pronunciation?.feedback}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="font-bold text-green-800 flex justify-between items-center text-lg">
                <span>📚 Từ vựng</span>
                <span className="bg-white px-2 py-1 rounded-md shadow-sm">{result.vocabulary?.score}/10</span>
              </h3>
              <p className="text-sm text-gray-700 mt-3">{result.vocabulary?.feedback}</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <h3 className="font-bold text-yellow-800 flex justify-between items-center text-lg">
                <span>✍️ Ngữ pháp</span>
                <span className="bg-white px-2 py-1 rounded-md shadow-sm">{result.grammar?.score}/10</span>
              </h3>
              <p className="text-sm text-gray-700 mt-3">{result.grammar?.feedback}</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="font-bold text-purple-800 flex justify-between items-center text-lg">
                <span>🌊 Độ trôi chảy</span>
                <span className="bg-white px-2 py-1 rounded-md shadow-sm">{result.fluency?.score}/10</span>
              </h3>
              <p className="text-sm text-gray-700 mt-3">{result.fluency?.feedback}</p>
            </div>
          </div>
        </div>
      ) : result && typeof result === "string" ? (
        <div className="w-full mt-8 p-8 bg-gray-50 rounded-xl border border-gray-200 shadow-inner prose prose-blue max-w-none">
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      ) : null}
    </main>
  );
}

