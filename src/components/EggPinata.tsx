import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface Crack {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

interface EggPinataProps {
  isOpen?: boolean;
  onBreak?: () => void;
  tapsRequired?: number;
  variant?: 'normal' | 'golden' | 'diamond';
  autoBreak?: boolean;
}

export default function EggPinata({
  isOpen = false,
  onBreak,
  tapsRequired = 3,
  variant = 'normal',
  autoBreak = false
}: EggPinataProps) {
  const [taps, setTaps] = useState(0);
  const [cracks, setCracks] = useState<Crack[]>([]);
  const [shake, setShake] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (autoBreak && !isOpen && !breaking) {
      const timer = setTimeout(() => {
        handleBreak();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoBreak, isOpen, breaking]);

  const getEggColors = () => {
    switch (variant) {
      case 'golden':
        return {
          gradient: 'from-yellow-300 via-yellow-400 to-yellow-600',
          shadow: 'shadow-yellow-500/50',
          glow: 'shadow-yellow-400/40',
          shine: 'from-yellow-200/40 via-white/60 to-transparent'
        };
      case 'diamond':
        return {
          gradient: 'from-cyan-300 via-blue-400 to-purple-600',
          shadow: 'shadow-blue-500/50',
          glow: 'shadow-cyan-400/40',
          shine: 'from-cyan-200/40 via-white/60 to-transparent'
        };
      default:
        return {
          gradient: 'from-blue-300 via-purple-400 to-pink-500',
          shadow: 'shadow-purple-500/50',
          glow: 'shadow-purple-400/40',
          shine: 'from-blue-200/40 via-white/60 to-transparent'
        };
    }
  };

  const colors = getEggColors();

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOpen || breaking || autoBreak) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newTaps = taps + 1;
    setTaps(newTaps);

    const newCrack: Crack = {
      id: Date.now() + Math.random(),
      x,
      y,
      rotation: Math.random() * 360
    };
    setCracks(prev => [...prev, newCrack]);

    setShake(true);
    setTimeout(() => setShake(false), 200);

    if (newTaps >= tapsRequired) {
      handleBreak();
    }
  };

  const handleBreak = () => {
    setBreaking(true);

    const particleCount = 20;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 100,
      y: 50 + (Math.random() - 0.5) * 100
    }));
    setParticles(newParticles);

    setTimeout(() => {
      onBreak?.();
    }, 400);
  };

  if (isOpen || breaking) {
    return (
      <div className="relative w-48 h-64 md:w-64 md:h-80 flex items-center justify-center">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-4 h-4 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-white via-purple-300 to-pink-400 animate-particle-explode"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${Math.random() * 0.1}s`
            }}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse-glow flex items-center justify-center">
            <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-white animate-spin-slow" />
          </div>
        </div>

        <style>{`
          @keyframes particle-explode {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(var(--tx, 0), var(--ty, 0)) scale(0);
              opacity: 0;
            }
          }
          .animate-particle-explode {
            --tx: ${Math.random() * 200 - 100}px;
            --ty: ${Math.random() * 200 - 100}px;
            animation: particle-explode 0.6s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={`relative w-48 h-64 md:w-64 md:h-80 cursor-pointer select-none ${shake ? 'animate-shake' : ''}`}
      onClick={handleTap}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} rounded-[45%_45%_45%_45%/60%_60%_40%_40%] ${colors.shadow} shadow-2xl transform transition-transform hover:scale-105 ${colors.glow}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.shine} rounded-[45%_45%_45%_45%/60%_60%_40%_40%] animate-shine-slow`}></div>

        <div className="absolute inset-x-0 top-[20%] h-[30%] bg-white/20 rounded-full blur-2xl"></div>

        {variant === 'golden' && (
          <>
            <div className="absolute top-[30%] left-[30%] w-8 h-1 bg-yellow-600/30 rounded-full transform -rotate-45"></div>
            <div className="absolute top-[50%] right-[25%] w-6 h-1 bg-yellow-600/30 rounded-full transform rotate-45"></div>
            <div className="absolute bottom-[35%] left-[35%] w-10 h-1 bg-yellow-600/30 rounded-full transform -rotate-12"></div>
          </>
        )}

        {variant === 'diamond' && (
          <>
            <div className="absolute top-[25%] left-[40%] w-2 h-2 bg-white/60 rounded-full animate-twinkle"></div>
            <div className="absolute top-[45%] right-[30%] w-3 h-3 bg-white/60 rounded-full animate-twinkle" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute bottom-[30%] left-[35%] w-2 h-2 bg-white/60 rounded-full animate-twinkle" style={{ animationDelay: '0.6s' }}></div>
          </>
        )}

        {cracks.map((crack) => (
          <svg
            key={crack.id}
            className="absolute inset-0 w-full h-full pointer-events-none animate-crack-appear"
            style={{
              transformOrigin: `${crack.x}% ${crack.y}%`,
              transform: `rotate(${crack.rotation}deg)`
            }}
          >
            <path
              d={`M ${crack.x} ${crack.y} L ${crack.x + 10} ${crack.y + 15} M ${crack.x} ${crack.y} L ${crack.x - 8} ${crack.y + 12} M ${crack.x} ${crack.y} L ${crack.x + 5} ${crack.y - 10}`}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        ))}

        {taps > 0 && !autoBreak && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
            <p className="text-white text-sm font-bold">
              {tapsRequired - taps} tap{tapsRequired - taps !== 1 ? 's' : ''} left!
            </p>
          </div>
        )}
      </div>

      {!autoBreak && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce pointer-events-none">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            TAP ME!
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-5px) rotate(-2deg); }
          75% { transform: translateX(5px) rotate(2deg); }
        }
        @keyframes shine-slow {
          0% { opacity: 0.3; transform: translateX(-100%) translateY(-100%); }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; transform: translateX(100%) translateY(100%); }
        }
        @keyframes crack-appear {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.6); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out;
        }
        .animate-shine-slow {
          animation: shine-slow 4s ease-in-out infinite;
        }
        .animate-crack-appear {
          animation: crack-appear 0.3s ease-out forwards;
        }
        .animate-pulse-glow {
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
