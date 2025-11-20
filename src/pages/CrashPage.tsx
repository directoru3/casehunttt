import { useState, useEffect, useRef } from 'react';
import { Users, BarChart3, Volume2, VolumeX, TrendingUp } from 'lucide-react';
import { Item } from '../lib/supabase';
import { getRarityStyle } from '../utils/rarityStyles';

interface OnlineBet {
  id: string;
  playerName: string;
  item: Item;
  amount: number;
  multiplier: number | null;
  status: 'pending' | 'won' | 'lost';
}

interface CrashPageProps {
  inventory: Item[];
  balance: number;
  setBalance: (balance: number) => void;
}

export default function CrashPage({ inventory, balance, setBalance }: CrashPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'crashed'>('waiting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [onlinePlayers] = useState(Math.floor(Math.random() * 1000) + 500);
  const [betAmount, setBetAmount] = useState<number | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [playerBet, setPlayerBet] = useState<OnlineBet | null>(null);
  const [onlineBets, setOnlineBets] = useState<OnlineBet[]>([]);
  const gameTimeoutRef = useRef<NodeJS.Timeout>();

  // Генерируем фиксированное значение краша в начале
  const generateCrashPoint = () => {
    return 1.5 + Math.random() * 3.5;
  };

  // Инициализируем crash point
  useEffect(() => {
    if (gameState === 'waiting') {
      setCrashPoint(generateCrashPoint());
    }
  }, [gameState]);

  // Генерируем онлайн ставки других игроков
  useEffect(() => {
    if (gameState === 'waiting' && onlineBets.length === 0) {
      const dummyItems: Item[] = [
        { id: 'd1', name: 'Random NFT 1', image_url: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg', rarity: 'common', price: 2.5 },
        { id: 'd2', name: 'Random NFT 2', image_url: 'https://images.pexels.com/photos/1261459/pexels-photo-1261459.jpeg', rarity: 'uncommon', price: 5.0 },
        { id: 'd3', name: 'Random NFT 3', image_url: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg', rarity: 'rare', price: 8.5 },
        { id: 'd4', name: 'Random NFT 4', image_url: 'https://images.pexels.com/photos/1036857/pexels-photo-1036857.jpeg', rarity: 'epic', price: 15.0 },
        { id: 'd5', name: 'Random NFT 5', image_url: 'https://images.pexels.com/photos/1054041/pexels-photo-1054041.jpeg', rarity: 'legendary', price: 25.0 },
      ];

      const bets: OnlineBet[] = [];
      const playerCount = Math.floor(Math.random() * 8) + 3;

      for (let i = 0; i < playerCount; i++) {
        bets.push({
          id: `online-${i}`,
          playerName: `Player${Math.floor(Math.random() * 9999)}`,
          item: dummyItems[Math.floor(Math.random() * dummyItems.length)],
          amount: dummyItems[Math.floor(Math.random() * dummyItems.length)].price,
          multiplier: null,
          status: 'pending',
        });
      }

      setOnlineBets(bets);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'waiting') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;

    let animationId: number;
    let startTime = Date.now();
    let localMultiplier = 1.0;

    const drawGraph = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Grid
      ctx.strokeStyle = '#1a4d4d';
      ctx.lineWidth = 1;
      for (let i = 0; i < CANVAS_WIDTH; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let i = 0; i < CANVAS_HEIGHT; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_WIDTH, i);
        ctx.stroke();
      }

      // Line
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(20, CANVAS_HEIGHT - 50);

      const pointCount = 100;
      for (let i = 1; i <= pointCount; i++) {
        const progress = i / pointCount;
        const x = 20 + (CANVAS_WIDTH - 40) * progress;
        const baseMultiplier = Math.pow(progress, 1.5) * crashPoint;

        let y = CANVAS_HEIGHT - 50 - Math.log(baseMultiplier) * 60;
        y = Math.max(20, y);

        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Multiplier text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${localMultiplier.toFixed(2)}x`, CANVAS_WIDTH / 2, 50);
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 3500, 1);

      localMultiplier = Math.pow(progress, 1.5) * crashPoint;

      if (progress >= 1 || localMultiplier >= crashPoint) {
        setGameState('crashed');
        setMultiplier(crashPoint);

        // Обновляем статусы онлайн ставок
        setOnlineBets(prev => prev.map(bet => ({
          ...bet,
          status: Math.random() > 0.3 ? 'lost' : 'won',
          multiplier: bet.status === 'pending' ? parseFloat((Math.random() * 2 + 1).toFixed(2)) : bet.multiplier,
        })));

        return;
      }

      setMultiplier(localMultiplier);
      drawGraph();
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [gameState, crashPoint]);

  const handleBet = (itemIndex: number) => {
    if (gameState !== 'waiting' || selectedItem !== null) return;

    const item = inventory[itemIndex];
    setSelectedItemIndex(itemIndex);
    setSelectedItem(item);
    setBetAmount(item.price);

    // Добавляем ставку игрока в список онлайн ставок
    const playerBet: OnlineBet = {
      id: 'player-me',
      playerName: 'You',
      item: item,
      amount: item.price,
      multiplier: null,
      status: 'pending',
    };
    setPlayerBet(playerBet);

    // Запускаем игру
    setTimeout(() => {
      startGame();
    }, 300);
  };

  const startGame = () => {
    setGameState('playing');
    setMultiplier(1.0);
    setWonAmount(null);
    setCashoutMultiplier(null);
  };

  const handleCashout = () => {
    if (gameState !== 'playing' || !selectedItem) return;

    const winnings = selectedItem.price * multiplier;
    setWonAmount(winnings);
    setCashoutMultiplier(multiplier);
    setBalance(balance + winnings);

    // Обновляем статус ставки игрока
    setPlayerBet(prev => prev ? { ...prev, status: 'won', multiplier } : null);

    setGameState('crashed');

    setTimeout(() => {
      resetGame();
    }, 3000);
  };

  const resetGame = () => {
    setGameState('waiting');
    setSelectedItemIndex(null);
    setSelectedItem(null);
    setBetAmount(null);
    setWonAmount(null);
    setCashoutMultiplier(null);
    setPlayerBet(null);
    setMultiplier(1.0);
    setOnlineBets([]);
  };

  const handleReset = () => {
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-4 py-3 rounded-lg border border-blue-500/50">
            <Users size={20} className="text-blue-400" />
            <span className="text-white font-semibold">{onlinePlayers} онлайн</span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              {isSoundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>

        {/* Graph Canvas */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl mb-8 relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full"
          />

          {gameState === 'waiting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-white text-2xl font-bold mb-2">Выберите предмет для ставки</p>
                <p className="text-gray-300">Затем нажмите на него для начала игры</p>
              </div>
            </div>
          )}

          {gameState === 'crashed' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="text-center">
                {wonAmount ? (
                  <>
                    <p className="text-green-400 text-3xl font-bold mb-2">🎉 ВЫИГРЫШ! 🎉</p>
                    <p className="text-white text-2xl mb-2">+{wonAmount.toFixed(2)} TON</p>
                    <p className="text-gray-300">Коэффициент: {cashoutMultiplier?.toFixed(2)}x</p>
                  </>
                ) : (
                  <>
                    <p className="text-red-400 text-3xl font-bold mb-2">💥 ОБРУШЕНИЕ! 💥</p>
                    <p className="text-white text-xl">Вы не успели забрать выигрыш</p>
                    <p className="text-gray-300 text-sm mt-2">На коэффициенте {crashPoint.toFixed(2)}x</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats and Your Bet */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              📊 Статистика
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Коэффициент:</span>
                <span className="text-blue-400 font-bold text-2xl">{multiplier.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Ставка:</span>
                <span className="text-white font-bold">{betAmount?.toFixed(2) || '—'} TON</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Потенциальный выигрыш:</span>
                <span className="text-green-400 font-bold">{betAmount ? (betAmount * multiplier).toFixed(2) : '—'} TON</span>
              </div>
              <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
                <span className="text-gray-400">Баланс:</span>
                <span className="text-blue-300 font-bold">{balance.toFixed(2)} TON</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-white font-bold text-lg mb-4">🎲 Ваша ставка</h3>
            {selectedItem ? (
              <div className={`${getRarityStyle(selectedItem.rarity).bg} rounded-xl p-4 border-2 ${getRarityStyle(selectedItem.rarity).border} ${getRarityStyle(selectedItem.rarity).shadow}`}>
                <div className="mb-3 h-24 overflow-hidden rounded-lg bg-black/20">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-white font-bold text-center text-sm mb-2">{selectedItem.name}</p>
                <p className={`${getRarityStyle(selectedItem.rarity).text} text-center text-xs capitalize mb-3`}>
                  {selectedItem.rarity}
                </p>
                <div className="flex items-center justify-center gap-2 bg-black/30 rounded-lg py-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    V
                  </div>
                  <span className="text-white font-bold">{selectedItem.price} TON</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Ставка не выбрана</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {gameState === 'playing' ? (
            <button
              onClick={handleCashout}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 rounded-2xl transition-all text-xl shadow-2xl hover:shadow-green-500/50 hover:scale-105 transform border border-green-400/50 animate-pulse"
            >
              💰 Забрать выигрыш ({(betAmount! * multiplier).toFixed(2)} TON)
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-gray-600 text-gray-300 font-bold py-6 rounded-2xl opacity-50 cursor-not-allowed text-xl"
            >
              ⏳ Ожидание...
            </button>
          )}

          <button
            onClick={handleReset}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-bold py-6 rounded-2xl transition-all text-xl shadow-lg"
            disabled={gameState === 'playing'}
          >
            ↻ Новая игра
          </button>
        </div>

        {/* Online Bets */}
        {onlineBets.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-8">
            <h3 className="text-white font-bold text-lg px-6 py-4 border-b border-slate-700">👥 Ставки игроков онлайн ({onlineBets.length + (playerBet ? 1 : 0)})</h3>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-80 overflow-y-auto">
              {playerBet && (
                <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-xl p-3 border-2 border-cyan-500 shadow-lg shadow-cyan-500/30">
                  <div className="mb-2 h-16 overflow-hidden rounded-lg bg-black/20">
                    <img
                      src={playerBet.item.image_url}
                      alt={playerBet.item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-cyan-300 text-xs font-bold mb-1">👤 {playerBet.playerName}</p>
                  <p className="text-white text-xs font-bold truncate mb-1">{playerBet.item.name}</p>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-white text-[7px] font-bold">
                      V
                    </div>
                    <span className="text-white text-xs font-bold">{playerBet.amount.toFixed(1)}</span>
                  </div>
                  <div className={`mt-2 px-2 py-1 rounded text-center text-xs font-bold ${
                    playerBet.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    playerBet.status === 'won' ? 'bg-green-500/20 text-green-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {playerBet.status === 'pending' ? '⏳' : playerBet.status === 'won' ? '✅' : '❌'}
                    {playerBet.multiplier && ` ${playerBet.multiplier.toFixed(2)}x`}
                  </div>
                </div>
              )}
              {onlineBets.map((bet) => (
                <div
                  key={bet.id}
                  className={`rounded-xl p-3 border-2 ${
                    bet.status === 'pending'
                      ? 'bg-slate-700/50 border-slate-600'
                      : bet.status === 'won'
                      ? 'bg-green-600/20 border-green-500'
                      : 'bg-red-600/20 border-red-500'
                  }`}
                >
                  <div className="mb-2 h-16 overflow-hidden rounded-lg bg-black/20">
                    <img
                      src={bet.item.image_url}
                      alt={bet.item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-gray-300 text-xs font-bold mb-1">👤 {bet.playerName}</p>
                  <p className="text-white text-xs font-bold truncate mb-1">{bet.item.name}</p>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-white text-[7px] font-bold">
                      V
                    </div>
                    <span className="text-white text-xs font-bold">{bet.amount.toFixed(1)}</span>
                  </div>
                  <div className={`mt-2 px-2 py-1 rounded text-center text-xs font-bold ${
                    bet.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    bet.status === 'won' ? 'bg-green-500/20 text-green-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {bet.status === 'pending' ? '⏳' : bet.status === 'won' ? '✅' : '❌'}
                    {bet.multiplier && ` ${bet.multiplier.toFixed(2)}x`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <h3 className="text-white font-bold text-lg px-6 py-4 border-b border-slate-700">📦 Выберите предмет для ставки</h3>
          {inventory.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400">В вашем инвентаре нет предметов</p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {inventory.map((item, idx) => {
                const rarityStyle = getRarityStyle(item.rarity);
                const isSelected = selectedItemIndex === idx;

                return (
                  <div
                    key={`crash-${idx}`}
                    onClick={() => {
                      if (gameState === 'waiting' && !selectedItem) {
                        handleBet(idx);
                      }
                    }}
                    className={`group ${rarityStyle.bg} rounded-xl p-3 border-2 ${rarityStyle.border} ${rarityStyle.shadow} transition-all ${
                      gameState === 'waiting' && !selectedItem
                        ? 'cursor-pointer hover:scale-110'
                        : gameState === 'playing'
                        ? 'opacity-50 cursor-not-allowed'
                        : 'opacity-50 cursor-not-allowed'
                    } ${isSelected ? 'ring-4 ring-cyan-500 scale-110' : ''}`}
                  >
                    <div className="mb-2 h-20 overflow-hidden rounded-lg bg-black/20">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <p className="text-white text-xs font-bold truncate">{item.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <div className="w-3 h-3 bg-white/90 rounded-full flex items-center justify-center text-slate-900 text-[8px] font-bold">
                        V
                      </div>
                      <span className="text-white text-xs font-bold">{item.price}</span>
                    </div>
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
