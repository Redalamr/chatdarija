/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Character } from './types';
import { CharacterCard } from './components/CharacterCard';
import { ChatWindow } from './components/ChatWindow';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const QUESTIONS = [
  {
    id: 'age',
    question: 'Ch7al f 3mrek? (How old are you?)',
    type: 'number',
    placeholder: 'E.g., 25'
  },
  {
    id: 'gender',
    question: 'Chnou l-jins dyalek? (What is your gender?)',
    type: 'select',
    options: ['Dri (Male)', 'Bent (Female)', 'Other']
  },
  {
    id: 'vibes',
    question: 'Chnou l-vibes li kat-9leb 3lihom? (What vibes are you looking for?)',
    type: 'multi-select',
    options: ['Dda7k (Funny)', 'Ma39oul (Serious)', 'Ghamid (Mysterious)', 'Sadi9 (Friendly)', 'Romansi (Romantic)']
  },
  {
    id: 'city',
    question: 'Ina mdina f l-Maghrib kat-3jbek? (Which Moroccan city do you like?)',
    type: 'text',
    placeholder: 'E.g., Casablanca, Marrakech, Tangier...'
  },
  {
    id: 'interests',
    question: 'Chnou l-hawayat dyalek? (What are your interests?)',
    type: 'text',
    placeholder: 'E.g., Football, Music, Coding, Cooking...'
  }
];

function Onboarding({ onComplete }: { onComplete: (answers: any) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [inputValue, setInputValue] = useState('');

  const handleNext = () => {
    const question = QUESTIONS[currentStep];
    const newAnswers = { ...answers, [question.id]: inputValue };
    setAnswers(newAnswers);
    setInputValue('');

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const question = QUESTIONS[currentStep];

  const toggleMultiSelect = (opt: string) => {
    const currentSelections = inputValue ? inputValue.split(', ') : [];
    if (currentSelections.includes(opt)) {
      setInputValue(currentSelections.filter(s => s !== opt).join(', '));
    } else {
      setInputValue([...currentSelections, opt].join(', '));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-md w-full bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl"
      >
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-500 text-sm font-mono">Step {currentStep + 1} of {QUESTIONS.length}</span>
            <div className="flex gap-1">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`h-1 w-4 rounded-full ${i <= currentStep ? 'bg-blue-500' : 'bg-zinc-800'}`} />
              ))}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">{question.question}</h2>
          {question.type === 'multi-select' && (
            <p className="text-zinc-500 text-sm mt-2">Khtar li bghiti (Select all that apply)</p>
          )}
        </div>

        <div className="space-y-4">
          {question.type === 'select' ? (
            <div className="grid grid-cols-1 gap-2">
              {question.options?.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setInputValue(opt);
                    // Auto-advance for select
                    const newAnswers = { ...answers, [question.id]: opt };
                    setAnswers(newAnswers);
                    if (currentStep < QUESTIONS.length - 1) {
                      setCurrentStep(currentStep + 1);
                      setInputValue('');
                    } else {
                      onComplete(newAnswers);
                    }
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all border ${
                    inputValue === opt ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : question.type === 'multi-select' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {question.options?.map((opt) => {
                  const isSelected = inputValue.split(', ').includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleMultiSelect(opt)}
                      className={`w-full p-4 rounded-xl text-left transition-all border ${
                        isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={!inputValue}
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-4"
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type={question.type}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && inputValue && handleNext()}
                placeholder={question.placeholder}
                autoFocus
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <button
                disabled={!inputValue}
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function MainApp() {
  const [status, setStatus] = useState<'quiz' | 'loading' | 'grid'>('quiz');
  const [characters, setCharacters] = useState<Character[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we already have characters in localStorage
    const savedCharacters = localStorage.getItem('darija_characters');
    if (savedCharacters) {
      try {
        const data = JSON.parse(savedCharacters);
        if (Array.isArray(data) && data.length > 0) {
          setCharacters(data);
          setStatus('grid');
        }
      } catch (e) {
        console.error('Failed to parse saved characters', e);
      }
    }
  }, []);

  const handleOnboardingComplete = async (answers: any) => {
    setStatus('loading');
    try {
      const prompt = `
        Based on these user preferences: ${JSON.stringify(answers)}, 
        generate 6 unique Moroccan characters for a chat application.
        
        Each character must have:
        - id: unique string
        - name: string
        - avatar_url: use https://picsum.photos/seed/{id}/200/200
        - short_description: string in Darija (Latin script)
        - system_prompt: detailed personality and backstory in English, instructing them to speak in Latin-script Darija.
        
        The characters should be "linked" to the user's preferences but diverse.
        Ensure all Darija is in Latin script (Arabizi).
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                avatar_url: { type: Type.STRING },
                short_description: { type: Type.STRING },
                system_prompt: { type: Type.STRING },
              },
              required: ["id", "name", "avatar_url", "short_description", "system_prompt"],
            },
          },
        },
      });

      const generatedCharacters = JSON.parse(result.text || "[]");
      
      if (Array.isArray(generatedCharacters)) {
        setCharacters(generatedCharacters);
        // Save to localStorage
        localStorage.setItem('darija_characters', JSON.stringify(generatedCharacters));
        setStatus('grid');
      } else {
        throw new Error('Invalid generation result');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setStatus('quiz');
    }
  };

  const resetApp = () => {
    localStorage.removeItem('darija_characters');
    setStatus('quiz');
    setCharacters([]);
  };

  if (status === 'quiz') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <Sparkles size={64} className="text-blue-500" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">Tsena chouia...</h2>
        <p className="text-zinc-400 max-w-md">
          7na kan-sawbo lik 6 dyal l-characters li ghadi i-jiw m3ak. Hadchi ghadi i-khoud chouia dyal l-wa9t.
        </p>
        <div className="mt-8 flex items-center gap-2 text-blue-400">
          <Loader2 className="animate-spin" />
          <span>Generating your AI friends...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            DARIJACHAT AI
          </h1>
          <p className="text-zinc-400 text-lg">
            Hder m3a l-bots dyalek li t-sawbo 3la 7sabek.
          </p>
        </div>
        <button
          onClick={resetApp}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full text-sm font-medium transition-all"
        >
          Re-generate Characters
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.isArray(characters) && characters.map((char) => (
          <CharacterCard key={char.id} character={char} />
        ))}
      </div>

      <footer className="mt-20 text-center text-zinc-600 text-sm">
        <p>© 2026 DarijaChat AI - Personalized for you 🇲🇦</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans">
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/chat/:id" element={<ChatWindow />} />
        </Routes>
      </div>
    </Router>
  );
}

