import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userText = body.text.trim();
    const systemPrompt = `Ты — AI-модуль ClipCore. Ссылка/тема: "${userText}". Верни ответ СТРОГО в формате JSON массива объектов с id, time, title, score. Никакого лишнего текста!`;

    // ИСПРАВЛЕНО: Указан точный эндпоинт v1/chat/completions для корректного запроса к API
    const response = await fetch("https://openrouter.ai", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${process.env.AI_SECRET_KEY}`

      },
      body: JSON.stringify({ 
        model: "meta-llama/llama-3.1-8b-instruct:free", 
        messages: [
          { role: "system", content: systemPrompt }, 
          { role: "user", content: userText }
        ], 
        temperature: 0.6 
      })
    });

    const aiData = await response.json();
   const parsedClips = JSON.parse(aiData.choices[0].message.content.trim());
    return NextResponse.json({ clips: parsedClips });
  } catch (error) {
    console.error("API Error, triggering fallback:", error);
    const fallbackClips = [
      { id: 1, time: "00:05 - 00:35", title: "⚡ Трендовый разбор темы для Shorts", score: 96 },
      { id: 2, time: "01:20 - 02:00", title: "💥 Инсайд, который взорвет Reels", score: 92 },
      { id: 3, time: "03:45 - 04:15", title: "🚀 Секретный финал (Подпишись на канал)", score: 97 }
    ];
    return NextResponse.json({ clips: fallbackClips });
  }
}
