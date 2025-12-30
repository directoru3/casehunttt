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
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

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
      const gradient = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
      gradient.addColorStop(0, adjustBrightness(color, 40));
      gradient.addColorStop(0.6, color);
      gradient.addColorStop(1, adjustBrightness(color, -40));
      ctx.fillStyle = gradient;
      ctx.fill();

      const glowColor = rarityGlows[item.rarity] || 'rgba(107, 116, 128, 0.4)';
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 15;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.stroke();

      ctx.save();
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px system-ui';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(item.name, radius * 0.65, 5);
      ctx.restore();
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
