'use client';

import { useState, useEffect, useRef } from "react";

interface Clip {
  id: number;
  time: string;
  title: string;
  score: number;
}

interface Message {
  id: number;
  text: string;
  isBot: boolean;
   clips?: Clip[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clips, setClips] = useState<any[]>([]);

  // ПРИКАЗ №1: Загрузка истории чата из сейфа при старте страницы
  useEffect(() => {
    const savedMessages = localStorage.getItem("cyber_core_messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // ПРИКАЗ №2: Сохранение новых сообщений в сейф
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("cyber_core_messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Настройка лазерного прицела для автоскролла
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ПРИКАЗ №3: Датчик-следопыт — при каждом новом сообщении стягиваем скролл вниз
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Обработчик отправки импульса (сообщения)
   const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isBot: false
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ text: currentInput })
      });
      const data = await response.json();
        
      if (data.clips) {
        // ПРИВЯЗКА КАРТОЧЕК: Теперь мы зашиваем прилетевшие клипы прямо внутрь объекта botMessage!
        const botMessage: Message = {
          id: Date.now() + 1,
          text: `🤖 Юля, сканирование медиа-потока успешно завершено! Мои алгоритмы выявили 3 вирусных пика под формат Shorts/Reels:`,
          isBot: true,
          clips: data.clips // Спрятали массив клипов в паспорт этого конкретного сообщения
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Ошибка сети:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ГЛАВНЫЙ КОНТЕЙНЕР (Запрещает внешние скроллы и центрирует всё строго по экрану)
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center">
      
      {/* Внутренний флекс-блок с круговым градиентом */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-emerald-950 text-slate-100 p-4 font-sans antialiased selection:bg-fuchsia-500 selection:text-white flex items-center justify-center">
        
        {/* Неоновые сферы на фоне */}
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[160px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[160px] pointer-events-none animate-pulse duration-5000"></div>

        {/* Основной корпус терминала */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[85vh] flex flex-col bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-white/10 rounded-[2.5rem] p-7 shadow-[0_0_80px_-15px_rgba(217,70,239,0.25)] backdrop-blur-3xl overflow-hidden z-10">
          
          {/* Свечение сверху */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-fuchsia-500/10 via-transparent to-transparent pointer-events-none"></div>

          {/* Анимированная линия сканирования сети */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-80 animate-[bounce_5s_infinite]"></div>

          {/* Информационная шапка — Железобетонно зафиксирована сверху */}
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-cyan-400"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-cyan-400/90">
                {isLoading ? "КВАНТОВЫЙ РАСЧЕТ..." : "НЕЙРОСЕТЬ ОНЛАЙН"}
              </span>
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400 drop-shadow-sm">
              КИБЕР-ЯДРО
            </h2>
          </div>
          
          {/* 📺 ЖИВОЙ ЭКРАН СООБЩЕНИЙ (Теперь занимает максимум места и крутится до самого низа!) */}
          <div className="flex-1 overflow-y-auto pr-1 mb-4 space-y-5 scrollbar-thin scrollbar-thumb-fuchsia-500/20 scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60 px-6 space-y-4 py-8">
                <div className="text-5xl animate-bounce duration-3000">🚀</div>
                <p className="text-sm font-mono font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
                  СИСТЕМА ГОТОВА К СИНХРОНИЗАЦИИ
                </p>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Пошли первый цифровой сигнал, чтобы запустить мыслительный контур искусственного интеллекта.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isBot ? 'items-start' : 'items-end'} space-y-3 animate-[fadeIn_0.25s_ease-out]`}>
                
                {/* Текстовое облачко чата */}
                <div className={`relative max-w-[85%] px-6 py-3.5 rounded-[1.5rem] text-[13.5px] leading-relaxed shadow-xl border transition-all ${
                  msg.isBot 
                    ? 'bg-gradient-to-br from-slate-900 to-slate-950 text-cyan-100 rounded-tl-none border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]' 
                    : 'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 text-white rounded-tr-none border-fuchsia-400/20 shadow-[0_8px_25px_rgba(217,70,239,0.3)]'
                }`}>
                  {!msg.isBot && <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none rounded-[1.5rem]"></div>}
                  <p className="font-medium tracking-wide whitespace-pre-line drop-shadow-sm">{msg.text}</p>
                </div>

                {/* РОДНЫЕ КАРТОЧКИ КЛИПОВ ВНУТРИ ОТВЕТА БОТА */}
                {msg.isBot && msg.clips && msg.clips.length > 0 && (
                  <div className="w-[85%] space-y-2 mt-1 pl-2 animate-[fadeIn_0.3s_ease-out]">
                    {msg.clips.map((clip) => (
                      <div 
                        key={clip.id} 
                        onClick={() => setInputText(clip.time)}
                        className="flex items-center justify-between bg-slate-950/60 border border-white/5 hover:border-fuchsia-500/40 p-3 rounded-xl transition-all duration-300 shadow-md group hover:shadow-[0_0_15px_rgba(217,70,239,0.1)] cursor-pointer"
                      >
                        <div className="flex flex-col gap-1 max-w-[70%]">
                          <span className="text-[10px] font-mono font-black text-fuchsia-400 bg-fuchsia-950/40 px-2 py-0.5 rounded w-max border border-fuchsia-500/20 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors duration-300">
                            ⏱ {clip.time}
                          </span>
                          <h4 className="text-[11px] font-medium text-slate-300 tracking-wide line-clamp-1">
                            {clip.title}
                          </h4>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider">
                            Viral
                          </span>
                          <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 font-mono">
                            {clip.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
              </div>
            ))}
            
            {/* Лазерный маркер-прицел для автоскролла */}
            <div ref={messagesEndRef} />
          </div>

          {/* ЗОНА ЗАГРУЗКИ ВИДЕО ФАЙЛОВ */}
          <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-fuchsia-500/50 bg-slate-950/40 p-4 rounded-2xl mb-4 transition-all duration-300 cursor-pointer shadow-[inset_0_0_20px_rgba(255,255,255,0.01)] hover:shadow-[0_0_30px_rgba(217,70,239,0.1)] shrink-0">
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300">🎬</div>
            <p className="text-xs font-mono font-bold tracking-wide text-slate-400 group-hover:text-fuchsia-400 transition-colors">
              ПЕРЕТАЩИ СЮДА ВИДЕО (.MP4, .MOV)
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              или кликни для выбора файла
            </p>
          </div>

          {/* ИНТЕРАКТИВНАЯ ПАНЕЛЬ СЦЕНАРИЕВ CLIPCORE (Свой независимый скролл h-[120px] для карточек) */}
          {clips.length > 0 && (
            <div className="h-[120px] overflow-y-auto pr-1 mb-4 space-y-3 relative z-10 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent shrink-0">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-fuchsia-400 sticky top-0 bg-slate-950/90 py-1 z-20">
                ⚡ Сгенерированные вирусные клипы:
              </p>
              
              {clips.map((clip) => (
                <div 
                  key={clip.id} 
                  onClick={() => setInputText(clip.time)}
                  className="flex items-center justify-between bg-slate-950/80 border border-white/5 hover:border-cyan-500/30 p-3 rounded-xl transition-all duration-300 shadow-md group hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] cursor-pointer"
                >
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <span className="text-[11px] font-mono font-black text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded w-max border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors duration-300">
                      ⏱ {clip.time}
                    </span>
                    <h4 className="text-xs font-medium text-slate-200 tracking-wide line-clamp-1">
                      {clip.title}
                    </h4>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">
                      Viral Score
                    </span>
                    <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 font-mono">
                      {clip.score}%
                    </span>
                    </div>
                    </div>
                ))}
              </div>
            )}



          {/* Премиальный блок ввода */}
          <div className="relative flex gap-2 bg-slate-950/60 border-2 border-white/5 p-2 rounded-2xl focus-within:border-fuchsia-500/60 focus-within:shadow-[0_0_35px_rgba(217,70,239,0.25)] transition-all duration-300 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isLoading ? "Нейросеть сканирует таймкоды..." : "Вставь ссылку на видео(YouTube/TikTok)..."}
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none tracking-wide"
            />
            <button 
              onClick={handleSendMessage}
              className="relative overflow-hidden group bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 hover:brightness-110 active:scale-95 text-white font-black uppercase tracking-widest px-7 py-2.5 rounded-xl text-[10px] transition-all shadow-lg"
            >
              <span className="relative z-10 tracking-[0.15em]">{isLoading ? "АНАЛИЗ" : "НАРЕЗАТЬ"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
