import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, Mic, X, Activity, Settings, Book, LineChart, Flame, ChevronRight, Menu, MessageSquare, Send, Lock, Trash2, LockKeyholeOpen, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { sendMessageToGPT, transcribeAudio, generateSpeech } from './openai';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const WaveBars = ({ isVisible, compact = false }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={cn("flex items-center justify-center gap-[6px]", compact ? "h-12 gap-[3px]" : "h-40")}
        >
          <motion.div 
            animate={{ height: compact ? [15, 25, 15] : [60, 100, 60] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className={cn("rounded-full bg-[#FF6B6B] shadow-lg", compact ? "w-[3px]" : "w-[50px]")} 
          />
          <motion.div 
            animate={{ height: compact ? [20, 30, 20] : [80, 120, 80] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className={cn("rounded-full bg-[#2E5BFF] shadow-lg", compact ? "w-[3px]" : "w-[50px]")} 
          />
          <motion.div 
            animate={{ height: compact ? [25, 40, 25] : [100, 150, 100] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className={cn("rounded-full bg-[#FFCC00] shadow-lg", compact ? "w-[3px]" : "w-[50px]")} 
          />
          <motion.div 
            animate={{ height: compact ? [20, 30, 20] : [80, 120, 80] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className={cn("rounded-full bg-[#2E5BFF] shadow-lg", compact ? "w-[3px]" : "w-[50px]")} 
          />
          <motion.div 
            animate={{ height: compact ? [15, 25, 15] : [60, 100, 60] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className={cn("rounded-full bg-[#4CD964] shadow-lg", compact ? "w-[3px]" : "w-[50px]")} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const RecordingCircle = ({ isRecording }) => {
  return (
    <AnimatePresence>
      {isRecording && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="relative flex flex-col items-center justify-center gap-4"
        >
          {/* Top Closed Lock */}
          <div className="bg-white/10 p-2 rounded-full mb-2">
            <Lock size={20} className="text-white/40" />
          </div>

          <div className="relative flex items-center justify-center">
            {/* Outer pulse effect */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-48 h-48 rounded-full bg-[#2E5BFF]"
            />
            {/* Main solid circle */}
            <div className="w-40 h-40 rounded-full bg-[#2E5BFF] shadow-xl relative z-10 flex items-center justify-center" />
          </div>

          {/* Bottom Open Lock */}
          <div className="bg-white/10 p-2 rounded-full mt-2">
            <LockKeyholeOpen size={20} className="text-white/40" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Header = ({ onOpenHistory }) => (
  <div className="flex items-center justify-between px-6 pt-4 pb-2 w-full max-w-md mx-auto">
    <button 
      onClick={onOpenHistory}
      className="w-10 h-10 rounded-full bg-white shadow-milo flex items-center justify-center border border-gray-50 active:scale-90 transition-transform"
    >
      <Menu size={20} className="text-gray-700" />
    </button>
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-milo border border-gray-50">
      <div className="w-7 h-5 overflow-hidden rounded-[4px] relative shadow-sm border border-gray-100 bg-white">
        {/* Stripes */}
        <div className="flex flex-col h-full w-full">
          {[...Array(7)].map((_, i) => (
            <div key={i} className={`h-[14.28%] ${i % 2 === 0 ? 'bg-[#BF0A30]' : 'bg-white'}`} />
          ))}
        </div>
        {/* Blue canton with simplified stars */}
        <div className="absolute top-0 left-0 w-[45%] h-[57%] bg-[#002868] flex items-center justify-center p-[1px]">
          <div className="grid grid-cols-3 gap-[1px]">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-[1.5px] h-[1.5px] bg-white rounded-full opacity-90" />
            ))}
          </div>
        </div>
      </div>
      <span className="text-sm font-semibold text-[#1a1a1a]">Уровень 1</span>
      <ChevronDown size={16} className="text-gray-400" />
    </div>
    <div className="w-10 h-10 rounded-full bg-white shadow-milo flex items-center justify-center border border-gray-50">
      <User size={20} className="text-gray-700" />
    </div>
  </div>
);

const HistoryScreen = ({ isOpen, onClose, history = [] }) => {
  return (
    <motion.div 
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.1, right: 0 }}
      onDragEnd={(e, info) => {
        if (info.offset.x < -50) onClose();
      }}
      className="fixed inset-0 bg-[#FCFCFC] z-0 flex flex-col w-full h-full overflow-hidden touch-none"
    >
      <div className="flex items-center justify-between px-8 pt-10 pb-4 w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#1a1a1a]">milo</h1>
        <button className="p-1.5">
          <Settings size={20} className="text-gray-900" />
        </button>
      </div>

      <div className="flex flex-col gap-2 px-6 mt-4 w-full max-w-md">
        <button className="flex items-center justify-between bg-white h-[36px] px-4 rounded-[12px] shadow-milo border border-gray-50 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <Book size={18} className="text-gray-900" />
            </div>
            <span className="text-[15px] font-semibold text-gray-900">Словарь</span>
          </div>
          <ChevronRight size={16} className="text-gray-900 opacity-40" />
        </button>

        <button className="flex items-center justify-between bg-white h-[36px] px-4 rounded-[12px] shadow-milo border border-gray-50 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <LineChart size={18} className="text-gray-900" />
            </div>
            <span className="text-[15px] font-semibold text-gray-900">Прогресс</span>
          </div>
          <ChevronRight size={16} className="text-gray-900 opacity-40" />
        </button>

        <button className="flex items-center justify-between bg-white h-[36px] px-4 rounded-[12px] shadow-milo border border-gray-50 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <Flame size={18} className="text-gray-900" />
            </div>
            <span className="text-[15px] font-semibold text-gray-900">Серия</span>
          </div>
          <ChevronRight size={16} className="text-gray-900 opacity-40" />
        </button>
      </div>

      <div className="mt-8 px-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">История</h2>
        
        <div className="mt-4 flex flex-col gap-3">
          {history.length > 0 ? (
            history.map((session, i) => (
              <div key={i} className="bg-[#F5F5F5] p-4 rounded-[20px] flex flex-col gap-0.5">
                <span className="text-gray-500 text-[13px] font-medium leading-tight">Сессия</span>
                <h3 className="text-[16px] font-bold text-[#1a1a1a] leading-tight">
                  {session.title}
                </h3>
                <span className="text-gray-400 text-[11px] mt-0.5">
                  {session.date}
                </span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-gray-900 font-medium text-lg">
                Упс, вы еще не начали учиться
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pb-12 px-6 flex justify-end w-full max-w-md mx-auto">
        <button 
          onClick={onClose}
          className="bg-[#2E5BFF] text-white h-[40px] px-7 rounded-[20px] shadow-milo flex items-center gap-2.5 active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-[2px]">
            <div className="w-[2.5px] h-3 bg-white rounded-full"></div>
            <div className="w-[2.5px] h-5 bg-white rounded-full"></div>
            <div className="w-[2.5px] h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-[17px] font-bold">Чат</span>
        </button>
      </div>
    </motion.div>
  );
};

const ChatDialogue = ({ messages, isLoading }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <motion.div 
      ref={scrollRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 px-6 pt-4 pb-64 overflow-y-auto w-full h-full scroll-smooth"
    >
      {messages.map((msg, index) => (
        <div key={index} className={cn("flex flex-col gap-1", msg.role === 'user' ? "items-end" : "items-start")}>
          <div className={cn(
            "px-5 py-3 rounded-[24px] text-lg max-w-[85%]",
            msg.role === 'user' 
              ? "bg-white shadow-milo text-[#1a1a1a] font-medium border border-gray-50" 
              : "text-[#333] leading-relaxed"
          )}>
            {msg.content.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex items-start gap-1">
          <div className="flex gap-1 px-4 py-3 bg-gray-100 rounded-full">
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-gray-400 rounded-full" />
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [isWaveVisible, setIsWaveVisible] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Привет, Азат! Я Milo AI, помогу тебе выучить английский для путешествий.\nНачнём с аэропорта — базовые фразы для первых ситуаций за границей.\nСкажи, как по-русски ты спросишь, где аэропорт?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const history = [
    { title: "Первый разговор в аэропорту", date: "18.04.2026 03:57" }
  ];

  const handleStartChat = async () => {
    console.log("handleStartChat triggered");
    
    // Проверяем поддержку getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Ваш браузер не поддерживает запись аудио. Попробуйте обновить браузер или использовать Chrome/Safari.");
      setIsHistoryOpen(false);
      setIsStarted(true);
      return;
    }

    try {
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted!");
      
      // Останавливаем стрим после получения разрешения
      stream.getTracks().forEach(track => track.stop());
      
      setIsHistoryOpen(false);
      setIsStarted(true);
    } catch (err) {
      console.error("Microphone error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert("Доступ к микрофону отклонен. Пожалуйста, разрешите доступ в настройках браузера (иконка замочка в адресной строке) и обновите страницу.");
      } else {
        alert("Ошибка при доступе к микрофону: " + err.message);
      }
      // Все равно переходим в чат, чтобы можно было писать текстом
      setIsHistoryOpen(false);
      setIsStarted(true);
    }
  };

  const handleSendMessage = async (text) => {
    const message = text || inputText;
    if (!message.trim() || isLoading) return;

    const newUserMessage = { role: 'user', content: message };
    const updatedMessages = [...messages, newUserMessage];
    
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const gptResponse = await sendMessageToGPT(updatedMessages);
      setMessages([...updatedMessages, gptResponse]);
      setIsLoading(false);

      // ВСЕГДА озвучиваем ответ ИИ
      console.log("Generating speech for response:", gptResponse.content);
      const audioUrl = await generateSpeech(gptResponse.content);
      
      if (audioUrl) {
        console.log("Audio URL received, playing...");
        const audio = new Audio();
        audio.src = audioUrl;
        audio.crossOrigin = "anonymous";
        
        const playAudio = async () => {
          try {
            await audio.play();
            console.log("Audio playing successfully");
          } catch (e) {
            console.error("Audio playback failed:", e);
            // Если автоплей заблокирован, пробуем воспроизвести при следующем клике
            const playOnClick = () => {
              audio.play();
              window.removeEventListener('click', playOnClick);
            };
            window.addEventListener('click', playOnClick);
          }
        };
        
        playAudio();
      } else {
        console.error("Failed to get audio URL from generateSpeech");
      }
    } catch (error) {
      console.error("Error in message flow:", error);
      setIsLoading(false);
    }
  };

  const onDragEnd = (event, info) => {
    // Свайп слева направо (открытие)
    if (info.offset.x > 50 && !isHistoryOpen) {
      setIsHistoryOpen(true);
    }
    // Свайп справа налево (закрытие) - работает когда история открыта
    if (info.offset.x < -50 && isHistoryOpen) {
      setIsHistoryOpen(false);
    }
  };

  const handleRecordStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const text = await transcribeAudio(audioBlob);
        if (text) {
          handleSendMessage(text);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsWaveVisible(false);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const handleRecordEnd = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsWaveVisible(true);
    }
  };

  return (
    <div className="h-screen bg-[#F0F0F0] flex flex-col items-center font-sans overflow-hidden fixed inset-0">
      <div className={cn("fixed inset-0 z-0", isHistoryOpen ? "pointer-events-auto" : "pointer-events-none")}>
        <HistoryScreen 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)}
          history={history}
        />
      </div>

      <motion.div 
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 1000 }}
        dragElastic={0.05}
        onDragEnd={onDragEnd}
        animate={{ 
          x: isHistoryOpen ? "100%" : "0%",
        }}
        transition={{ 
          type: "tween", 
          ease: "easeInOut", 
          duration: 0.3 
        }}
        className="h-full w-full bg-[#FCFCFC] flex flex-col items-center relative z-10 overflow-hidden shadow-2xl touch-none"
      >
        <Header onOpenHistory={() => setIsHistoryOpen(true)} />
        
        <main className="flex-1 w-full max-w-md flex flex-col items-center relative overflow-hidden h-full">
          <AnimatePresence mode="wait">
            {!isStarted ? (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-12 pb-24"
              >
                <h1 className="text-2xl font-bold text-center px-10">
                  Первый разговор в аэропорту
                </h1>
                
                <WaveBars isVisible={true} />
                
                <button 
                  onClick={() => setIsStarted(true)}
                  className="bg-[#2E5BFF] text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg shadow-[#2E5BFF44] active:scale-95 transition-transform"
                >
                  Начать
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col overflow-hidden"
              >
                <ChatDialogue messages={messages} isLoading={isLoading} />
                
                {/* FIXED WAVE PANEL - Out of scroll flow */}
                <div className="fixed bottom-24 left-0 right-0 z-20 pointer-events-none flex flex-col items-center max-w-md mx-auto h-64 justify-center">
                  <AnimatePresence>
                    {(isWaveVisible || isRecording) && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-x-0 -bottom-24 h-[450px] bg-gradient-to-t from-[#FCFCFC] via-[#FCFCFC] to-transparent pointer-events-none" 
                      />
                    )}
                  </AnimatePresence>
                  <div 
                      onPointerDown={handleRecordStart}
                      onPointerUp={handleRecordEnd}
                      onPointerLeave={handleRecordEnd}
                      className="pointer-events-auto cursor-pointer relative flex items-center justify-center w-full z-10 touch-none"
                    >
                      <div className="absolute">
                        <WaveBars isVisible={isWaveVisible} />
                      </div>
                      <div className="absolute">
                        <RecordingCircle isRecording={isRecording} />
                      </div>
                    </div>
                  {(isWaveVisible || isRecording) && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-400 text-sm mt-24 text-center w-full z-10"
                    >
                      {isRecording ? "Говорите..." : "Зажми чтобы говорить"}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer - ALWAYS FIXED */}
        <div className="fixed bottom-8 w-full max-w-md px-4 flex items-center gap-3 z-30 pointer-events-none mx-auto left-0 right-0">
          <div className="flex-1 bg-white h-14 rounded-full flex items-center px-6 shadow-milo border border-gray-50 pointer-events-auto">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Спросить Milo..." 
              className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          
          <button 
            onClick={() => handleSendMessage()}
            disabled={isLoading}
            className="w-14 h-14 bg-white text-gray-700 rounded-full flex items-center justify-center shadow-milo active:scale-90 transition-all pointer-events-auto disabled:opacity-50"
          >
            <Send size={24} />
          </button>
          
          <button 
            onClick={() => {
              if (isWaveVisible || isRecording) {
                setIsWaveVisible(false);
                setIsRecording(false);
              } else {
                setIsWaveVisible(true);
              }
            }}
            className="w-14 h-14 bg-[#111] text-white rounded-full flex items-center justify-center shadow-milo active:scale-90 transition-transform pointer-events-auto"
          >
            {isWaveVisible || isRecording ? (
              <X size={32} strokeWidth={2.5} />
            ) : (
              <div className="flex items-center gap-[3px]">
                <div className="w-[4px] h-4 bg-white rounded-full"></div>
                <div className="w-[4px] h-7 bg-white rounded-full"></div>
                <div className="w-[4px] h-5 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        </div>

        {/* Overlay to close history */}
        {isHistoryOpen && (
          <div 
            className="absolute inset-0 z-[60] cursor-pointer bg-black/5" 
            onClick={() => setIsHistoryOpen(false)}
          />
        )}
      </motion.div>
    </div>
  );
}
