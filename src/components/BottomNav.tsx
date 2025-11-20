import { Home, BarChart3, CircleDot, TrendingUp, User } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onPageChange: (page: 'main' | 'profile' | 'upgrade' | 'crash') => void;
}

export default function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800 px-4 py-3 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-around">
        <button
          onClick={() => onPageChange('main')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentPage === 'main' ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">Cases</span>
        </button>
        <button
          onClick={() => onPageChange('crash')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentPage === 'crash' ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart3 size={24} />
          <span className="text-xs font-medium">Crash</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors opacity-50 cursor-not-allowed">
          <div className="bg-gray-700 rounded-full p-3">
            <CircleDot size={24} className="text-gray-500" />
          </div>
          <span className="text-xs font-medium">Coming</span>
        </button>
        <button
          onClick={() => onPageChange('upgrade')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentPage === 'upgrade' ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp size={24} />
          <span className="text-xs font-medium">Upgrade</span>
        </button>
        <button
          onClick={() => onPageChange('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentPage === 'profile' ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          <User size={24} />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}
