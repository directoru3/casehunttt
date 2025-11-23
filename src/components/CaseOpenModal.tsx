import { X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Case, Item } from '../lib/supabase';
import { getRarityStyle } from '../utils/rarityStyles';

interface CaseOpenModalProps {
  caseData: Case;
  items: Item[];
  onClose: () => void;
  onKeepItem: (item: Item, casePrice: number) => void;
  balance?: number;
  onNavigateToCharge?: () => void;
}

export default function CaseOpenModal({ caseData, items, onClose, onKeepItem, balance = 0, onNavigateToCharge }: CaseOpenModalProps) {
  const [spinning, setSpinning] = useState(false);
  const [wonItem, setWonItem] = useState<Item | null>(null);
  const [secretCode, setSecretCode] = useState('');
  const [showPrizes, setShowPrizes] = useState(true);
  const [showDecision, setShowDecision] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasEnoughBalance = balance >= caseData.price;
  const insufficientFunds = !hasEnoughBalance;

  const generateItems = () => {
    const repeated: Item[] = [];
    for (let i = 0; i < 50; i++) {
      repeated.push(items[Math.floor(Math.random() * items.length)]);
    }
    return repeated;
  };

  const [displayItems, setDisplayItems] = useState<Item[]>(generateItems());

  const selectWinnerByRarity = () => {
    const random = Math.random() * 100;
    let cumulativeProbability = 0;

    const sortedItems = [...items].sort((a, b) => {
      const rarityOrder: { [key: string]: number } = {
        'common': 1,
        'uncommon': 2,
        'rare': 3,
        'epic': 4,
        'legendary': 5
      };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });

    for (const item of sortedItems) {
      const probability = getRarityProbability(item.rarity);
      cumulativeProbability += probability;
      if (random <= cumulativeProbability) {
        return item;
      }
    }

    return sortedItems[0];
  };

  const getRarityProbability = (rarity: string): number => {
    const probabilities: { [key: string]: number } = {
      'common': 50,
      'uncommon': 30,
      'rare': 15,
      'epic': 4,
      'legendary': 1
    };
    return probabilities[rarity] || 10;
  };

  const handleSpin = () => {
    if (spinning || insufficientFunds) return;

    setSpinning(true);
    setWonItem(null);
    setShowDecision(false);
    setDisplayItems(generateItems());

    const winner = selectWinnerByRarity();

    setTimeout(() => {
      setWonItem(winner);
      setSpinning(false);
      setShowDecision(true);
    }, 5000);

    if (scrollRef.current) {
      const itemWidth = 150;
      const centerOffset = scrollRef.current.offsetWidth / 2 - itemWidth / 2;
      const randomWinPosition = 30 + Math.floor(Math.random() * 10);
      const scrollDistance = randomWinPosition * itemWidth - centerOffset;

      scrollRef.current.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      scrollRef.current.style.transform = `translateX(-${scrollDistance}px)`;
    }
  };

  const handleKeep = () => {
    if (wonItem && showDecision) {
      onKeepItem(wonItem, caseData.price);
      onClose();
    }
  };

  const handleSell = () => {
    if (wonItem && showDecision) {
      onClose();
    }
  };

  useEffect(() => {
    if (!spinning && scrollRef.current) {
      scrollRef.current.style.transition = 'none';
      scrollRef.current.style.transform = 'translateX(0)';
    }
  }, [spinning]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative border border-gray-800">
        <button
          onClick={() => {
            if (!spinning) {
              onClose();
            }
          }}
          disabled={spinning}
          className="sticky top-0 right-0 ml-auto mb-4 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all z-20"
        >
          <ChevronDown size={20} />
          <span className="font-semibold">Close</span>
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{caseData.name}</h2>
          <p className="text-gray-400">Spin to win amazing NFT items!</p>
        </div>

        <div className="relative mb-8 overflow-hidden rounded-xl bg-gray-800/50 border border-gray-700">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-blue-500 z-10 transform -translate-x-1/2 shadow-lg shadow-blue-500/50" />

          <div className="relative h-40 flex items-center">
            <div
              ref={scrollRef}
              className="flex gap-4 px-8 py-4"
              style={{ willChange: 'transform' }}
            >
              {displayItems.map((item, index) => {
                const rarityStyle = getRarityStyle(item.rarity);
                return (
                  <div
                    key={index}
                    className={`min-w-[120px] w-[120px] h-[120px] ${rarityStyle.bg} rounded-lg p-2 flex flex-col items-center justify-center border-2 ${rarityStyle.border} ${rarityStyle.shadow} transition-all`}
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded mb-2"
                    />
                        <svg className="w-6 h-6" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z" fill="#0098EA"/>
                      <path d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5381 22.4861C43.3045 19.4251 41.0761 15.6277 37.5627 15.6277H37.5603Z" fill="white"/>
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-800/90 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-800/90 to-transparent" />
          </div>
        </div>

        {wonItem && showDecision && (
          <div className={`mb-6 p-6 rounded-xl border-2 ${getRarityStyle(wonItem.rarity).border} ${getRarityStyle(wonItem.rarity).bg} ${getRarityStyle(wonItem.rarity).shadow}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img
                  src={wonItem.image_url}
                  alt={wonItem.name}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-white/30"
                />
                <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  WON!
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-xl mb-1">{wonItem.name}</p>
                <p className={`${getRarityStyle(wonItem.rarity).text} text-sm font-semibold capitalize`}>
                  {wonItem.rarity} Rarity
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleKeep}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all"
              >
                Keep Item
              </button>
              <button
                onClick={handleSell}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-all"
              >
                Sell for TON
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-gray-300">
            <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs">i</span>
            </div>
            <p className="text-sm">To open this case, enter the secret code</p>
          </div>

          <input
            type="text"
            placeholder="Secret Code"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors mb-4"
          />

          {insufficientFunds ? (
            <button
              onClick={onNavigateToCharge}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-3 text-lg"
            >
              <span>💰 Пополнить баланс</span>
            </button>
          ) : (
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-3 text-lg"
            >
              <span>{spinning ? 'Spinning...' : 'Spin'}</span>
              <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded">
                <span>{caseData.price}</span>
                <svg className="w-5 h-5" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z" fill="#0098EA"/>
                  <path d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5381 22.4861C43.3045 19.4251 41.0761 15.6277 37.5627 15.6277H37.5603Z" fill="white"/>
                </svg>
              </div>
            </button>
          )}

          {insufficientFunds && (
            <p className="text-center text-orange-400 text-sm mt-3 font-semibold">
              ⚠️ Недостаточно средств! Требуется {caseData.price} TON, у вас {balance.toFixed(2)} TON
            </p>
          )}

          <p className="text-center text-gray-400 text-sm mt-3">
            Search for secret codes in <span className="text-blue-400">@tatar_mafia_test.net</span>
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowPrizes(!showPrizes)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-3 w-full"
          >
            <span className="text-sm font-semibold">Possible prizes:</span>
            <ChevronDown
              size={16}
              className={`transform transition-transform ${showPrizes ? 'rotate-180' : ''}`}
            />
          </button>

          {showPrizes && (
            <div className="grid grid-cols-3 gap-3">
              {items.map((item) => {
                const rarityStyle = getRarityStyle(item.rarity);
                return (
                  <div
                    key={item.id}
                    className={`${rarityStyle.bg} rounded-lg p-3 border-2 ${rarityStyle.border} ${rarityStyle.shadow} ${rarityStyle.glow} transition-all cursor-pointer`}
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
  );
}
