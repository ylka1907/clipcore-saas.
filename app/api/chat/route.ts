import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userText = body.text.trim();
    const systemPrompt = `Ты — AI-модуль ClipCore. Ссылка/тема: "${userText}". Верни ответ СТРОГО в формате JSON массива объектов с id, time, title, score. Никакого другого текста, вступлений и заключений! Только чистый JSON массив.`;

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
        temperature: 0.3 // Уменьшили температуру, чтобы ИИ отвечал строго по делу и меньше фантазировал
      })
    });

    const aiData = await response.json();
    
    // Проверяем, что ответ от OpenRouter вообще пришел
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      throw new Error("Неверный формат ответа от OpenRouter API");
    }

    const rawContent = aiData.choices[0].message.content.trim();
    
    // УМНАЯ ОЧИСТКА: Находим, где начинается [ и заканчивается ] массив JSON, игнорируя лишний текст ИИ
    const jsonStartIndex = rawContent.indexOf("[");
    const jsonEndIndex = rawContent.lastIndexOf("]") + 1;
    
    if (jsonStartIndex === -1 || jsonEndIndex === 0) {
      throw new Error("ИИ не вернул валидный JSON массив");
    }
    
    const cleanJsonString = rawContent.slice(jsonStartIndex, jsonEndIndex);
    const parsedClips = JSON.parse(cleanJsonString);
    
    return NextResponse.json({ clips: parsedClips });
  } catch (error) {
    console.error("Ошибка API, отдаем запасные карточки:", error);
    const fallbackClips = [
      { id: 1, time: "00:05 - 00:35", title: "⚡ Трендовый разбор темы для Shorts (Заглушка)", score: 96 },
      { id: 2, time: "01:20 - 02:00", title: "💥 Инсайд, который взорвет Reels (Заглушка)", score: 92 },
      { id: 3, time: "03:45 - 04:15", title: "🚀 Секретный финал (Подпишись на канал)", score: 97 }
    ];
    return NextResponse.json({ clips: fallbackClips });
  }
}
