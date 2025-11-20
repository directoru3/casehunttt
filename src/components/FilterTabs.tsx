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
    <div className="flex gap-3 px-4 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeFilter === filter.id
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300'
          }`}
        >
          <span className="mr-2">{filter.icon}</span>
          {filter.label}
        </button>
      ))}
    </div>
  );
}
