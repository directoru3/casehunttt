import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Item } from '../lib/supabase';
import { getRarityStyle } from '../utils/rarityStyles';
import { getAllItems } from '../data/mockData';
import PepeRaceAnimation from '../components/PepeRaceAnimation';

interface UpgradePageProps {
  inventory: Item[];
  onUpgrade: (fromIndex: number, toItem: Item, success: boolean) => void;
}

export default function UpgradePage({ inventory, onUpgrade }: UpgradePageProps) {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [targetItem, setTargetItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'target'>('inventory');
  const [isRacing, setIsRacing] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<'success' | 'fail' | null>(null);

  const selectedItem = selectedItemIndex !== null ? inventory[selectedItemIndex] : null;
  const allItems = getAllItems();

  const getTargetItems = () => {
    if (!selectedItem) return [];
    const minPrice = selectedItem.price * 1.8;
    const maxPrice = selectedItem.price * 2.2;
    return allItems.filter(item =>
      item.price >= minPrice &&
      item.price <= maxPrice &&
      item.id !== selectedItem.id
    );
  };

  const targetItems = getTargetItems();

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTargets = targetItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateChance = () => {
    if (!selectedItem || !targetItem) return 0;
    const ratio = selectedItem.price / targetItem.price;
    return Math.round(ratio * 100);
  };

  const handleUpgrade = () => {
    if (!selectedItem || !targetItem || selectedItemIndex === null || isRacing) return;

    setIsRacing(true);
    setUpgradeResult(null);
  };

  const handleRaceComplete = (success: boolean) => {
    setUpgradeResult(success ? 'success' : 'fail');

    setTimeout(() => {
      setIsRacing(false);
      if (selectedItemIndex !== null) {
        onUpgrade(selectedItemIndex, targetItem!, success);
      }
      setSelectedItemIndex(null);
      setTargetItem(null);
      setUpgradeResult(null);
    }, 2000);
  };

  const chance = calculateChance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-bold mb-6 transition-all shadow-lg hover:shadow-xl">
            ВОЙТИ ЧЕРЕЗ TELEGRAM
          </button>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Апгрейд NFT
          </h1>
          <p className="text-gray-400">Помогите лягушке Pepe добраться до финиша!</p>
        </div>

        {isRacing && (
          <div className="mb-12">
            <PepeRaceAnimation isRunning={isRacing} onComplete={handleRaceComplete} />
          </div>
        )}

        {upgradeResult && !isRacing && (
          <div
            className={`mb-10 mx-auto max-w-lg p-8 rounded-3xl text-center border-2 shadow-2xl transform scale-100 transition-all ${
              upgradeResult === 'success'
                ? 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500 shadow-blue-500/50'
                : 'bg-gradient-to-br from-red-600/20 to-rose-600/20 border-red-500 shadow-red-500/50'
            }`}
          >
            <div className="mb-4 flex justify-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl border-4 ${
                  upgradeResult === 'success'
                    ? 'bg-blue-500/20 border-blue-400'
                    : 'bg-red-500/20 border-red-400'
                }`}
              >
                {upgradeResult === 'success' ? '✨' : '💥'}
              </div>
            </div>
            <div
              className={`font-bold text-3xl mb-3 ${
                upgradeResult === 'success' ? 'text-blue-300' : 'text-red-300'
              }`}
            >
              {upgradeResult === 'success' ? 'ВЫИГРЫШ!' : 'ПРОИГРЫШ!'}
            </div>
            <p className="text-gray-200 text-sm font-medium">
              {upgradeResult === 'success'
                ? 'Лягушка успешно перепрыгнула все препятствия!'
                : 'Лягушка упала на препятствии!'}
            </p>
          </div>
        )}

        {!isRacing && (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-blue-500/50 transition-colors">
                <h3 className="text-white font-bold text-center mb-6 text-lg">Ваш предмет</h3>
                {selectedItem ? (
                  <div
                    className={`${getRarityStyle(selectedItem.rarity).bg} rounded-2xl p-6 border-2 ${getRarityStyle(selectedItem.rarity).border} ${getRarityStyle(selectedItem.rarity).shadow}`}
                  >
                    <div className="mb-4 h-32 overflow-hidden rounded-xl bg-black/20">
                      <img
                        src={selectedItem.image_url}
                        alt={selectedItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-white font-bold text-center mb-2 text-sm">{selectedItem.name}</p>
                    <p className={`${getRarityStyle(selectedItem.rarity).text} text-center text-xs font-semibold capitalize mb-3`}>
                      {selectedItem.rarity}
                    </p>
                    <div className="flex items-center justify-center gap-2 bg-black/30 rounded-lg py-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        V
                      </div>
                      <span className="text-white font-bold text-lg">{selectedItem.price}</span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-600 rounded-2xl p-12 text-center hover:border-blue-500/50 transition-colors">
                    <Plus size={40} className="text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">Выберите предмет</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-cyan-500/50 transition-colors">
                <h3 className="text-white font-bold text-center mb-6 text-lg">Желаемый NFT</h3>
                {targetItem ? (
                  <div
                    className={`${getRarityStyle(targetItem.rarity).bg} rounded-2xl p-6 border-2 ${getRarityStyle(targetItem.rarity).border} ${getRarityStyle(targetItem.rarity).shadow}`}
                  >
                    <div className="mb-4 h-32 overflow-hidden rounded-xl bg-black/20">
                      <img
                        src={targetItem.image_url}
                        alt={targetItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-white font-bold text-center mb-2 text-sm">{targetItem.name}</p>
                    <p className={`${getRarityStyle(targetItem.rarity).text} text-center text-xs font-semibold capitalize mb-3`}>
                      {targetItem.rarity}
                    </p>
                    <div className="flex items-center justify-center gap-2 bg-black/30 rounded-lg py-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        V
                      </div>
                      <span className="text-white font-bold text-lg">{targetItem.price}</span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-600 rounded-2xl p-12 text-center hover:border-cyan-500/50 transition-colors">
                    <Plus size={40} className="text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">Выберите NFT</p>
                  </div>
                )}
              </div>
            </div>

            {selectedItem && targetItem && !isRacing && !upgradeResult && (
              <button
                onClick={handleUpgrade}
                className="w-full max-w-2xl mx-auto block bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-700 hover:via-cyan-600 hover:to-blue-700 text-white font-bold py-6 rounded-2xl mb-8 transition-all text-xl shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transform border border-cyan-400/50"
              >
                🐸 Начать гонку (Шанс: {chance}%)
              </button>
            )}

            {isRacing && (
              <button
                disabled
                className="w-full max-w-2xl mx-auto block bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 font-bold py-6 rounded-2xl mb-8 text-xl opacity-60 cursor-not-allowed"
              >
                ⏳ Лягушка бежит...
              </button>
            )}

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="flex border-b border-slate-700">
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`flex-1 py-4 font-bold transition-all ${
                    activeTab === 'inventory'
                      ? 'bg-slate-700 text-blue-400 border-b-2 border-blue-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📦 Инвентарь
                </button>
                <button
                  onClick={() => setActiveTab('target')}
                  className={`flex-1 py-4 font-bold transition-all ${
                    activeTab === 'target'
                      ? 'bg-slate-700 text-cyan-400 border-b-2 border-cyan-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🎯 Желаемый NFT
                </button>
              </div>

              <div className="p-8">
                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="text"
                    placeholder="Быстрый поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {activeTab === 'inventory' ? (
                  filteredInventory.length === 0 ? (
                    <div className="text-center py-16">
                      <Plus size={48} className="text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">В вашем инвентаре нет предметов</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {filteredInventory.map((item, index) => {
                        const rarityStyle = getRarityStyle(item.rarity);
                        const actualIndex = inventory.indexOf(item);
                        return (
                          <div
                            key={`inv-${actualIndex}`}
                            onClick={() => {
                              setSelectedItemIndex(actualIndex);
                              setTargetItem(null);
                            }}
                            className={`group ${rarityStyle.bg} rounded-xl p-3 border-2 ${rarityStyle.border} ${rarityStyle.shadow} cursor-pointer transition-all hover:scale-110 ${
                              selectedItemIndex === actualIndex ? 'ring-4 ring-blue-500 scale-110' : 'hover:scale-105'
                            }`}
                          >
                            <div className="mb-2 h-24 overflow-hidden rounded-lg bg-black/20">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            </div>
                            <p className="text-white text-xs font-bold truncate">{item.name}</p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center text-slate-900 text-[9px] font-bold">
                                V
                              </div>
                              <span className="text-white text-xs font-bold">{item.price}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  !selectedItem ? (
                    <div className="text-center py-16">
                      <Plus size={48} className="text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">Сначала выберите предмет из инвентаря</p>
                      <p className="text-slate-500 text-sm mt-2">Затем здесь появятся предметы в 2x дороже</p>
                    </div>
                  ) : filteredTargets.length === 0 ? (
                    <div className="text-center py-16">
                      <Search size={48} className="text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">Нет доступных предметов</p>
                      <p className="text-slate-500 text-sm mt-2">Предмет должен стоить ≈{(selectedItem.price * 2).toFixed(1)} TON</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {filteredTargets.map((item) => {
                        const rarityStyle = getRarityStyle(item.rarity);
                        return (
                          <div
                            key={`target-${item.id}`}
                            onClick={() => setTargetItem(item)}
                            className={`group ${rarityStyle.bg} rounded-xl p-3 border-2 ${rarityStyle.border} ${rarityStyle.shadow} cursor-pointer transition-all hover:scale-110 ${
                              targetItem?.id === item.id ? 'ring-4 ring-cyan-500 scale-110' : 'hover:scale-105'
                            }`}
                          >
                            <div className="mb-2 h-24 overflow-hidden rounded-lg bg-black/20">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            </div>
                            <p className="text-white text-xs font-bold truncate">{item.name}</p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center text-slate-900 text-[9px] font-bold">
                                V
                              </div>
                              <span className="text-white text-xs font-bold">{item.price}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
