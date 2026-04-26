import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, Mic, X, Activity, Settings, Book, LineChart, Flame, ChevronRight, Menu, MessageSquare, Send, Lock, Trash2, LockKeyholeOpen, ChevronUp, HelpCircle, Lightbulb, Smile, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { sendMessageToGPT, transcribeAudio, generateSpeech } from './openai';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const WaveBars = ({ isVisible, isAnimating = true, compact = false }) => {
  const staticHeight = compact ? 20 : 80;
  
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
            animate={{ height: isAnimating ? (compact ? [15, 25, 15] : [60, 100, 60]) : staticHeight }}
            transition={{ duration: 1.5, repeat: isAnimating ? Infinity : 0, ease: "easeInOut" }}
            className={cn("rounded-full bg-[#FF6B6B] shadow-lg", compact ? "w-[3px]" : "w-[50px]")} 
          />
          <motion.div 
            animate={{ height: isAnimating ? (compact ? [20, 30, 20] : [80, 120, 80]) : staticHeight }}
            transition={{ duration: 1.5, repeat: isAnimating ? Infinity : 0, ease: "easeInOut", delay: 0.2 }}
            className={cn("rounded-full bg-[#2E5BFF] shadow-lg", compact ? "w-[3px]" : "w-[50px]")} 
          />
          <motion.div 
            animate={{ height: isAnimating ? (compact ? [25, 40, 25] : [100, 150, 100]) : staticHeight }}
            transition={{ duration: 1.5, repeat: isAnimating ? Infinity : 0, ease: "easeInOut", delay: 0.4 }}
            className={cn("rounded-full bg-[#FFCC00] shadow-lg", compact ? "w-[3px]" : "w-[50px]")} 
          />
          <motion.div 
            animate={{ height: isAnimating ? (compact ? [20, 30, 20] : [80, 120, 80]) : staticHeight }}
            transition={{ duration: 1.5, repeat: isAnimating ? Infinity : 0, ease: "easeInOut", delay: 0.6 }}
            className={cn("rounded-full bg-[#2E5BFF] shadow-lg", compact ? "w-[3px]" : "w-[50px]")} 
          />
          <motion.div 
            animate={{ height: isAnimating ? (compact ? [15, 25, 15] : [60, 100, 60]) : staticHeight }}
            transition={{ duration: 1.5, repeat: isAnimating ? Infinity : 0, ease: "easeInOut", delay: 0.8 }}
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
      className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 active:scale-90 transition-transform"
    >
      <Menu size={20} className="text-gray-700" />
    </button>
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100">
      <div className="w-7 h-5 overflow-hidden rounded-[4px] relative border border-gray-100 bg-white">
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
    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100">
      <User size={20} className="text-gray-700" />
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, message, icon }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-[32px] p-8 shadow-2xl z-[101] flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
            {icon}
          </div>
          <h3 className="text-xl font-extrabold text-[#1a1a1a] mb-3">{title}</h3>
          <p className="text-gray-500 leading-relaxed mb-8">
            {message}
          </p>
          <a 
            href="https://t.me/milobot_username" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-[#2E5BFF] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            Написать в Telegram
            <ExternalLink size={18} />
          </a>
          <button 
            onClick={onClose}
            className="mt-4 text-gray-400 font-bold py-2 active:opacity-60 transition-opacity"
          >
            Закрыть
          </button>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const OnboardingScreen = ({ onNext }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-white z-[200] flex flex-col items-center p-8 overflow-y-auto"
  >
    <div className="max-w-md w-full flex flex-col items-center pt-16">
      <div className="mb-16">
        <div className="w-24 h-24 bg-white rounded-[32px] shadow-milo flex items-center justify-center border border-gray-50">
          <img src="/milologo.png" alt="Milo" className="w-14 h-14" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold mb-8 text-[#1a1a1a] text-center leading-tight">
        Установите <br/> веб-приложение
      </h1>

      <div className="space-y-8 mb-12 w-full px-2">
        <div className="flex gap-5 items-start">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2E5BFF] flex items-center justify-center flex-shrink-0 font-extrabold text-lg">1</div>
          <p className="text-[17px] font-medium text-gray-600 leading-snug">
            Нажмите на <span className="font-bold text-[#1a1a1a]">...</span>, а потом на иконку <ExternalLink size={20} className="inline mx-1 text-[#2E5BFF]" /> <span className="font-bold text-[#1a1a1a]">Поделиться</span>.
          </p>
        </div>
        <div className="flex gap-5 items-start">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2E5BFF] flex items-center justify-center flex-shrink-0 font-extrabold text-lg">2</div>
          <p className="text-[17px] font-medium text-gray-600 leading-snug">
            В выпадающем меню найдите <br/>
            <span className="font-bold text-[#1a1a1a]">На экран Домой → Добавить</span>.
          </p>
        </div>
        <div className="flex gap-5 items-start">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2E5BFF] flex items-center justify-center flex-shrink-0 font-extrabold text-lg">3</div>
          <p className="text-[17px] font-medium text-gray-500 leading-snug">
            Настройте веб-приложение по инструкции. Оно всегда будет актуально.
          </p>
        </div>
      </div>

      <button 
        onClick={onNext}
        className="w-full bg-[#2E5BFF] text-white py-5 rounded-[28px] font-bold text-xl shadow-xl shadow-blue-100 active:scale-95 transition-all mb-4"
      >
        Пропустить
      </button>
    </div>
  </motion.div>
);

const AuthScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-8"
    >
      <div className="max-w-[320px] w-full flex flex-col">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white rounded-3xl mb-6 shadow-milo flex items-center justify-center border border-gray-50">
            <img src="/milologo.png" alt="Milo" className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Вход</h1>
        </div>

        <div className="space-y-3 mb-8">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Почта"
            className="w-full bg-gray-50 border border-transparent focus:border-gray-200 focus:bg-white rounded-[20px] px-5 py-3.5 text-base outline-none transition-all placeholder:text-gray-400"
          />
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full bg-gray-50 border border-transparent focus:border-gray-200 focus:bg-white rounded-[20px] px-5 py-3.5 text-base outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        <button 
          onClick={() => onLogin(email, password)}
          className="w-full bg-[#2E5BFF] text-white py-4 rounded-[20px] font-bold text-base shadow-lg shadow-blue-50 active:scale-[0.98] transition-all"
        >
          Войти
        </button>
        
        <button className="mt-6 text-sm font-bold text-gray-300 hover:text-gray-400 transition-colors">
          Создать аккаунт
        </button>
      </div>
    </motion.div>
  );
};

const HistoryScreen = ({ isOpen, onClose, history = [], onOpenModal }) => {
  return (
    <motion.div 
      onPanEnd={(event, info) => {
        if (info.offset.x < -50) {
          onClose();
        }
      }}
      className="fixed inset-0 bg-white z-0 flex flex-col w-full h-full overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-8 pt-12 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">milo</h1>
      </div>

      {/* Menu List */}
      <div className="flex flex-col px-8 gap-6 mb-12">
        {[
          { id: 'settings', icon: <Settings size={22} />, label: "Настройки" },
          { id: 'support', icon: <Smile size={22} />, label: "Поддержка" },
          { id: 'ideas', icon: <Lightbulb size={22} />, label: "Идеи" },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={() => {
              if (item.id === 'support') {
                onOpenModal('support');
              } else if (item.id === 'ideas') {
                onOpenModal('ideas');
              }
            }}
            className="flex items-center gap-4 active:opacity-60 transition-opacity"
          >
            <div className="text-[#1a1a1a]">
              {item.icon}
            </div>
            <span className="text-[17px] font-medium text-[#1a1a1a]">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Section */}
      <div className="flex-1 px-8 overflow-y-auto">
        <h2 className="text-[17px] font-bold text-[#1a1a1a] mb-6">Недавнее</h2>
        
        <div className="flex flex-col gap-3">
          {history.length > 0 ? (
            history.map((session, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#F8F9FA] p-4 rounded-[24px] flex flex-col gap-0.5 active:scale-[0.98] transition-transform cursor-pointer shadow-sm border border-gray-50"
              >
                <span className="text-gray-400 text-[12px] font-medium">Сессия</span>
                <h3 className="text-[15px] font-bold text-[#1a1a1a] leading-tight">
                  {session.title}
                </h3>
                <span className="text-gray-400 text-[11px] font-medium mt-0.5">
                  {session.date}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[#1a1a1a] text-[17px] font-medium">
                Упс, вы еще не начали учиться
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button - Bottom Right */}
      <div className="absolute bottom-10 right-8">
        <button 
          onClick={onClose}
          className="bg-[#2E5BFF] text-white h-[56px] px-6 rounded-[28px] shadow-xl shadow-blue-200 flex items-center gap-3 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-[2px]">
            <div className="w-[3px] h-3 bg-white/40 rounded-full" />
            <div className="w-[3px] h-5 bg-white rounded-full" />
            <div className="w-[3px] h-4 bg-white/60 rounded-full" />
          </div>
          <span className="text-[17px] font-bold">Начать</span>
        </button>
      </div>
    </motion.div>
  );
};

const TypingText = ({ text, onComplete, speed = 40 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <div className="flex flex-col gap-1">
      {displayedText.split('\n').map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
};

const ChatDialogue = ({ messages, isLoading, isThinking }) => {
  const scrollRef = useRef(null);
  const messageRefs = useRef([]);

  useEffect(() => {
    if (scrollRef.current && messages.length >= 2) {
      const targetIndex = messages.length - 2;
      const targetElement = messageRefs.current[targetIndex];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isThinking]);

  return (
    <motion.div 
      ref={scrollRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 px-6 pt-4 pb-[80vh] overflow-y-auto w-full h-full scroll-smooth relative"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 150px, black 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 150px, black 100%)'
      }}
    >
      {messages.map((msg, index) => (
        <div 
          key={index} 
          ref={el => messageRefs.current[index] = el}
          className={cn("flex flex-col gap-1 transition-opacity duration-500", 
            index < messages.length - 2 ? "opacity-30" : "opacity-100",
            msg.role === 'user' ? "items-end" : "items-start"
          )}
        >
          <div className={cn(
            "px-5 py-3 rounded-[24px] text-lg max-w-[85%]",
            msg.role === 'user' 
              ? "bg-white shadow-milo text-[#1a1a1a] font-medium border border-gray-50" 
              : "text-[#333] leading-relaxed"
          )}>
            {msg.role === 'assistant' && index === messages.length - 1 && msg.isNew ? (
              <TypingText text={msg.content} speed={msg.typingSpeed || 50} />
            ) : (
              msg.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))
            )}
          </div>
        </div>
      ))}
      
      {(isLoading || isThinking) && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start gap-3"
        >
          <div className="flex gap-1.5 px-5 py-3.5 bg-gray-100 rounded-[24px] rounded-tl-none shadow-sm">
            <motion.div 
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4] 
              }} 
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} 
              className="w-2 h-2 bg-[#2E5BFF] rounded-full" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4] 
              }} 
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.2 }} 
              className="w-2 h-2 bg-[#2E5BFF] rounded-full" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4] 
              }} 
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.4 }} 
              className="w-2 h-2 bg-[#2E5BFF] rounded-full" 
            />
          </div>
          <motion.span 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm font-medium text-gray-400 self-center"
          >
            {isThinking ? "Milo думает..." : "Milo говорит..."}
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('auth'); // 'onboarding', 'auth', 'main'

  useEffect(() => {
    // Проверка, запущено ли приложение как PWA (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    if (!isStandalone) {
      setCurrentScreen('onboarding');
    }
  }, []);

  const [isStarted, setIsStarted] = useState(false);
  const [isWaveVisible, setIsWaveVisible] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Привет, Азат! Я Milo AI, помогу тебе выучить английский для путешествий.\nНачнём с аэропорта — базовые фразы для первых ситуаций за границей.\nСкажи, как по-русски ты спросишь, где аэропорт?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'support', 'ideas', or null
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isCancellingRef = useRef(false);
  const audioRef = useRef(new Audio());

  // Эффект для отслеживания окончания проигрывания
  useEffect(() => {
    const audio = audioRef.current;
    const handlePlay = () => setIsPlaying(true);
    const handleEnd = () => setIsPlaying(false);
    const handleError = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('ended', handleEnd);
    audio.addEventListener('pause', handleEnd);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('ended', handleEnd);
      audio.removeEventListener('pause', handleEnd);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const playWelcomeSpeech = async () => {
    try {
      const welcomeContent = messages[0].content;
      const audioUrl = await generateSpeech(welcomeContent);
      
      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.crossOrigin = "anonymous";
        
        // Ждем загрузки метаданных для определения длительности
        await new Promise((resolve) => {
          const onLoaded = () => {
            audioRef.current.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };
          audioRef.current.addEventListener('loadedmetadata', onLoaded);
          setTimeout(resolve, 2000);
        });

        const duration = audioRef.current.duration || 5;
        const typingSpeed = (duration * 1000) / welcomeContent.length;

        // Обновляем первое сообщение, добавляя флаг анимации и скорость
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[0] = { ...newMsgs[0], isNew: true, typingSpeed };
          return newMsgs;
        });

        audioRef.current.play().catch(e => console.log("Welcome play blocked", e));
      }
    } catch (e) {
      console.error("Failed to play welcome message", e);
    }
  };

  // Озвучка самого первого сообщения при старте удалена по запросу пользователя
  /* 
  useEffect(() => {
    if (isStarted && !isHistoryOpen && messages.length === 1) {
      // playWelcomeSpeech();
    }
  }, [isStarted, isHistoryOpen]);
  */

  // Функция для "разблокировки" аудио (priming) при взаимодействии пользователя
  const primeAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        console.log("Audio primed successfully");
      }).catch(err => {
        console.log("Audio priming failed (expected if no interaction yet):", err);
      });
    }
  };

  const history = [
    { title: "Первый разговор в аэропорту", date: "18.04.2026 03:57" }
  ];

  const handleStartChat = async () => {
    console.log("handleStartChat triggered");
    
    // Пытаемся "разблокировать" аудио при первом же клике "Начать"
    primeAudio();

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

  const handleSendMessage = async (text, isVoiceResponse = false) => {
    const message = text || inputText;
    if (!message.trim() || isLoading || isThinking) return;

    // Пытаемся разблокировать аудио только если ожидаем голосовой ответ
    if (isVoiceResponse) {
      primeAudio();
    }

    const newUserMessage = { role: 'user', content: message };
    const updatedMessages = [...messages, newUserMessage];
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsThinking(true);

    try {
      // Добавляем пометку о режиме для ИИ (в скрытом виде или как часть последнего сообщения)
      const messagesForGPT = updatedMessages.map((msg, idx) => {
        if (idx === updatedMessages.length - 1 && !isVoiceResponse) {
          return { ...msg, content: `[TEXT MODE] ${msg.content}` };
        }
        return msg;
      });

      const gptResponse = await sendMessageToGPT(messagesForGPT);
      
      let audioUrl = null;
      if (isVoiceResponse) {
        // Генерируем голос только для голосового режима
        audioUrl = await generateSpeech(gptResponse.content);
      }
      
      setIsThinking(false);
      setIsLoading(true);

      if (isVoiceResponse && audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.crossOrigin = "anonymous";
        
        // Ждем загрузки метаданных, чтобы узнать длительность
        await new Promise((resolve) => {
          const onLoaded = () => {
            audioRef.current.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };
          audioRef.current.addEventListener('loadedmetadata', onLoaded);
          // Таймаут на случай если не загрузится
          setTimeout(resolve, 2000);
        });

        const duration = audioRef.current.duration || 3;
        const typingSpeed = (duration * 1000) / gptResponse.content.length;

        // Воспроизводим звук
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Auto-play blocked, retrying logic...", error);
            const unlockAudio = () => {
              audioRef.current.play();
              window.removeEventListener('click', unlockAudio);
              window.removeEventListener('touchstart', unlockAudio);
            };
            window.addEventListener('click', unlockAudio);
            window.addEventListener('touchstart', unlockAudio);
          });
        }

        // Добавляем сообщение с рассчитанной скоростью печати
        setMessages(prev => [...prev, { ...gptResponse, isNew: true, typingSpeed }]);
        setIsLoading(false);
      } else {
        // Если это текстовый чат или аудио не удалось получить, просто выводим текст со стандартной скоростью
        setMessages(prev => [...prev, { ...gptResponse, isNew: true, typingSpeed: 30 }]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error in message flow:", error);
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const onDragEnd = (event, info) => {
    // Свайп слева направо (открытие)
    if (info.offset.x > 50 && !isHistoryOpen) {
      setIsHistoryOpen(true);
    }
    // Свайп справа налево (закрытие)
    if (info.offset.x < -50 && isHistoryOpen) {
      setIsHistoryOpen(false);
    }
  };

  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
  };

  const handleRecordStart = async () => {
    // Важно: вызываем primeAudio сразу при нажатии, 
    // чтобы "закрепить" за этим объектом разрешение на воспроизведение
    primeAudio();

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
        // Если запись была отменена крестиком - ничего не отправляем
        if (isCancellingRef.current) {
          isCancellingRef.current = false;
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const text = await transcribeAudio(audioBlob);
        if (text) {
          handleSendMessage(text, true);
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
      // Гарантируем, что панель остается открытой для приема звука
      setIsWaveVisible(true);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col items-center font-sans overflow-hidden fixed inset-0">
      <AnimatePresence mode="wait">
        {currentScreen === 'onboarding' && (
          <OnboardingScreen key="onboarding" onNext={() => setCurrentScreen('auth')} />
        )}
        
        {currentScreen === 'auth' && (
          <AuthScreen key="auth" onLogin={(email, password) => {
            console.log("Logged in with:", email);
            setCurrentScreen('main');
          }} />
        )}

        {currentScreen === 'main' && (
          <div className="w-full h-full flex flex-col items-center bg-white relative overflow-hidden">
            <HistoryScreen 
              isOpen={isHistoryOpen} 
              onClose={() => {
                setIsHistoryOpen(false);
              }}
              history={history}
              onOpenModal={(type) => setActiveModal(type)}
            />

            <Modal 
              isOpen={activeModal === 'support'} 
              onClose={() => setActiveModal(null)}
              title="Поддержка"
              message="Здравствуйте! Спасибо, что пользуетесь нашим приложением. Если вам нужна помощь или возникла ошибка, о которой нам следует знать, пожалуйста, напишите нам через ТГ бота."
              icon={<Smile size={32} className="text-purple-600" />}
            />

            <Modal 
              isOpen={activeModal === 'ideas'} 
              onClose={() => setActiveModal(null)}
              title="Идеи и предложения"
              message="Мы всегда рады новым идеям! Если у вас есть предложения по улучшению milo или вы хотите увидеть новые функции, пожалуйста, поделитесь ими с нами через ТГ бота."
              icon={<Lightbulb size={32} className="text-amber-600" />}
            />

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
              className="h-full w-full bg-white flex flex-col items-center relative z-10 overflow-hidden shadow-2xl touch-none"
            >
              <Header onOpenHistory={handleOpenHistory} />
              
              <main className="flex-1 w-full max-w-md flex flex-col items-center relative overflow-hidden h-full bg-white">
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
                      
                      <WaveBars isVisible={true} isAnimating={isPlaying} />
                      
                      <button 
                        onClick={handleStartChat}
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
                      <ChatDialogue messages={messages} isLoading={isLoading} isThinking={isThinking} />
                      
                      {/* FIXED WAVE PANEL - Out of scroll flow */}
                      <div className="fixed bottom-24 left-0 right-0 z-20 pointer-events-none flex flex-col items-center max-w-md mx-auto h-64 justify-center">
                        <AnimatePresence>
                          {(isWaveVisible || isRecording) && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-x-0 -bottom-24 h-[450px] bg-gradient-to-t from-white via-white to-transparent pointer-events-none" 
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
                              <WaveBars isVisible={isWaveVisible} isAnimating={isPlaying} />
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
                    // Разблокируем аудио при любом клике на кнопки управления
                    primeAudio();
                    
                    if (isWaveVisible || isRecording) {
                      if (isRecording) {
                        isCancellingRef.current = true;
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                          mediaRecorderRef.current.stop();
                        }
                      }
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

              {/* Overlay to close history when clicking on main screen area */}
              {isHistoryOpen && (
                <div 
                  className="absolute inset-0 z-[60] cursor-pointer" 
                  onClick={() => {
                    setIsHistoryOpen(false);
                  }}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
