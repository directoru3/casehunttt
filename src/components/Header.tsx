import { Sparkles } from 'lucide-react';
import TonIcon from './TonIcon';

interface HeaderProps {
  balance?: number;
}

export default function Header({ balance = 0 }: HeaderProps) {
  return (
    <header className="bg-black/95 backdrop-blur-md border-b border-gray-800/80 px-3 md:px-4 py-2.5 md:py-3 fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-1.5 md:p-2 rounded-xl shadow-lg shadow-blue-500/30">
            <Sparkles size={18} className="text-white md:w-5 md:h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm md:text-lg leading-tight">NFT Cases</h1>
            <p className="text-blue-400 text-[10px] md:text-xs leading-tight">Open & Win</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl border border-blue-500/50 shadow-lg shadow-blue-500/20">
            <TonIcon className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-white font-bold text-sm md:text-base">{balance.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
