import { useState, useEffect } from 'react';
import { Sparkles, Zap, Star, Crown } from 'lucide-react';
import { Item } from '../lib/supabase';
import { getRarityStyle } from '../utils/rarityStyles';
import TonIcon from './TonIcon';

interface ItemRevealCardProps {
  item: Item;
  delay?: number;
  onRevealComplete?: () => void;
}

export default function ItemRevealCard({ item, delay = 0, onRevealComplete }: ItemRevealCardProps) {
  const [phase, setPhase] = useState<'hidden' | 'flying' | 'landing' | 'revealed'>('hidden');
  const rarityStyle = getRarityStyle(item.rarity);

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('flying'), delay);
    const timer2 = setTimeout(() => setPhase('landing'), delay + 600);
    const timer3 = setTimeout(() => setPhase('revealed'), delay + 1000);
    const timer4 = setTimeout(() => {
      if (onRevealComplete) onRevealComplete();
    }, delay + 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [delay, onRevealComplete]);

  const getRarityIcon = () => {
    switch (item.rarity) {
      case 'legendary':
        return <Crown className="text-yellow-300" size={24} />;
      case 'mythical':
        return <Zap className="text-purple-400" size={24} />;
      case 'rare':
        return <Star className="text-blue-400" size={24} />;
      default:
        return <Sparkles className="text-green-400" size={20} />;
    }
  };

  const getRarityParticles = () => {
    const particleCount = item.rarity === 'legendary' ? 50 : item.rarity === 'mythical' ? 30 : 20;
    return Array.from({ length: particleCount }, (_, i) => (
      <div
        key={i}
        className="absolute particle"
        style={{
          left: '50%',
          top: '50%',
          width: item.rarity === 'legendary' ? '8px' : '4px',
          height: item.rarity === 'legendary' ? '8px' : '4px',
          animationDelay: `${i * 0.02}s`,
          '--tx': `${(Math.random() - 0.5) * 200}px`,
          '--ty': `${(Math.random() - 0.5) * 200}px`,
        } as React.CSSProperties}
      />
    ));
  };

  const getScreenEffect = () => {
    if (item.rarity === 'legendary') {
      return (
        <div className="fixed inset-0 z-[200] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 animate-pulse-fast" />
          {Array.from({ length: 100 }, (_, i) => (
            <Star
              key={i}
              size={Math.random() * 20 + 10}
              className="absolute text-yellow-400 fill-yellow-400 animate-float-random"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 2 + 2}s`,
              }}
            />
          ))}
        </div>
      );
    }
    if (item.rarity === 'mythical') {
      return (
        <div className="fixed inset-0 z-[200] pointer-events-none">
          <div className="absolute inset-0 bg-purple-900/20 animate-pulse" />
          {Array.from({ length: 50 }, (_, i) => (
            <Sparkles
              key={i}
              size={15}
              className="absolute text-purple-400 animate-float-random"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {phase !== 'hidden' && (item.rarity === 'legendary' || item.rarity === 'mythical') && getScreenEffect()}

      <div
        className={`relative ${rarityStyle.bg} rounded-xl p-4 border-2 ${rarityStyle.border} ${rarityStyle.shadow} overflow-hidden transition-all duration-500 ${
          phase === 'hidden' ? 'opacity-0 scale-50' : ''
        } ${
          phase === 'flying' ? 'opacity-100 scale-150 -translate-y-32' : ''
        } ${
          phase === 'landing' ? 'opacity-100 scale-110 translate-y-2' : ''
        } ${
          phase === 'revealed' ? 'opacity-100 scale-100 translate-y-0' : ''
        }`}
      >
        {phase !== 'hidden' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute inset-0 ${rarityStyle.glow} animate-pulse-slow`} />
            {getRarityParticles()}
          </div>
        )}

        <div className="relative z-10 mb-3">
          <div className="absolute -top-2 -right-2 z-20 animate-bounce-slow">
            {getRarityIcon()}
          </div>
          <img
            src={item.image_url}
            alt={item.name}
            className={`w-full aspect-square object-cover rounded-lg border-2 border-white/30 transition-transform duration-500 ${
              phase === 'revealed' ? 'scale-100' : 'scale-90'
            }`}
          />
          {phase === 'revealed' && (
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-scale-in">
              WON!
            </div>
          )}
        </div>

        <p className="text-white font-bold text-sm mb-1 truncate">{item.name}</p>
        <p className={`${rarityStyle.text} text-xs capitalize font-semibold mb-2`}>
          {item.rarity}
        </p>
        <div className="flex items-center gap-1 justify-center">
          <TonIcon className="w-4 h-4" />
          <span className="text-white text-sm font-bold">{item.price}</span>
        </div>
      </div>

      <style>{`
        @keyframes float-random {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(var(--random-x, 50px), 100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          animation: particle-burst 1s ease-out forwards;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
        }
        @keyframes particle-burst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
        .animate-float-random {
          animation: float-random linear infinite;
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.5s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
}
