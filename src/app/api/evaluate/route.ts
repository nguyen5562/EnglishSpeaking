import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_CONFIG } from "@/config/ai.config";

// Lưu ý: Lấy API key từ file .env.local
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chưa cấu hình GEMINI_API_KEY trong file .env.local" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "Không tìm thấy file âm thanh" }, { status: 400 });
    }

    // Chuyển file âm thanh thành buffer -> base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    // Khởi tạo mô hình dựa trên cấu hình tách rời
    const model = genAI.getGenerativeModel({ model: AI_CONFIG.MODEL_NAME });

    // Gọi API của Google Gemini và truyền Prompt từ file config
    const result = await model.generateContent([
      AI_CONFIG.SYSTEM_PROMPT,
      {
        inlineData: {
          mimeType: audioFile.type || "audio/webm",
          data: base64Data,
        },
      },
    ]);

    const responseText = result.response.text();

    return NextResponse.json({ result: responseText });
  } catch (error: any) {
    console.error("Lỗi Server:", error);
    return NextResponse.json(
      { error: error.message || "Đã xảy ra lỗi hệ thống" },
      { status: 500 }
    );
  }
}
