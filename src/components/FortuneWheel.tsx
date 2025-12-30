import React, { useEffect, useRef, useState } from 'react';

interface WheelItem {
  name: string;
  rarity: string;
  image: string;
  color: string;
}

interface FortuneWheelProps {
  items: WheelItem[];
  winningIndex: number;
  isSpinning: boolean;
  onSpinComplete: () => void;
}

const rarityColors: Record<string, string> = {
  legendary: '#FFD700',
  mythical: '#9D4EDD',
  rare: '#3B82F6',
  uncommon: '#10B981',
  common: '#6B7280'
};

const rarityGlows: Record<string, string> = {
  legendary: 'rgba(255, 215, 0, 0.6)',
  mythical: 'rgba(157, 78, 221, 0.6)',
  rare: 'rgba(59, 130, 246, 0.6)',
  uncommon: 'rgba(16, 185, 129, 0.6)',
  common: 'rgba(107, 116, 128, 0.4)'
};

export const FortuneWheel: React.FC<FortuneWheelProps> = ({
  items = [],
  winningIndex = 0,
  isSpinning,
  onSpinComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [isAnticipating, setIsAnticipating] = useState(false);
  const [highlightedSegment, setHighlightedSegment] = useState(-1);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const loadedCountRef = useRef(0);

  useEffect(() => {
    if (items.length === 0) return;

    loadedCountRef.current = 0;
    setImagesLoaded(false);

    const checkAllLoaded = () => {
      if (loadedCountRef.current >= items.length) {
        setImagesLoaded(true);
      }
    };

    items.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        console.warn(`Invalid item at index ${index}:`, item);
        loadedCountRef.current++;
        checkAllLoaded();
        return;
      }

      if (!item.image) {
        loadedCountRef.current++;
        checkAllLoaded();
        return;
      }

      if (imagesRef.current[item.image] && imagesRef.current[item.image].complete) {
        loadedCountRef.current++;
        checkAllLoaded();
      } else if (!imagesRef.current[item.image]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          loadedCountRef.current++;
          checkAllLoaded();
        };
        img.onerror = () => {
          console.error('Failed to load image:', item.image);
          loadedCountRef.current++;
          checkAllLoaded();
        };
        img.src = item.image;
        imagesRef.current[item.image] = img;
      }
    });

    if (items.length === 0) {
      setImagesLoaded(true);
    }
  }, [items]);

  useEffect(() => {
    if (!isSpinning) {
      setHighlightedSegment(-1);
      return;
    }

    setIsAnticipating(true);

    const anticipationDuration = 300;
    setTimeout(() => {
      setIsAnticipating(false);

      const duration = 6000;
      const extraSpins = 7;
      const segmentAngle = 360 / items.length;
      const targetRotation = 360 * extraSpins + (360 - (winningIndex * segmentAngle) - segmentAngle / 2);

      const easeOutBounce = (t: number): number => {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
      };

      const animate = (currentTime: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = currentTime;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        const easeProgress = easeOutBounce(progress);
        const currentRotation = targetRotation * easeProgress;

        setRotation(currentRotation);

        const currentSegment = Math.floor((currentRotation % 360) / segmentAngle);
        if (progress > 0.7) {
          setHighlightedSegment(currentSegment % items.length);
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          startTimeRef.current = undefined;
          setHighlightedSegment(winningIndex);
          setTimeout(() => {
            onSpinComplete();
          }, 500);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }, anticipationDuration);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, winningIndex, items.length, onSpinComplete]);

  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (!Array.isArray(items) || items.length === 0) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 15;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.save();
    ctx.translate(centerX, centerY);

    const shakeAmount = isAnticipating ? Math.sin(Date.now() / 50) * 3 : 0;
    ctx.rotate(((rotation + shakeAmount) * Math.PI) / 180);

    const segmentAngle = (2 * Math.PI) / items.length;

    items.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        return;
      }

      const startAngle = index * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      const isHighlighted = index === highlightedSegment;
      const color = rarityColors[item.rarity] || '#6B7280';
      const gradient = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);

      if (isHighlighted) {
        gradient.addColorStop(0, adjustBrightness(color, 80));
        gradient.addColorStop(0.6, adjustBrightness(color, 40));
        gradient.addColorStop(1, color);
      } else {
        gradient.addColorStop(0, adjustBrightness(color, 40));
        gradient.addColorStop(0.6, color);
        gradient.addColorStop(1, adjustBrightness(color, -40));
      }

      ctx.fillStyle = gradient;
      ctx.fill();

      const glowColor = rarityGlows[item.rarity] || 'rgba(107, 116, 128, 0.4)';
      ctx.strokeStyle = isHighlighted ? adjustBrightness(color, 60) : glowColor;
      ctx.lineWidth = isHighlighted ? 5 : 3;
      ctx.shadowColor = isHighlighted ? color : glowColor;
      ctx.shadowBlur = isHighlighted ? 25 : 15;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
      ctx.stroke();

      if (item && item.image) {
        const img = imagesRef.current[item.image];
        if (img && img.complete && img.naturalWidth > 0) {
          try {
            ctx.save();
            ctx.rotate(startAngle + segmentAngle / 2);
            const imgSize = 50;
            const imgX = radius * 0.65 - imgSize / 2;
            const imgY = -imgSize / 2;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(radius * 0.65, 0, imgSize / 2 + 2, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
            ctx.restore();
          } catch (err) {
            console.error('Error drawing image:', err);
            ctx.restore();
          }
        }
      }
    });

    ctx.restore();

    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.moveTo(centerX, 15);
    ctx.lineTo(centerX - 18, 50);
    ctx.lineTo(centerX + 18, 50);
    ctx.closePath();
    const pointerGradient = ctx.createLinearGradient(centerX, 15, centerX, 50);
    pointerGradient.addColorStop(0, '#FF6B6B');
    pointerGradient.addColorStop(1, '#FF0000');
    ctx.fillStyle = pointerGradient;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.shadowBlur = 30;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 45, 0, 2 * Math.PI);
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 45);
    centerGradient.addColorStop(0, '#3B82F6');
    centerGradient.addColorStop(1, '#1E40AF');
    ctx.fillStyle = centerGradient;
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('SPIN', centerX, centerY);
    } catch (error) {
      console.error('Error rendering wheel:', error);
      setRenderError(true);
    }
  }, [items, rotation, imagesLoaded, highlightedSegment, isAnticipating]);

  const adjustBrightness = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  };

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="relative flex items-center justify-center w-[400px] h-[400px]">
        <p className="text-gray-400">Loading wheel...</p>
      </div>
    );
  }

  if (renderError) {
    return (
      <div className="relative flex items-center justify-center w-[400px] h-[400px]">
        <p className="text-red-400">Error loading wheel</p>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center transition-all duration-300 ${isAnticipating ? 'animate-anticipation' : ''}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="max-w-full h-auto"
      />
      <style>{`
        @keyframes anticipation {
          0%, 100% { transform: rotate(-2deg) scale(0.98); }
          50% { transform: rotate(2deg) scale(1.02); }
        }
        .animate-anticipation {
          animation: anticipation 0.15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
