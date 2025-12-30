export default function CategoryIcons() {
  const icons = [
    '🎒', '💻', '🧢', '📱', '🍰', '👞', '🔧', '🌟', '🎮', '🔍',
    '⚾', '🎨', '🎁', '🎭', '🎃', '🎯', '💎', '🏀', '📚', '🌐',
    '🎪', '🎯', '👑', '💍', '🎸', '🎹'
  ];

  return (
    <div className="relative overflow-hidden px-2 md:px-4 py-3 md:py-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar snap-x snap-mandatory">
        <div className="flex items-center gap-1.5 md:gap-2 min-w-max">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-lg shadow-green-500/30 flex items-center gap-1 shrink-0 animate-pulse">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-ping"></div>
            Live
          </div>
          {icons.map((icon, index) => (
            <div
              key={index}
              className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center text-xl md:text-2xl hover:bg-gray-700 active:scale-95 transition-all cursor-pointer border border-gray-700 shadow-lg shrink-0 snap-start touch-manipulation"
            >
              {icon}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
