import { ChevronDown, Sparkles, Star } from 'lucide-react';
import { useState } from 'react';
import { Case, Item } from '../lib/supabase';
import { getRarityStyle } from '../utils/rarityStyles';
import AnimatedNFT from './AnimatedNFT';
import TonIcon from './TonIcon';
import { FortuneWheel } from './FortuneWheel';
import { telegramAuth } from '../utils/telegramAuth';
import ErrorBoundary from './ErrorBoundary';
import ItemRevealCard from './ItemRevealCard';
import MultiOpenProgress from './MultiOpenProgress';

interface EnhancedCaseOpenModalProps {
  caseData: Case;
  items: Item[];
  onClose: () => void;
  onKeepItems: (items: Item[], totalCost: number) => void;
  onSellItems?: (items: Item[], totalCost: number) => void;
  balance?: number;
  onNavigateToCharge?: () => void;
}

export default function EnhancedCaseOpenModal({
  caseData,
  items,
  onClose,
  onKeepItems,
  onSellItems,
  balance = 0,
  onNavigateToCharge
}: EnhancedCaseOpenModalProps) {
  const [spinning, setSpinning] = useState(false);
  const [wonItems, setWonItems] = useState<Item[]>([]);
  const [wonIndexes, setWonIndexes] = useState<number[]>([]);
  const [secretCode, setSecretCode] = useState('');
  const [showPrizes, setShowPrizes] = useState(true);
  const [showDecision, setShowDecision] = useState(false);
  const [showFullscreenWin, setShowFullscreenWin] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [openCount, setOpenCount] = useState(1);
  const [currentSpinIndex, setCurrentSpinIndex] = useState(0);
  const [showWheels, setShowWheels] = useState(true);
  const [wheelsVisible, setWheelsVisible] = useState(true);
  const [currentWinningItem, setCurrentWinningItem] = useState<Item | null>(null);
  const [showCurrentWin, setShowCurrentWin] = useState(false);
  const [allWinners, setAllWinners] = useState<Item[]>([]);

  const isFreeGift = caseData.id === 'free-gift';
  const totalCost = caseData.price * openCount;
  const hasEnoughBalance = balance >= totalCost;
  const insufficientFunds = !hasEnoughBalance;

  const wheelItems = Array.isArray(items)
    ? items.filter(item => item && item.name && item.rarity && item.image_url).map(item => ({
        name: item.name,
        rarity: item.rarity,
        image: item.image_url,
        color: getRarityStyle(item.rarity).border
      }))
    : [];

  const handleSpin = async () => {
    if (spinning || insufficientFunds) return;

    setSpinning(true);
    setWonItems([]);
    setWonIndexes([]);
    setShowDecision(false);
    setShowFullscreenWin(false);
    setCurrentSpinIndex(0);
    setShowWheels(true);
    setWheelsVisible(true);
    setCurrentWinningItem(null);
    setShowCurrentWin(false);
    setAllWinners([]);

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

      const indexes = winners.map(winner => {
        const index = items.findIndex(item => item.id === winner.id);
        return index >= 0 ? index : 0;
      });

      setAllWinners(winners);
      setWonIndexes(indexes);
    } catch (error) {
      console.error('Error opening case:', error);
      setSpinning(false);
      setShowWheels(true);
      setWheelsVisible(true);
      alert('Failed to open case. Please try again.');
    }
  };

  const handleSpinComplete = () => {
    const currentIndex = currentSpinIndex;
    const winningItem = allWinners[currentIndex];

    if (winningItem) {
      setCurrentWinningItem(winningItem);
      setShowCurrentWin(true);

      setWonItems(prev => [...prev, winningItem]);

      setTimeout(() => {
        setShowCurrentWin(false);
        setCurrentWinningItem(null);

        setTimeout(() => {
          const newIndex = currentIndex + 1;
          setCurrentSpinIndex(newIndex);

          if (newIndex >= openCount) {
            setTimeout(() => {
              setSpinning(false);
              setWheelsVisible(false);

              setTimeout(() => {
                setShowWheels(false);
                setShowFullscreenWin(true);

                setTimeout(() => {
                  setShowFullscreenWin(false);
                  setShowDecision(true);
                }, 3000);
              }, 600);
            }, 300);
          }
        }, 300);
      }, 800);
    }
  };

  const handleKeepAll = () => {
    if (wonItems.length > 0 && showDecision) {
      onKeepItems(wonItems, totalCost);
      setNotification(`${wonItems.length} items added to inventory!`);
      setTimeout(() => setNotification(null), 3000);
      resetState();
    }
  };

  const handleSellAll = () => {
    if (wonItems.length > 0 && showDecision && onSellItems) {
      onSellItems(wonItems, totalCost);
      const totalValue = wonItems.reduce((sum, item) => sum + (item.price * 0.94), 0);
      setNotification(`Sold for ${totalValue.toFixed(2)} Stars!`);
      setTimeout(() => setNotification(null), 3000);
      resetState();
    }
  };

  const resetState = () => {
    setWonItems([]);
    setWonIndexes([]);
    setShowDecision(false);
    setShowFullscreenWin(false);
    setCurrentSpinIndex(0);

    setTimeout(() => {
      setShowWheels(true);
      setTimeout(() => {
        setWheelsVisible(true);
      }, 50);
    }, 300);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4">
        {spinning && openCount > 1 && (
          <MultiOpenProgress current={currentSpinIndex + 1} total={openCount} />
        )}

        {notification && (
          <div className="fixed top-20 md:top-24 left-1/2 transform -translate-x-1/2 z-[60] animate-slide-down px-3">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-green-400">
              <Sparkles size={16} className="animate-pulse md:w-5 md:h-5" />
              <span className="font-bold text-sm md:text-base">{notification}</span>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl max-w-6xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto p-3 md:p-6 relative border border-gray-700 shadow-2xl">
          <button
            onClick={() => {
              if (!spinning) {
                onClose();
              }
            }}
            disabled={spinning}
            className="sticky top-0 right-0 ml-auto mb-3 md:mb-4 flex items-center gap-1.5 md:gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 md:px-4 py-2 rounded-lg transition-all z-20 border border-gray-600 text-sm md:text-base touch-manipulation"
          >
            <ChevronDown size={18} className="md:w-5 md:h-5" />
            <span className="font-semibold">Close</span>
          </button>

          <div className="mb-4 md:mb-6 text-center">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {caseData.name}
            </h2>
            <p className="text-gray-400 text-xs md:text-base">Spin the wheel to win amazing NFT items!</p>
          </div>

          {showWheels && wheelItems.length > 0 && (
            <ErrorBoundary>
              <div
                className={`flex flex-col items-center justify-center gap-4 mb-6 md:mb-8 transition-all duration-500 ${
                  wheelsVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              >
                <div className="flex-shrink-0 animate-fade-in">
                  <FortuneWheel
                    items={wheelItems}
                    winningIndex={wonIndexes[currentSpinIndex] !== undefined ? wonIndexes[currentSpinIndex] : 0}
                    isSpinning={spinning && currentSpinIndex < allWinners.length && !showCurrentWin}
                    onSpinComplete={handleSpinComplete}
                  />
                </div>

                {showCurrentWin && currentWinningItem && (
                  <div className="animate-scale-in">
                    <ItemRevealCard
                      item={currentWinningItem}
                      delay={0}
                    />
                  </div>
                )}
              </div>
            </ErrorBoundary>
          )}

          {showDecision && wonItems.length > 0 && (
            <div className="mb-4 md:mb-6 animate-fade-in">
              <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 text-center flex items-center justify-center gap-2">
                <Sparkles className="text-yellow-400 animate-pulse" />
                Your Winnings!
                <Sparkles className="text-yellow-400 animate-pulse" />
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                {wonItems.map((item, index) => (
                  <ItemRevealCard
                    key={`${item.id}-${index}`}
                    item={item}
                    delay={index * 150}
                  />
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                <button
                  onClick={handleKeepAll}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:scale-95 text-white font-bold py-3 md:py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 border border-green-500 text-sm md:text-base touch-manipulation"
                >
                  Keep All ({wonItems.length} items)
                </button>
                <button
                  onClick={handleSellAll}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 active:scale-95 text-white font-bold py-3 md:py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 border border-orange-500 text-sm md:text-base touch-manipulation"
                >
                  Sell All ({(wonItems.reduce((sum, item) => sum + (item.price * 0.94), 0)).toFixed(2)} Stars)
                </button>
              </div>
            </div>
          )}

          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-2 mb-2 md:mb-3 text-gray-300">
              <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                <span className="text-[10px] md:text-xs">i</span>
              </div>
              <p className="text-xs md:text-sm">To open this case, enter the secret code</p>
            </div>

            <input
              type="text"
              placeholder="Secret Code"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 md:px-4 py-2.5 md:py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors mb-3 md:mb-4 text-sm md:text-base"
            />

            {!isFreeGift && (
              <div className="mb-3 md:mb-4">
                <p className="text-gray-400 text-xs md:text-sm mb-2 font-semibold">Open Quantity:</p>
                <div className="grid grid-cols-5 gap-1.5 md:gap-2">
                  {[1, 2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      onClick={() => setOpenCount(count)}
                      disabled={spinning}
                      className={`py-2.5 md:py-3 px-2 md:px-4 rounded-lg font-bold transition-all active:scale-95 touch-manipulation text-sm md:text-base ${
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
            )}

            {insufficientFunds ? (
              <button
                onClick={onNavigateToCharge}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 active:scale-95 text-white font-bold py-3 md:py-4 rounded-xl transition-all flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shadow-lg touch-manipulation"
              >
                <span>💰 Top Up Balance</span>
              </button>
            ) : (
              <button
                onClick={handleSpin}
                disabled={spinning}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 md:py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shadow-lg hover:shadow-blue-500/50 touch-manipulation"
              >
                <span>{spinning ? 'Spinning...' : openCount > 1 ? `Spin ${openCount}x` : 'Spin'}</span>
                <div className="flex items-center gap-1 md:gap-1.5 bg-white/20 px-2 md:px-3 py-1 md:py-1.5 rounded-lg">
                  <span className="text-sm md:text-base">{totalCost.toFixed(2)}</span>
                  <TonIcon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              </button>
            )}

            {insufficientFunds && (
              <p className="text-center text-orange-400 text-xs md:text-sm mt-2 md:mt-3 font-semibold">
                ⚠️ Insufficient funds! Required {totalCost.toFixed(2)} Stars, you have {balance.toFixed(2)} Stars
              </p>
            )}

            <p className="text-center text-gray-400 text-xs md:text-sm mt-2 md:mt-3">
              Search for secret codes in <span className="text-blue-400">@tatar_mafia_test.net</span>
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowPrizes(!showPrizes)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2 md:mb-3 w-full touch-manipulation"
            >
              <span className="text-xs md:text-sm font-semibold">Possible prizes:</span>
              <ChevronDown
                size={14}
                className={`md:w-4 md:h-4 transform transition-transform ${showPrizes ? 'rotate-180' : ''}`}
              />
            </button>

            {showPrizes && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                {items.map((item) => {
                  const rarityStyle = getRarityStyle(item.rarity);
                  return (
                    <div
                      key={item.id}
                      className={`${rarityStyle.bg} rounded-lg p-3 border-2 ${rarityStyle.border} ${rarityStyle.shadow} ${rarityStyle.glow} transition-all cursor-pointer hover:scale-105`}
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
            )}
          </div>
        </div>
      </div>

      {showFullscreenWin && wonItems.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-black/90 animate-pulse-slow" />

          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                <Star
                  size={15 + Math.random() * 25}
                  className="text-yellow-400 opacity-70 fill-yellow-400"
                />
              </div>
            ))}
          </div>

          <div className="relative z-10 text-center animate-scale-in px-4">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-bounce-slow drop-shadow-2xl">
                CONGRATULATIONS!
              </h1>
              <p className="text-2xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text uppercase tracking-wider drop-shadow-lg">
                {wonItems.length} Items Won!
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              {wonItems.slice(0, 5).map((item, index) => {
                const rarityStyle = getRarityStyle(item.rarity);
                return (
                  <div
                    key={index}
                    className={`relative inline-block p-4 md:p-6 rounded-2xl border-4 ${rarityStyle.border} ${rarityStyle.shadow} bg-black/40 backdrop-blur-sm animate-float-slow`}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
                    <div className="w-32 h-32 md:w-40 md:h-40 relative z-10">
                      <AnimatedNFT
                        src={item.image_url}
                        alt={item.name}
                        rarity={item.rarity}
                        autoplay={true}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {wonItems.length > 5 && (
              <p className="mt-6 text-white text-xl font-bold">
                +{wonItems.length - 5} more items!
              </p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes scale-in {
          0% { transform: scale(0.3); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-float-slow {
          animation: float-slow 3s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes slide-down {
          0% { transform: translate(-50%, -100%); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
