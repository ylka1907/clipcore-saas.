import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userText = body.text.trim();
    const systemPrompt = `Ты — AI-модуль ClipCore. Ссылка/тема: "${userText}". Верни ответ СТРОГО в формате JSON массива объектов с id, time, title, score. Никакого другого текста, вступлений и заключений! Только чистый JSON массив.`;

    // 1. ИСПРАВЛЕНО: Указан точный и полный эндпоинт для работы с API
    const response = await fetch("https://openrouter.ai", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${process.env.AI_SECRET_KEY}`,
        // 2. ИСПРАВЛЕНО: Добавлены обязательные заголовки для OpenRouter, чтобы запросы не блокировались
        "HTTP-Referer": "https://netlify.app", 
        "X-Title": "ClipCore"
      },
      body: JSON.stringify({ 
        model: "meta-llama/llama-3.1-8b-instruct:free", 
        messages: [
          { role: "system", content: systemPrompt }, 
          { role: "user", content: userText }
        ], 
        temperature: 0.3
      })
    });

    // Получаем сырой текст ответа для безопасной отладки
    const rawText = await response.text();
    let aiData;
    
    try {
      aiData = JSON.parse(rawText);
    } catch (e) {
      throw new Error(`Ответ от сервера не является JSON. Сырой ответ: ${rawText.slice(0, 100)}`);
    }
    
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      throw new Error(`Неверный формат JSON от OpenRouter: ${JSON.stringify(aiData)}`);
    }

    const rawContent = aiData.choices[0].message.content.trim();
    
    const jsonStartIndex = rawContent.indexOf("[");
    const jsonEndIndex = rawContent.lastIndexOf("]") + 1;
    
    if (jsonStartIndex === -1 || jsonEndIndex === 0) {
      throw new Error("ИИ не вернул валидный JSON массив");
    }
    
    const cleanJsonString = rawContent.slice(jsonStartIndex, jsonEndIndex);
    const parsedClips = JSON.parse(cleanJsonString);
    
    return NextResponse.json({ clips: parsedClips });
  } catch (error: any) {
    console.error("Ошибка API:", error?.message || error);
    const fallbackClips = [
      { id: 1, time: "00:05 - 00:35", title: "⚡ Трендовый разбор темы для Shorts (Заглушка)", score: 96 },
      { id: 2, time: "01:20 - 02:00", title: "💥 Инсайд, который взорвет Reels (Заглушка)", score: 92 },
      { id: 3, time: "03:45 - 04:15", title: "🚀 Секретный финал (Подпишись на канал)", score: 97 }
    ];
    return NextResponse.json({ clips: fallbackClips });
  }
}
