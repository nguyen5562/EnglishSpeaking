# Các tính năng dự kiến phát triển (Future Features)

## Kiến trúc Pipeline (Chia để trị) cho tính năng Đánh giá Speaking

Kiến trúc này nhằm nâng cao độ chính xác và chuyên nghiệp cho tính năng chấm điểm IELTS Speaking, thay thế cho việc gửi trực tiếp toàn bộ file audio cho một LLM duy nhất.

### Bước 1: Chuyển giọng nói thành văn bản (Speech-to-Text - STT)
- **Công cụ đề xuất:** Sử dụng các dịch vụ STT siêu chuẩn như **OpenAI Whisper** hoặc **Google Cloud Speech-to-Text**.
- **Mục đích:** Lấy ra đoạn Transcript (Văn bản) chuẩn xác nhất mà user đã nói. Tránh việc LLM nghe nhầm hoặc đoán mò.

### Bước 2: Đánh giá Phát âm chuyên sâu (Pronunciation Assessment)
- **Công cụ đề xuất:** Sử dụng **Microsoft Azure Speech Services (Pronunciation Assessment)**.
- **Mục đích:** Đây là API đỉnh nhất hiện nay cho việc chấm điểm phát âm tiếng Anh. Nó sẽ trả về điểm số chi tiết cho từng từ, từng âm tiết (ví dụ: phát hiện đọc thiếu âm cuối s, ed, hay nhấn sai trọng âm).

### Bước 3: Đánh giá Ngữ pháp, Từ vựng & Ý tưởng (LLM)
- **Công cụ đề xuất:** Gửi đoạn Text (lấy được ở Bước 1) cho **Gemini** hoặc **GPT-4o**.
- **Mục đích:** Lúc này LLM chỉ làm việc với Text, nó sẽ phân tích cực kỳ chính xác xem câu này ngữ pháp đúng chưa, từ vựng thuộc band mấy, và gợi ý cách diễn đạt (paraphrase) câu tự nhiên và hay hơn (giống như phiên bản hiện tại đang làm, nhưng với input text chuẩn xác 100%).
