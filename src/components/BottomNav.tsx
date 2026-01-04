import { Home, Trophy, CircleDot, TrendingUp, User } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onPageChange: (page: 'main' | 'profile' | 'upgrade' | 'rating') => void;
}

export default function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800/80 px-2 md:px-4 py-2 md:py-3 z-40 shadow-2xl shadow-black/50">
      <div className="max-w-7xl mx-auto flex items-center justify-around">
        <button
          onClick={() => onPageChange('main')}
          className={`flex flex-col items-center gap-0.5 md:gap-1 transition-all active:scale-95 touch-manipulation min-w-[60px] ${
            currentPage === 'main' ? 'text-blue-500 scale-105' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 md:p-2 rounded-xl transition-all ${currentPage === 'main' ? 'bg-blue-500/20' : ''}`}>
            <Home size={20} className="md:w-6 md:h-6" />
          </div>
          <span className="text-[10px] md:text-xs font-medium">Cases</span>
        </button>
        <button
          onClick={() => onPageChange('rating')}
          className={`flex flex-col items-center gap-0.5 md:gap-1 transition-all active:scale-95 touch-manipulation min-w-[60px] ${
            currentPage === 'rating' ? 'text-blue-500 scale-105' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 md:p-2 rounded-xl transition-all ${currentPage === 'rating' ? 'bg-blue-500/20' : ''}`}>
            <Trophy size={20} className="md:w-6 md:h-6" />
          </div>
          <span className="text-[10px] md:text-xs font-medium">Rating</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 md:gap-1 text-gray-400 transition-colors opacity-50 cursor-not-allowed min-w-[60px]">
          <div className="bg-gray-700/50 rounded-xl p-2 md:p-3">
            <CircleDot size={20} className="text-gray-500 md:w-6 md:h-6" />
          </div>
          <span className="text-[10px] md:text-xs font-medium">Soon</span>
        </button>
        <button
          onClick={() => onPageChange('upgrade')}
          className={`flex flex-col items-center gap-0.5 md:gap-1 transition-all active:scale-95 touch-manipulation min-w-[60px] ${
            currentPage === 'upgrade' ? 'text-blue-500 scale-105' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 md:p-2 rounded-xl transition-all ${currentPage === 'upgrade' ? 'bg-blue-500/20' : ''}`}>
            <TrendingUp size={20} className="md:w-6 md:h-6" />
          </div>
          <span className="text-[10px] md:text-xs font-medium">Upgrade</span>
        </button>
        <button
          onClick={() => onPageChange('profile')}
          className={`flex flex-col items-center gap-0.5 md:gap-1 transition-all active:scale-95 touch-manipulation min-w-[60px] ${
            currentPage === 'profile' ? 'text-blue-500 scale-105' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 md:p-2 rounded-xl transition-all ${currentPage === 'profile' ? 'bg-blue-500/20' : ''}`}>
            <User size={20} className="md:w-6 md:h-6" />
          </div>
          <span className="text-[10px] md:text-xs font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}
