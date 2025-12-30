import { Gift, Sparkles } from 'lucide-react';
import TonIcon from './TonIcon';

export default function PromoSection() {
  return (
    <div className="px-3 md:px-4 mb-4 md:mb-6">
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-2xl p-4 md:p-6 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-shimmer"></div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 md:opacity-20">
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles size={80} className="text-white animate-pulse" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 md:p-2 rounded-lg">
              <Gift className="text-white" size={18} />
            </div>
            <span className="text-white font-bold text-base md:text-lg">Free Stars Bonus</span>
            <TonIcon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <p className="text-white/95 text-xs md:text-sm mb-3 md:mb-4 leading-relaxed">
            Subscribe to our Telegram channel and get free Stars to your balance!
          </p>
          <button className="bg-white text-blue-600 px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold hover:bg-gray-100 active:scale-95 transition-all shadow-lg flex items-center gap-2 touch-manipulation text-sm md:text-base">
            <span>Claim Now</span>
            <Sparkles size={16} className="md:w-4 md:h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}
