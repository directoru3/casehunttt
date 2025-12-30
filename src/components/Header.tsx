interface HeaderProps {
  balance?: number;
}

export default function Header({ balance = 0 }: HeaderProps) {
  return (
    <header className="bg-black/90 backdrop-blur-sm border-b border-gray-800 px-3 md:px-4 py-2 md:py-3 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-end">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-2 md:px-4 py-1.5 md:py-2 rounded-lg border border-blue-500/50">
            <span className="text-white font-bold text-sm md:text-lg">{balance.toFixed(2)}</span>
            <span className="text-white text-xs md:text-sm font-semibold">Stars</span>
          </div>
        </div>
      </div>
    </header>
  );
}
