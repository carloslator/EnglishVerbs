import React from 'react';
import { Category } from '../types';
import { Book, Heart, MessageCircle, ShoppingCart, Smile, Zap } from 'lucide-react';

interface VerbCardProps {
  category: Category;
  progress: number; // 0 to 100
  locked: boolean;
  onClick: () => void;
}

const getIcon = (cat: Category) => {
  switch (cat) {
    case Category.GENERAL: return <Zap size={32} strokeWidth={2.5} />;
    case Category.SPEAKING: return <MessageCircle size={32} strokeWidth={2.5} />;
    case Category.EMOTIONS: return <Smile size={32} strokeWidth={2.5} />;
    case Category.MOVEMENT: return <Zap size={32} strokeWidth={2.5} />; 
    case Category.DAILY_LIFE: return <Heart size={32} strokeWidth={2.5} />;
    case Category.SHOPPING: return <ShoppingCart size={32} strokeWidth={2.5} />;
    default: return <Book size={32} strokeWidth={2.5} />;
  }
};

const getColor = (cat: Category) => {
  // Palette: Cool Blues, Purples, Cyans, Magentas
  switch (cat) {
    case Category.GENERAL: return "bg-cyan-500";
    case Category.SPEAKING: return "bg-blue-500";
    case Category.EMOTIONS: return "bg-purple-500";
    case Category.MOVEMENT: return "bg-indigo-500";
    case Category.DAILY_LIFE: return "bg-pink-500";
    case Category.SHOPPING: return "bg-fuchsia-500";
    default: return "bg-slate-500";
  }
};

export const VerbCard: React.FC<VerbCardProps> = ({ category, progress, locked, onClick }) => {
  const cardColor = getColor(category);

  return (
    <div 
      onClick={!locked ? onClick : undefined}
      className={`relative w-full max-w-sm mx-auto mb-6 transition-transform ${locked ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1 active:translate-y-0'}`}
    >
      {/* Retro Card Container */}
      <div className="bg-slate-800 border-4 border-black retro-shadow p-4 flex items-center space-x-4">
        
        {/* Icon Box */}
        <div className={`w-16 h-16 shrink-0 flex items-center justify-center text-black border-2 border-black ${cardColor}`}>
          {getIcon(category)}
        </div>

        {/* Text & Progress */}
        <div className="flex-1">
          <div className="font-retro text-xs md:text-sm text-cyan-300 uppercase mb-2 leading-tight">
            {category}
          </div>
          
          {/* Retro Progress Bar */}
          {!locked && (
             <div className="w-full h-4 border-2 border-black bg-slate-900 relative">
               <div 
                  className={`h-full ${cardColor}`} 
                  style={{ width: `${progress}%` }}
               ></div>
               {/* Scanlines overlay effect */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
             </div>
          )}
        </div>

        {/* Status Indicator */}
        {progress >= 100 && (
          <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-[10px] font-retro px-2 py-1 border-2 border-black animate-pulse shadow-sm">
            MAX
          </div>
        )}
      </div>
    </div>
  );
};