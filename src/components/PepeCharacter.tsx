import { useEffect, useState } from 'react';

interface PepeCharacterProps {
  emotion?: 'idle' | 'excited' | 'happy' | 'celebrating';
  size?: 'small' | 'medium' | 'large';
}

export default function PepeCharacter({ emotion = 'idle', size = 'medium' }: PepeCharacterProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (emotion === 'excited' || emotion === 'celebrating') {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 600);
      return () => clearTimeout(timer);
    }
  }, [emotion]);

  const sizeClasses = {
    small: 'w-16 h-16 md:w-20 md:h-20',
    medium: 'w-24 h-24 md:w-32 md:h-32',
    large: 'w-32 h-32 md:w-40 md:h-40'
  };

  const getEmotionStyles = () => {
    switch (emotion) {
      case 'excited':
        return 'animate-bounce-excited';
      case 'happy':
        return 'animate-wiggle';
      case 'celebrating':
        return 'animate-celebrate';
      default:
        return 'animate-breathe';
    }
  };

  return (
    <div className={`${sizeClasses[size]} relative ${bounce ? 'animate-bounce-once' : ''}`}>
      <div className={`w-full h-full relative ${getEmotionStyles()}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full blur-xl opacity-30 animate-pulse"></div>

        <div className="relative w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            <ellipse cx="50" cy="55" rx="35" ry="38" fill="#3D8B3D" />

            <ellipse cx="50" cy="52" rx="32" ry="35" fill="#4CAF50" />

            <ellipse cx="35" cy="45" rx="8" ry="10" fill="white" />
            <ellipse cx="65" cy="45" rx="8" ry="10" fill="white" />

            {!isBlinking ? (
              <>
                <circle cx="35" cy="46" r="4" fill="#1a1a1a" />
                <circle cx="65" cy="46" r="4" fill="#1a1a1a" />
                <circle cx="36" cy="45" r="1.5" fill="white" />
                <circle cx="66" cy="45" r="1.5" fill="white" />
              </>
            ) : (
              <>
                <line x1="30" y1="46" x2="40" y2="46" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
                <line x1="60" y1="46" x2="70" y2="46" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
              </>
            )}

            {emotion === 'happy' || emotion === 'celebrating' ? (
              <path d="M 30 65 Q 50 75 70 65" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
            ) : (
              <path d="M 30 65 Q 50 68 70 65" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
            )}

            {(emotion === 'happy' || emotion === 'celebrating') && (
              <ellipse cx="50" cy="70" rx="8" ry="5" fill="#FF6B9D" opacity="0.6" />
            )}
          </svg>
        </div>

        {emotion === 'celebrating' && (
          <div className="absolute -top-4 -right-4 animate-bounce">
            <span className="text-2xl">🎉</span>
          </div>
        )}

        {emotion === 'excited' && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <span className="text-xl animate-pulse">❗</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.02) translateY(-2px); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        @keyframes bounce-excited {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes celebrate {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-10deg) scale(1.1); }
          75% { transform: rotate(10deg) scale(1.1); }
        }
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-breathe {
          animation: breathe 3s ease-in-out infinite;
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }
        .animate-bounce-excited {
          animation: bounce-excited 0.6s ease-in-out infinite;
        }
        .animate-celebrate {
          animation: celebrate 0.8s ease-in-out infinite;
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
