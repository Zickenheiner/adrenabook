import { useRef, useEffect, useState } from 'react';
import { Button } from '@/core/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface Props {
  onChange: (base64: string | null) => void;
  disabled?: boolean;
}

export default function WaiverCanvasSignature({ onChange, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (disabled) return;
    e.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current || disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  }

  function endDraw() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current!;
    onChange(canvas.toDataURL('image/png'));
  }

  function clearSignature() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed bg-muted/30',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-crosshair',
        )}
      >
        <canvas
          ref={canvasRef}
          width={560}
          height={200}
          className="w-full touch-none rounded-lg"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasSignature && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Signez ici avec votre souris ou votre doigt
          </p>
        )}
      </div>
      {hasSignature && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSignature}
          className="text-muted-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Effacer la signature
        </Button>
      )}
    </div>
  );
}
