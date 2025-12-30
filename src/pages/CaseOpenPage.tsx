import { ChevronLeft, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Case, Item } from '../lib/supabase';
import { getRarityStyle } from '../utils/rarityStyles';
import AnimatedNFT from '../components/AnimatedNFT';
import TonIcon from '../components/TonIcon';
import { telegramAuth } from '../utils/telegramAuth';
import ErrorBoundary from '../components/ErrorBoundary';
import ItemRevealCard from '../components/ItemRevealCard';
import { FortuneWheel } from '../components/FortuneWheel';

interface CaseOpenPageProps {
  caseData: Case;
  items: Item[];
  onBack: () => void;
  onKeepItems: (items: Item[], totalCost: number) => void;
  onSellItems?: (items: Item[], totalCost: number) => void;
  balance?: number;
  onNavigateToCharge?: () => void;
}

export default function CaseOpenPage({
  caseData,
  items,
  onBack,
  onKeepItems,
  onSellItems,
  balance = 0,
  onNavigateToCharge
}: CaseOpenPageProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonItems, setWonItems] = useState<Item[]>([]);
  const [showDecision, setShowDecision] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [openCount, setOpenCount] = useState(1);
  const [currentSpinIndex, setCurrentSpinIndex] = useState(0);
  const [allWinners, setAllWinners] = useState<Item[]>([]);
  const [currentWinningIndex, setCurrentWinningIndex] = useState(0);
  const [spinsCompleted, setSpinsCompleted] = useState<Item[]>([]);

  const totalCost = caseData.price * openCount;
  const hasEnoughBalance = balance >= totalCost;
  const insufficientFunds = !hasEnoughBalance;

  const wheelItems = items.map(item => ({
    name: item.name,
    rarity: item.rarity,
    image: item.image_url,
    color: getRarityStyle(item.rarity).border
  }));

  const handleOpen = async () => {
    if (isSpinning || insufficientFunds) return;

    setIsSpinning(true);
    setWonItems([]);
    setShowDecision(false);
    setCurrentSpinIndex(0);
    setAllWinners([]);
    setSpinsCompleted([]);

    const currentUser = telegramAuth.getCurrentUser();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/case-opener`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            items,
            count: openCount,
            caseName: caseData.name,
            userId: currentUser?.id,
            username: telegramAuth.getDisplayName(),
            userPhotoUrl: telegramAuth.getAvatarUrl(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to open case');
      }

      const data = await response.json();
      const winners: Item[] = data.winners || [];

      if (winners.length === 0) {
        throw new Error('No winners received');
      }

      setAllWinners(winners);

      const firstWinner = winners[0];
      const winningIndex = items.findIndex(item => item.id === firstWinner.id);
      setCurrentWinningIndex(winningIndex !== -1 ? winningIndex : 0);
    } catch (error) {
      console.error('Error opening case:', error);
      setIsSpinning(false);
      alert('Failed to open case. Please try again.');
    }
  };

  const handleSpinComplete = () => {
    const winningItem = allWinners[currentSpinIndex];

    if (winningItem) {
      setWonItems(prev => [...prev, winningItem]);
      setSpinsCompleted(prev => [...prev, winningItem]);

      const nextIndex = currentSpinIndex + 1;

      if (nextIndex >= openCount) {
        setTimeout(() => {
          setShowDecision(true);
          setIsSpinning(false);
        }, 1000);
      } else {
        setTimeout(() => {
          setCurrentSpinIndex(nextIndex);
          const nextWinner = allWinners[nextIndex];
          const nextWinningIndex = items.findIndex(item => item.id === nextWinner.id);
          setCurrentWinningIndex(nextWinningIndex !== -1 ? nextWinningIndex : 0);
          setIsSpinning(true);
        }, 1000);
      }
    }
  };

  const handleKeepAll = () => {
    if (wonItems.length > 0 && showDecision) {
      onKeepItems(wonItems, totalCost);
      setNotification(`${wonItems.length} items added to inventory!`);
      setTimeout(() => {
        setNotification(null);
        resetState();
        onBack();
      }, 2000);
    }
  };

  const handleSellAll = () => {
    if (wonItems.length > 0 && showDecision && onSellItems) {
      onSellItems(wonItems, totalCost);
      const totalValue = wonItems.reduce((sum, item) => sum + (item.price * 0.94), 0);
      setNotification(`Sold for ${totalValue.toFixed(2)} Stars!`);
      setTimeout(() => {
        setNotification(null);
        resetState();
        onBack();
      }, 2000);
    }
  };

  const resetState = () => {
    setWonItems([]);
    setShowDecision(false);
    setCurrentSpinIndex(0);
    setAllWinners([]);
    setSpinsCompleted([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black pb-20">
      {notification && (
        <div className="fixed top-20 md:top-24 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down px-3">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-green-400">
            <Sparkles size={16} className="animate-pulse md:w-5 md:h-5" />
            <span className="font-bold text-sm md:text-base">{notification}</span>
          </div>
        </div>
      )}

      <div className="sticky top-14 md:top-16 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-sm border-b border-gray-700 z-10 px-3 md:px-4 py-3 md:py-4">
        <button
          onClick={onBack}
          disabled={isSpinning}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 md:px-4 py-2 rounded-lg transition-all border border-gray-600 text-sm md:text-base touch-manipulation"
        >
          <ChevronLeft size={18} className="md:w-5 md:h-5" />
          <span className="font-semibold">Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {caseData.name}
          </h1>
          <p className="text-gray-400 text-sm md:text-base">Spin the wheel to win amazing prizes!</p>
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="flex-1 w-full flex flex-col items-center">
            <ErrorBoundary>
              <div className="relative mb-6">
                <FortuneWheel
                  items={wheelItems}
                  winningIndex={currentWinningIndex}
                  isSpinning={isSpinning}
                  onSpinComplete={handleSpinComplete}
                />
                {openCount > 1 && allWinners.length > 0 && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full whitespace-nowrap">
                    <p className="text-white text-xs md:text-sm font-bold">
                      Spin {currentSpinIndex + 1} of {openCount}
                    </p>
                  </div>
                )}
              </div>
            </ErrorBoundary>

            {!showDecision && (
              <div className="w-full max-w-md space-y-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm mb-2 font-semibold text-center">Open Quantity:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((count) => (
                      <button
                        key={count}
                        onClick={() => setOpenCount(count)}
                        disabled={isSpinning}
                        className={`py-3 px-4 rounded-lg font-bold transition-all active:scale-95 touch-manipulation text-sm md:text-base ${
                          openCount === count
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border border-blue-400'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {count}x
                      </button>
                    ))}
                  </div>
                  {openCount > 1 && (
                    <p className="text-gray-400 text-xs mt-2 text-center">
                      Total cost: {totalCost.toFixed(2)} Stars
                    </p>
                  )}
                </div>

                {insufficientFunds ? (
                  <button
                    onClick={onNavigateToCharge}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 active:scale-95 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-lg touch-manipulation"
                  >
                    <span>💰 Top Up Balance</span>
                  </button>
                ) : (
                  <button
                    onClick={handleOpen}
                    disabled={isSpinning}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-blue-500/50 touch-manipulation"
                  >
                    <span>{isSpinning ? 'Spinning...' : openCount > 1 ? `Spin ${openCount}x` : 'Spin Wheel'}</span>
                    <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg">
                      <span className="text-base">{totalCost.toFixed(2)}</span>
                      <TonIcon className="w-5 h-5" />
                    </div>
                  </button>
                )}

                {insufficientFunds && (
                  <p className="text-center text-orange-400 text-sm font-semibold">
                    ⚠️ Insufficient funds! Required {totalCost.toFixed(2)} Stars, you have {balance.toFixed(2)} Stars
                  </p>
                )}
              </div>
            )}
          </div>

          {openCount > 1 && spinsCompleted.length > 0 && !showDecision && (
            <div className="w-full lg:w-80 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Won Items ({spinsCompleted.length})
              </h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {spinsCompleted.map((item, index) => {
                  const rarityStyle = getRarityStyle(item.rarity);
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className={`${rarityStyle.bg} rounded-lg p-3 border ${rarityStyle.border} animate-slide-in-right flex items-center gap-3`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                        <p className={`${rarityStyle.text} text-xs capitalize`}>
                          {item.rarity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {showDecision && wonItems.length > 0 && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
              <Sparkles className="text-yellow-400 animate-pulse" />
              Your Winnings!
              <Sparkles className="text-yellow-400 animate-pulse" />
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
              {wonItems.map((item, index) => (
                <ItemRevealCard
                  key={`${item.id}-${index}`}
                  item={item}
                  delay={index * 150}
                />
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
              <button
                onClick={handleKeepAll}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:scale-95 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 border border-green-500 text-base touch-manipulation"
              >
                Keep All ({wonItems.length} items)
              </button>
              <button
                onClick={handleSellAll}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 active:scale-95 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 border border-orange-500 text-base touch-manipulation"
              >
                Sell All ({(wonItems.reduce((sum, item) => sum + (item.price * 0.94), 0)).toFixed(2)} Stars)
              </button>
            </div>
          </div>
        )}

        {!showDecision && !isSpinning && (
          <div className="max-w-4xl mx-auto mt-8">
            <h3 className="text-white font-bold text-lg mb-4 text-center">Possible Prizes</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {items.map((item) => {
                const rarityStyle = getRarityStyle(item.rarity);
                return (
                  <div
                    key={item.id}
                    className={`${rarityStyle.bg} rounded-lg p-3 border-2 ${rarityStyle.border} ${rarityStyle.shadow} transition-all cursor-pointer hover:scale-105`}
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full aspect-square object-cover rounded mb-2"
                    />
                    <p className="text-white text-xs font-semibold truncate">{item.name}</p>
                    <p className={`${rarityStyle.text} text-xs capitalize font-semibold`}>
                      {item.rarity}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-down {
          0% { transform: translate(-50%, -100%); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
