interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const filters = [
    { id: 'all', label: 'All', icon: '🟢' },
    { id: 'free', label: 'Free', icon: '🔴' },
    { id: 'new', label: 'New', icon: '⭐' },
    { id: 'low', label: 'Low', icon: '🎁' },
    { id: 'high', label: 'High', icon: '🟠' }
  ];

  return (
    <div className="px-3 md:px-4 mb-4 md:mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all shrink-0 snap-start active:scale-95 touch-manipulation text-sm md:text-base ${
              activeFilter === filter.id
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400'
                : 'bg-gray-800/70 text-gray-400 hover:bg-gray-700 hover:text-gray-300 border border-gray-700'
            }`}
          >
            <span className="mr-1.5 md:mr-2">{filter.icon}</span>
            {filter.label}
          </button>
        ))}
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
