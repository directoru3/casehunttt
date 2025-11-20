import { useEffect, useRef, useState } from 'react';

interface PepeRaceAnimationProps {
  isRunning: boolean;
  onComplete: (success: boolean) => void;
}

export default function PepeRaceAnimation({ isRunning, onComplete }: PepeRaceAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ANIMATION_DURATION = 4000;
    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;

    let animationId: number;
    let startTime: number = Date.now();

    const randomSuccess = Math.random() < 0.5;
    setSuccess(randomSuccess);

    const obstacles = [
      { x: 400, width: 60, height: 80 },
      { x: 700, width: 60, height: 80 },
      { x: 1000, width: 60, height: 80 },
    ];

    const pepeWidth = 80;
    const pepeHeight = 80;
    const pepeY = CANVAS_HEIGHT - pepeHeight - 20;

    const drawPepe = (x: number, jumping: boolean, jumpHeight: number) => {
      const adjustedY = jumping ? pepeY - jumpHeight : pepeY;

      ctx.save();
      ctx.translate(x + pepeWidth / 2, adjustedY + pepeHeight / 2);

      ctx.fillStyle = '#90EE90';
      ctx.beginPath();
      ctx.ellipse(0, -5, 30, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(-15, -20, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(15, -20, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-10, -22, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(10, -22, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      ctx.arc(0, 5, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawObstacle = (obstacle: any) => {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(obstacle.x, CANVAS_HEIGHT - obstacle.height - 20, obstacle.width, obstacle.height);

      ctx.fillStyle = '#654321';
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          ctx.fillRect(
            obstacle.x + 10 + i * 15,
            CANVAS_HEIGHT - obstacle.height - 20 + 10 + j * 15,
            8,
            8
          );
        }
      }
    };

    const drawGround = () => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

      ctx.strokeStyle = '#404040';
      ctx.lineWidth = 1;
      for (let i = 0; i < CANVAS_WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, CANVAS_HEIGHT - 20);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
      }
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      drawGround();

      const pepeX = progress * CANVAS_WIDTH;

      let jumping = false;
      let jumpHeight = 0;
      let isHit = false;

      for (const obstacle of obstacles) {
        drawObstacle(obstacle);

        const obstacleRight = obstacle.x + obstacle.width;
        const pepeRight = pepeX + pepeWidth;

        if (pepeRight > obstacle.x && pepeX < obstacleRight) {
          if (randomSuccess) {
            jumping = true;
            const jumpPhase = (elapsed % 400) / 400;
            jumpHeight = Math.sin(jumpPhase * Math.PI) * 100;
          } else {
            isHit = true;
          }
        }
      }

      drawPepe(pepeX, jumping, jumpHeight);

      if (isHit && !randomSuccess) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete(randomSuccess);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isRunning, onComplete]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={1200}
        height={400}
        className="w-full max-w-4xl rounded-2xl border-2 border-blue-500 shadow-2xl"
      />
      {success !== null && (
        <div className={`text-2xl font-bold ${success ? 'text-green-400' : 'text-red-400'}`}>
          {success ? '✨ Лягушка перепрыгнула! ✨' : '💥 Лягушка упала! 💥'}
        </div>
      )}
    </div>
  );
}
