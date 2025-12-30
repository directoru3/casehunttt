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

export const FortuneWheel: React.FC<FortuneWheelProps> = ({
  items,
  winningIndex,
  isSpinning,
  onSpinComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (!isSpinning) return;

    const duration = 5000;
    const extraSpins = 5;
    const segmentAngle = 360 / items.length;
    const targetRotation = 360 * extraSpins + (360 - (winningIndex * segmentAngle) - segmentAngle / 2);

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentRotation = targetRotation * easeOutCubic;

      setRotation(currentRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        startTimeRef.current = undefined;
        setTimeout(onSpinComplete, 300);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, winningIndex, items.length, onSpinComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    const segmentAngle = (2 * Math.PI) / items.length;

    items.forEach((item, index) => {
      const startAngle = index * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      const color = rarityColors[item.rarity] || '#6B7280';
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, adjustBrightness(color, -30));
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(item.name, radius * 0.7, 5);
      ctx.restore();
    });

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX - 15, 50);
    ctx.lineTo(centerX + 15, 50);
    ctx.closePath();
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#1F2937';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', centerX, centerY);

  }, [items, rotation]);

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

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="max-w-full h-auto"
      />
    </div>
  );
};
