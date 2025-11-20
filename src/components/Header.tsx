import { X, Wallet } from 'lucide-react';

interface HeaderProps {
  balance?: number;
}

export default function Header({ balance = 0 }: HeaderProps) {
  return (
    <header className="bg-black/90 backdrop-blur-sm border-b border-gray-800 px-4 py-3 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="text-white hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
          <span className="text-white font-semibold text-lg">NFT Gifts</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-4 py-2 rounded-lg border border-blue-500/50 hover:border-blue-500 transition-colors">
            <span className="text-white font-bold text-lg">{balance.toFixed(2)}</span>
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              V
            </div>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/50 flex items-center gap-2">
            <Wallet size={18} />
            Пополнить
          </button>
        </div>
      </div>
    </header>
  );
}
