export default function CategoryIcons() {
  const icons = [
    '🎒', '💻', '🧢', '📱', '🍰', '👞', '🔧', '🌟', '🎮', '🔍',
    '⚾', '🎨', '🎁', '🎭', '🎃', '🎯', '💎', '🏀', '📚', '🌐',
    '🎪', '🎯', '👑', '💍', '🎸', '🎹'
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-4 py-4">
      <div className="flex items-center gap-2 min-w-max">
        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-md text-sm font-semibold">
          Live
        </div>
        {icons.map((icon, index) => (
          <div
            key={index}
            className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-2xl hover:bg-gray-700 transition-all cursor-pointer hover:scale-110"
          >
            {icon}
          </div>
        ))}
      </div>
    </div>
  );
}
