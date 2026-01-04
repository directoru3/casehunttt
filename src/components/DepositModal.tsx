import { X, Star, Sparkles, AlertCircle, Wallet } from 'lucide-react';
import { useState } from 'react';
import TonIcon from './TonIcon';
import { telegramPayments } from '../utils/telegramPayments';
import { useTonPayments } from '../utils/tonPayments';
import { telegramAuth } from '../utils/telegramAuth';

interface DepositModalProps {
  onClose: () => void;
  onDeposit: (amount: number) => void;
  currentBalance: number;
}

type PaymentMethod = 'stars' | 'ton';

const STARS_PRESET_AMOUNTS = [
  { stars: 100, coins: 10, bonus: '0%' },
  { stars: 500, coins: 50, bonus: '0%' },
  { stars: 1000, coins: 100, bonus: '0%' },
  { stars: 5000, coins: 500, bonus: '0%' },
];

const TON_PRESET_AMOUNTS = [
  { ton: 1, coins: 10 },
  { ton: 5, coins: 50 },
  { ton: 10, coins: 100 },
  { ton: 25, coins: 250 },
];

const STARS_TO_COINS_RATE = 0.1;
const TON_TO_COINS_RATE = 10;

export default function DepositModal({ onClose, onDeposit, currentBalance }: DepositModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stars');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const tonPayments = useTonPayments();

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
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

  const calculateCoins = (amount: number): number => {
    const rate = paymentMethod === 'stars' ? STARS_TO_COINS_RATE : TON_TO_COINS_RATE;
    return Math.round(amount * rate * 100) / 100;
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setSelectedAmount(null);
    setCustomAmount('');
    setError(null);
  };

  const handleDeposit = async () => {
    if (!selectedAmount || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const coinsToAdd = calculateCoins(selectedAmount);
      let result;

      if (paymentMethod === 'stars') {
        console.log('[DepositModal] Starting Telegram Stars payment');
        console.log('[DepositModal] WebApp available:', telegramPayments.isAvailable());
        console.log('[DepositModal] Window.Telegram:', !!window.Telegram);
        console.log('[DepositModal] Window.Telegram.WebApp:', !!window.Telegram?.WebApp);

        if (!telegramPayments.isAvailable()) {
          const errorMsg = 'Telegram WebApp not detected. Please open this app through Telegram.';
          console.error('[DepositModal]', errorMsg);
          throw new Error(errorMsg);
        }
        result = await telegramPayments.processPayment(selectedAmount, coinsToAdd);
      } else {
        const userId = telegramAuth.getCurrentUser()?.id;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        if (!tonPayments.isWalletConnected()) {
          setError('Please connect your TON wallet first');
          const connected = await tonPayments.connectWallet();
          if (!connected) {
            throw new Error('Wallet connection failed');
          }
        }

        result = await tonPayments.sendPayment(selectedAmount, userId);
      }

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

  const presetAmounts = paymentMethod === 'stars' ? STARS_PRESET_AMOUNTS : TON_PRESET_AMOUNTS;
  const currency = paymentMethod === 'stars' ? 'Stars' : 'TON';
  const currencyIcon = paymentMethod === 'stars' ? <Star size={20} className="text-yellow-500 fill-yellow-500" /> : <TonIcon className="w-5 h-5" />;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-md w-full border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/20 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4 md:p-6 relative overflow-hidden sticky top-0 z-10">
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
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Star size={20} className="md:w-6 md:h-6 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Deposit</h2>
                <p className="text-white/80 text-xs md:text-sm">Choose payment method</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-white hover:text-gray-200 transition-colors disabled:opacity-50 p-1 md:p-2"
            >
              <X size={24} className="md:w-7 md:h-7" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="bg-gray-800/50 rounded-xl p-3 md:p-4 mb-4 md:mb-6 border border-gray-700">
            <p className="text-gray-400 text-xs md:text-sm mb-1">Current Balance</p>
            <div className="flex items-center gap-2">
              <TonIcon className="w-5 h-5 md:w-6 md:h-6" />
              <p className="text-white text-2xl md:text-3xl font-bold">{currentBalance.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-4 md:mb-6">
            <p className="text-white font-semibold mb-3 text-sm md:text-base">Payment Method</p>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <button
                onClick={() => handlePaymentMethodChange('stars')}
                disabled={isProcessing}
                className={`min-h-[56px] md:min-h-[64px] p-3 md:p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 md:gap-2 touch-manipulation ${
                  paymentMethod === 'stars'
                    ? 'bg-yellow-600/20 border-yellow-500 shadow-lg shadow-yellow-500/30'
                    : 'bg-gray-800/50 border-gray-700 hover:border-yellow-500/50'
                } disabled:opacity-50`}
              >
                <Star size={24} className="md:w-7 md:h-7 text-yellow-500 fill-yellow-500" />
                <span className="text-white font-bold text-sm md:text-base">Telegram Stars</span>
              </button>
              <button
                onClick={() => handlePaymentMethodChange('ton')}
                disabled={isProcessing}
                className={`min-h-[56px] md:min-h-[64px] p-3 md:p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 md:gap-2 touch-manipulation ${
                  paymentMethod === 'ton'
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/30'
                    : 'bg-gray-800/50 border-gray-700 hover:border-blue-500/50'
                } disabled:opacity-50`}
              >
                <Wallet size={24} className="md:w-7 md:h-7 text-blue-500" />
                <span className="text-white font-bold text-sm md:text-base">TON Wallet</span>
              </button>
            </div>
          </div>

          <div className="mb-4 md:mb-6">
            <p className="text-white font-semibold mb-3 flex items-center gap-2 text-sm md:text-base">
              <Sparkles size={16} className="text-yellow-500" />
              Select Amount
            </p>

            <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
              {presetAmounts.map((preset) => {
                const amount = paymentMethod === 'stars' ? preset.stars : (preset as any).ton;
                const bonus = paymentMethod === 'stars' ? (preset as any).bonus : null;
                return (
                  <button
                    key={amount}
                    onClick={() => handlePresetClick(amount)}
                    disabled={isProcessing}
                    className={`relative min-h-[72px] md:min-h-[80px] p-3 md:p-4 rounded-xl border-2 transition-all touch-manipulation ${
                      selectedAmount === amount
                        ? 'bg-yellow-600/20 border-yellow-500 shadow-lg shadow-yellow-500/30'
                        : 'bg-gray-800/50 border-gray-700 hover:border-yellow-500/50'
                    } disabled:opacity-50`}
                  >
                    {bonus && bonus !== '0%' && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                        {bonus}
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                      {currencyIcon}
                      <span className="text-white font-bold text-lg md:text-xl">{amount}</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TonIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="text-gray-300 text-xs md:text-sm font-semibold">
                          {preset.coins} TON
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder={`Custom amount (${currency})`}
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                disabled={isProcessing}
                className="w-full min-h-[48px] md:min-h-[52px] bg-gray-800 border-2 border-gray-700 focus:border-yellow-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-50 text-base"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {currencyIcon}
              </div>
            </div>
          </div>

          {selectedAmount && (
            <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-3 md:p-4 mb-4 md:mb-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-xs md:text-sm">You pay:</span>
                <div className="flex items-center gap-1.5 md:gap-2">
                  {currencyIcon}
                  <span className="text-white font-bold text-base md:text-lg">{selectedAmount}</span>
                  <span className="text-gray-400 text-xs md:text-sm">{currency}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-xs md:text-sm">You receive:</span>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <TonIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-white font-bold text-base md:text-lg">
                    {calculateCoins(selectedAmount)}
                  </span>
                  <span className="text-gray-400 text-xs md:text-sm">TON</span>
                </div>
              </div>

              <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-blue-500/20">
                <p className="text-gray-400 text-xs text-center">
                  Exchange rate: 1 {currency} = {paymentMethod === 'stars' ? STARS_TO_COINS_RATE : TON_TO_COINS_RATE} TON
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 md:p-4 bg-red-900/30 border border-red-500 rounded-xl flex items-start gap-2 md:gap-3 animate-shake">
              <AlertCircle size={18} className="md:w-5 md:h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-200 font-semibold text-xs md:text-sm">Payment Error</p>
                <p className="text-red-300 text-[10px] md:text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 md:p-4 bg-green-900/30 border border-green-500 rounded-xl flex items-start gap-2 md:gap-3 animate-pulse">
              <Sparkles size={18} className="md:w-5 md:h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-200 font-semibold text-xs md:text-sm">Payment Successful!</p>
                <p className="text-green-300 text-[10px] md:text-xs mt-1">Your balance has been updated</p>
              </div>
            </div>
          )}

          <button
            onClick={handleDeposit}
            disabled={!selectedAmount || isProcessing || success}
            className="w-full min-h-[56px] md:min-h-[64px] bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-yellow-500/50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base md:text-lg touch-manipulation"
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
                {paymentMethod === 'stars' ? (
                  <>
                    <Star size={20} className="fill-white" />
                    <span>Pay with Telegram Stars</span>
                  </>
                ) : (
                  <>
                    <Wallet size={20} />
                    <span>Pay with TON Wallet</span>
                  </>
                )}
              </>
            )}
          </button>

          <div className="mt-3 md:mt-4 p-2.5 md:p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 text-[10px] md:text-xs text-center flex items-center justify-center gap-2">
              <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
              <span>Secure payment through {paymentMethod === 'stars' ? 'Telegram' : 'TON Blockchain'}</span>
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
