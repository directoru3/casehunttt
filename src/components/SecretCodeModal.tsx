import { X, Gift, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SecretCodeModalProps {
  onClose: () => void;
  onSuccess: (caseId: string, usesLeft: number) => void;
  userId: string;
}

export default function SecretCodeModal({ onClose, onSuccess, userId }: SecretCodeModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter a secret code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/use-secret-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId,
            code: code.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess(data.caseId, 0);
        }, 2000);
      } else {
        if (data.alreadyUsed) {
          setError(data.usedAt ? `Already used on ${data.usedAt}` : 'You have already used this code');
        } else {
          setError(data.error || 'Invalid code');
        }
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-md w-full p-6 relative border border-gray-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/50">
              <Gift size={40} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles size={20} className="text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Secret Code</h2>
          <p className="text-gray-400">
            Enter your code to unlock a free gift case!
          </p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Sparkles size={48} className="text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">Secret Code Activated!</h3>
            <p className="text-gray-300">Your free case is ready to open</p>
            <p className="text-yellow-400 text-sm mt-2">⚠️ This code can only be used once</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE HERE"
                className="w-full bg-gray-800/50 border-2 border-gray-700 focus:border-yellow-500 rounded-xl px-4 py-3 text-white text-center text-lg font-bold uppercase tracking-wider transition-all outline-none"
                disabled={isLoading}
                maxLength={20}
              />
              <p className="text-yellow-400 text-xs mt-2 text-center font-semibold">
                ⚠️ One-time use only per user
              </p>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-xl p-3 text-center">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all shadow-2xl hover:shadow-yellow-500/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Gift size={20} />
                  <span>Activate Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="mt-6 bg-gray-800/30 rounded-xl p-4 border border-gray-700">
          <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400" />
            How it works
          </h4>
          <ul className="space-y-1 text-gray-400 text-xs">
            <li>• Enter your secret code above</li>
            <li>• Get instant access to Free Gift case</li>
            <li>• ⚠️ Each code can only be used once</li>
            <li>• Win exclusive items from the free case!</li>
          </ul>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            >
              <Sparkles
                size={10 + Math.random() * 10}
                className="text-yellow-400 opacity-30"
              />
            </div>
          ))}
        </div>

        <style>{`
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
          }
          .animate-float {
            animation: float linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
