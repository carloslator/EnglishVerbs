import React, { useState, useEffect } from 'react';
import { ALL_VERBS, CATEGORIES_LIST } from './constants';
import { Category, QuizQuestion, UserState, Verb, QuestionType } from './types';
import { generateContextQuestion } from './services/geminiService';
import { Button } from './components/Button';
import { VerbCard } from './components/VerbCard';
import { Volume2, Heart, X, Check, Star, Zap, Terminal } from 'lucide-react';
import { playRetroSound } from './utils/audio';

/* --- HELPER FUNCTIONS --- */

const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
};

const getRandomDistractors = (correctVerb: Verb, allVerbs: Verb[], count: number, lang: 'english' | 'spanish'): string[] => {
  const others = allVerbs.filter(v => v.id !== correctVerb.id);
  const shuffled = others.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(v => v[lang]);
};

/* --- MAIN COMPONENT --- */

export default function App() {
  const [screen, setScreen] = useState<'DASHBOARD' | 'GAME' | 'RESULT'>('DASHBOARD');
  
  const [userState, setUserState] = useState<UserState>({
    xp: 0,
    level: 1,
    hearts: 3, // Reduced hearts for "Hard Mode" retro feel
    completedVerbs: [],
    streak: 1
  });

  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);

  useEffect(() => {
    // Initial Load
  }, []);

  const startLevel = async (category: Category) => {
    playRetroSound('start');
    const categoryVerbs = ALL_VERBS.filter(v => v.category === category);
    const sessionVerbs = categoryVerbs.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    const questions: QuizQuestion[] = [];

    for (const verb of sessionVerbs) {
      const spanishDistractors = getRandomDistractors(verb, ALL_VERBS, 3, 'spanish');
      questions.push({
        type: QuestionType.TRANSLATE_TO_SPANISH,
        verb,
        questionText: `TRANSLATE: "${verb.english}"`,
        options: [...spanishDistractors, verb.spanish].sort(() => 0.5 - Math.random()),
        correctAnswer: verb.spanish
      });

      const englishDistractors = getRandomDistractors(verb, ALL_VERBS, 3, 'english');
      questions.push({
        type: QuestionType.TRANSLATE_TO_ENGLISH,
        verb,
        questionText: `ENGLISH FOR: "${verb.spanish}"`,
        options: [...englishDistractors, verb.english].sort(() => 0.5 - Math.random()),
        correctAnswer: verb.english
      });

      if (Math.random() > 0.7) { 
        try {
          const aiQ = await generateContextQuestion(verb, ALL_VERBS);
          if (aiQ) questions.push(aiQ);
        } catch (e) {}
      }
    }

    setSessionQuestions(questions.sort(() => 0.5 - Math.random()));
    setCurrentQuestionIndex(0);
    setSessionXP(0);
    setCurrentCategory(category);
    setUserState(prev => ({ ...prev, hearts: 3 }));
    setScreen('GAME');
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswerChecked) return;
    playRetroSound('click');
    setSelectedOption(option);
    
    const currentQ = sessionQuestions[currentQuestionIndex];
    if (currentQ.type === QuestionType.TRANSLATE_TO_ENGLISH || currentQ.type === QuestionType.FILL_BLANK) {
      if (option === currentQ.correctAnswer || currentQ.options.includes(option)) {
         speak(option);
      }
    }
  };

  const checkAnswer = () => {
    if (!selectedOption) return;
    
    const currentQ = sessionQuestions[currentQuestionIndex];
    const correct = selectedOption === currentQ.correctAnswer;
    
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      playRetroSound('correct');
      setSessionXP(prev => prev + 10);
    } else {
      playRetroSound('wrong');
      setUserState(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - 1) }));
    }
  };

  const nextQuestion = () => {
    if (userState.hearts === 0) {
      setScreen('RESULT');
      return;
    }

    if (currentQuestionIndex < sessionQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setIsCorrect(false);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    playRetroSound('correct'); // Session complete sound
    setUserState(prev => ({
      ...prev,
      xp: prev.xp + sessionXP,
    }));
    setScreen('RESULT');
  };

  /* --- RENDERERS --- */

  const renderDashboard = () => (
    <div className="max-w-lg mx-auto min-h-screen bg-[#9D7BC3] flex flex-col border-x-4 border-black relative">
      {/* Retro Header */}
      <div className="bg-indigo-900 p-4 border-b-4 border-black flex justify-between items-center sticky top-0 z-20 shadow-lg">
        <div className="flex items-center space-x-3 bg-black/40 px-3 py-1 border border-indigo-700">
           <Star size={16} className="text-yellow-400 fill-current" />
           <span className="font-retro text-yellow-400 text-xs">{userState.xp} XP</span>
        </div>
        
        {/* Title */}
        <div className="flex flex-col items-center">
            <span className="font-retro text-cyan-400 text-xs md:text-sm tracking-widest text-shadow-neon">ESSENTIAL</span>
            <span className="font-retro text-white text-lg md:text-xl tracking-tighter text-shadow-neon">VERBS</span>
        </div>

        <div className="flex items-center space-x-2 bg-black/40 px-3 py-1 border border-red-900">
           <Heart size={16} className="text-red-500 fill-current animate-pulse" />
           <span className="font-retro text-red-500 text-xs">{userState.hearts}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center mb-10 mt-4">
          <div className="inline-block bg-slate-800 border-2 border-black p-4 retro-shadow">
            <h1 className="text-2xl font-retro text-cyan-400 mb-2">SELECT ZONE</h1>
            <p className="font-console text-xl text-slate-300">Level: Beginner</p>
          </div>
        </div>

        {CATEGORIES_LIST.map((cat, index) => (
          <VerbCard 
            key={cat} 
            category={cat} 
            progress={index === 0 ? 50 : 0} 
            locked={false} 
            onClick={() => startLevel(cat)}
          />
        ))}
      </div>
    </div>
  );

  const renderGame = () => {
    const currentQ = sessionQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / sessionQuestions.length) * 100;

    return (
      <div className="max-w-lg mx-auto min-h-screen bg-[#9D7BC3] border-x-4 border-black flex flex-col relative font-console">
        {/* Game UI Header */}
        <div className="p-4 bg-indigo-900 border-b-4 border-black">
          <div className="flex justify-between items-center mb-4">
             <button onClick={() => { playRetroSound('click'); setScreen('DASHBOARD'); }} className="text-indigo-200 hover:text-white font-retro text-xs uppercase hover:underline">
               &lt; EXIT
             </button>
             <div className="flex items-center space-x-2">
                 {[...Array(3)].map((_, i) => (
                   <Heart 
                     key={i} 
                     size={20} 
                     className={i < userState.hearts ? "text-red-500 fill-current" : "text-indigo-950"} 
                   />
                 ))}
             </div>
          </div>
          
          {/* Retro Progress Bar */}
          <div className="w-full h-6 border-2 border-black bg-slate-900 relative">
            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-white mix-blend-difference font-retro">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 p-6 flex flex-col justify-center relative">
          
          {/* Question Box (Dark Container for readability) */}
          <div className="mb-8 border-4 border-black bg-slate-800 p-6 retro-shadow relative">
            <div className="absolute -top-3 -left-3 bg-cyan-500 border-2 border-black px-2 py-1 font-retro text-[10px] text-black">QUERY</div>
            <h2 className="text-3xl md:text-4xl text-white mb-2 leading-none">
              {currentQ.questionText}
            </h2>
          </div>

          {(currentQ.type === QuestionType.TRANSLATE_TO_SPANISH || currentQ.type === QuestionType.LISTENING) && (
             <div 
               className="self-start mb-8 cursor-pointer group"
               onClick={() => { playRetroSound('click'); speak(currentQ.verb.english); }}
             >
               <div className="w-16 h-16 bg-indigo-600 border-4 border-black retro-shadow flex items-center justify-center group-hover:translate-y-1 group-hover:shadow-none transition-all">
                  <Volume2 size={32} className="text-white" />
               </div>
             </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-4">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentQ.correctAnswer;
              
              let btnStyle = "bg-slate-800 border-black text-slate-300 hover:bg-slate-700 hover:text-cyan-400";
              
              if (isSelected && !isAnswerChecked) {
                btnStyle = "bg-indigo-600 border-black text-white retro-shadow-sm";
              }
              
              if (isAnswerChecked) {
                if (isCorrectOpt) btnStyle = "bg-green-600 border-black text-white";
                else if (isSelected && !isCorrectOpt) btnStyle = "bg-red-600 border-black text-white";
                else btnStyle = "opacity-40 bg-slate-800 border-black";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(opt)}
                  disabled={isAnswerChecked}
                  className={`p-4 border-4 text-2xl text-left transition-all font-console relative ${btnStyle}`}
                >
                  <span className="mr-4 text-sm font-retro opacity-50">{idx + 1}.</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-6 border-t-4 border-black ${isAnswerChecked ? (isCorrect ? 'bg-green-900/80' : 'bg-red-900/80') : 'bg-indigo-900/20'}`}>
          {isAnswerChecked && (
             <div className="mb-6 flex items-start space-x-4 animate-in fade-in slide-in-from-bottom-4">
               <div className={`p-2 border-2 border-black ${isCorrect ? 'bg-green-500' : 'bg-red-500'} retro-shadow-sm`}>
                 {isCorrect ? <Check className="text-black" /> : <X className="text-white" />}
               </div>
               {/* Result Text Box */}
               <div className="bg-slate-800 border-2 border-black p-3 flex-1">
                 <h3 className={`font-retro text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                   {isCorrect ? 'EXCELLENT!' : 'SYSTEM ERROR'}
                 </h3>
                 {!isCorrect && <p className="text-red-300 text-xl mt-1">Correct: <span className="text-white">{currentQ.correctAnswer}</span></p>}
                 {currentQ.explanation && (
                    <div className="mt-2 text-lg text-slate-300 font-console border-t border-slate-600 pt-2">
                        <Terminal size={14} className="inline mr-2" />
                        {currentQ.explanation}
                    </div>
                 )}
               </div>
             </div>
          )}
          
          <Button 
            fullWidth 
            variant={isAnswerChecked ? (isCorrect ? 'primary' : 'danger') : 'secondary'}
            disabled={!selectedOption && !isAnswerChecked}
            onClick={isAnswerChecked ? nextQuestion : checkAnswer}
            className="font-retro text-sm"
          >
            {isAnswerChecked ? 'NEXT LEVEL >' : 'EXECUTE'}
          </Button>
        </div>
      </div>
    );
  };

  const renderResult = () => (
    <div className="max-w-lg mx-auto min-h-screen bg-[#9D7BC3] flex flex-col items-center justify-center p-8 text-center border-x-4 border-black relative overflow-hidden">
       {/* Background Grid Animation */}
       <div className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{ 
                backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }}>
       </div>

       <div className="relative z-10 mb-8 bg-slate-800 border-4 border-black p-6 retro-shadow">
           <h2 className="text-4xl md:text-5xl font-retro text-cyan-400 text-shadow-neon mb-4">
             MISSION<br/>REPORT
           </h2>
       </div>
       
       <div className="flex space-x-6 w-full justify-center mb-12">
         <div className="bg-slate-800 p-4 border-4 border-black retro-shadow w-36">
           <div className="text-yellow-500 font-retro text-[10px] mb-2">SCORE</div>
           <div className="text-yellow-400 font-console text-4xl">+{sessionXP}</div>
         </div>
         <div className="bg-slate-800 p-4 border-4 border-black retro-shadow w-36">
           <div className="text-red-500 font-retro text-[10px] mb-2">LIVES</div>
           <div className="text-red-400 font-console text-4xl">{userState.hearts}</div>
         </div>
       </div>

       <div className="w-full max-w-xs z-10">
         <Button fullWidth variant="primary" onClick={() => { playRetroSound('click'); setScreen('DASHBOARD'); }} className="font-retro text-sm">
           RETURN TO BASE
         </Button>
       </div>
    </div>
  );

  return (
    <div className="bg-[#2a2a2a] min-h-screen">
      {screen === 'DASHBOARD' && renderDashboard()}
      {screen === 'GAME' && renderGame()}
      {screen === 'RESULT' && renderResult()}
    </div>
  );
}