import { X, Star, Sparkles, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import TonIcon from './TonIcon';
import { telegramPayments } from '../utils/telegramPayments';

interface DepositModalProps {
  onClose: () => void;
  onDeposit: (amount: number) => void;
  currentBalance: number;
}

const PRESET_AMOUNTS = [
  { stars: 100, coins: 10 },
  { stars: 500, coins: 50 },
  { stars: 1000, coins: 100 },
  { stars: 2500, coins: 250 },
];

const STARS_TO_COINS_RATE = 0.1;

export default function DepositModal({ onClose, onDeposit, currentBalance }: DepositModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePresetClick = (stars: number) => {
    setSelectedAmount(stars);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue);
      setCustomAmount(value);
    } else if (value === '') {
      setSelectedAmount(null);
      setCustomAmount('');
    }
  };

  const calculateCoins = (stars: number): number => {
    return Math.round(stars * STARS_TO_COINS_RATE * 100) / 100;
  };

  const handleDeposit = async () => {
    if (!selectedAmount || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      if (!telegramPayments.isAvailable()) {
        throw new Error('Telegram WebApp not available. Please open this app in Telegram.');
      }

      const coinsToAdd = calculateCoins(selectedAmount);
      const result = await telegramPayments.processPayment(selectedAmount, coinsToAdd);

      if (result.success && result.newBalance !== undefined) {
        setSuccess(true);
        onDeposit(result.newBalance);

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-md w-full border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/20 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className="absolute text-white animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Star size={24} className="text-white fill-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Deposit</h2>
                <p className="text-white/80 text-sm">Via Telegram Stars</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Current Balance</p>
            <div className="flex items-center gap-2">
              <TonIcon className="w-6 h-6" />
              <p className="text-white text-3xl font-bold">{currentBalance.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-500" />
              Select Amount
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset.stars}
                  onClick={() => handlePresetClick(preset.stars)}
                  disabled={isProcessing}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedAmount === preset.stars
                      ? 'bg-yellow-600/20 border-yellow-500 shadow-lg shadow-yellow-500/30'
                      : 'bg-gray-800/50 border-gray-700 hover:border-yellow-500/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-white font-bold text-xl">{preset.stars}</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TonIcon className="w-4 h-4" />
                      <span className="text-gray-300 text-sm font-semibold">
                        {preset.coins} TON
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="Custom amount (Stars)"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-gray-800 border-2 border-gray-700 focus:border-yellow-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-50"
              />
              <Star
                size={20}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-500 fill-yellow-500"
              />
            </div>
          </div>

          {selectedAmount && (
            <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-4 mb-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">You pay:</span>
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-white font-bold text-lg">{selectedAmount}</span>
                  <span className="text-gray-400 text-sm">Stars</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">You receive:</span>
                <div className="flex items-center gap-2">
                  <TonIcon className="w-5 h-5" />
                  <span className="text-white font-bold text-lg">
                    {calculateCoins(selectedAmount)}
                  </span>
                  <span className="text-gray-400 text-sm">TON</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-blue-500/20">
                <p className="text-gray-400 text-xs text-center">
                  Exchange rate: 1 Star = {STARS_TO_COINS_RATE} TON
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-500 rounded-xl flex items-start gap-3 animate-shake">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-200 font-semibold text-sm">Payment Error</p>
                <p className="text-red-300 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-900/30 border border-green-500 rounded-xl flex items-start gap-3 animate-pulse">
              <Sparkles size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-200 font-semibold text-sm">Payment Successful!</p>
                <p className="text-green-300 text-xs mt-1">Your balance has been updated</p>
              </div>
            </div>
          )}

          <button
            onClick={handleDeposit}
            disabled={!selectedAmount || isProcessing || success}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-yellow-500/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : success ? (
              <>
                <Sparkles size={20} className="fill-white" />
                <span>Success!</span>
              </>
            ) : (
              <>
                <Star size={20} className="fill-white" />
                <span>Pay with Telegram Stars</span>
              </>
            )}
          </button>

          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 text-xs text-center flex items-center justify-center gap-2">
              <Sparkles size={14} />
              <span>Secure payment through Telegram</span>
            </p>
          </div>

          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
            .animate-shake {
              animation: shake 0.3s ease-in-out;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
