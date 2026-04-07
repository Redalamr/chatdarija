import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Character, Message } from '../types';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const ChatWindow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/characters')
      .then((res) => res.json())
      .then((data: Character[]) => {
        const char = data.find((c) => c.id === id);
        if (char) {
          setCharacter(char);
          setMessages([
            {
              role: 'assistant',
              content: `Salam! Labass 3lik? Ana ${char.name}.`,
            },
          ]);
        } else {
          navigate('/');
        }
      });
  }, [id, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !character) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = `
        You are ${character.name}. 
        Your personality: ${character.system_prompt}
        
        STRICT RULES:
        1. ALWAYS speak in Moroccan Darija using the Latin alphabet and numbers (Arabizi/Franco-Arabic).
        2. NEVER use Arabic script.
        3. Use common Moroccan slang (e.g., "be7al", "khoya", "daba", "mcha", "fin", "labass").
        4. Stay in character at all times.
        5. Keep responses concise and natural for a chat.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: "user", parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }] },
          ...newMessages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }))
        ]
      });

      const text = response.text;
      if (text) {
        setMessages((prev) => [...prev, { role: 'assistant', content: text }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sme7 lia, وقع مشكل (wa9e3 mouchkil). 3awed jereb mn b3d." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!character) return null;

  return (
    <div className="flex flex-col h-screen bg-black text-zinc-100">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors mr-2"
        >
          <ArrowLeft size={24} />
        </button>
        <img
          src={character.avatar_url}
          alt={character.name}
          className="w-10 h-10 rounded-full object-cover mr-3"
          referrerPolicy="no-referrer"
        />
        <div>
          <h2 className="font-bold text-lg">{character.name}</h2>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-zinc-800 text-zinc-100 rounded-tl-none'
                }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-sm text-zinc-400">Katyekteb...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <footer className="p-4 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Kteb chi 7aja b Darija..."
            className="flex-1 bg-zinc-800 border-none rounded-full px-6 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-zinc-100 placeholder-zinc-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 p-3 rounded-full transition-all transform active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
};
