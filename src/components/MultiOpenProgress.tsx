import { Sparkles } from 'lucide-react';

interface MultiOpenProgressProps {
  current: number;
  total: number;
}

export default function MultiOpenProgress({ current, total }: MultiOpenProgressProps) {
  const progress = (current / total) * 100;

  return (
    <div className="fixed top-20 md:top-24 left-1/2 transform -translate-x-1/2 z-[60] w-full max-w-md px-4">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-400 animate-pulse" />
            <span className="text-white font-bold text-sm md:text-base">Opening Cases</span>
          </div>
          <span className="text-blue-400 font-bold text-sm md:text-base">{current}/{total}</span>
        </div>

        <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-full transition-all duration-300 ease-out animate-shimmer"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold drop-shadow-lg">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                i < current
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50'
                  : i === current
                  ? 'bg-blue-500 animate-pulse'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        .animate-slide {
          animation: slide 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
