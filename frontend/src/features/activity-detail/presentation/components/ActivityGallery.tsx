import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { cn } from '@/core/utils/cn';
import type {
  ActivityDetailPhoto,
  ActivityDetailVideo,
} from '../../domain/entities/activity-detail.entity';

interface Props {
  photos: ActivityDetailPhoto[];
  videos: ActivityDetailVideo[];
}

type MediaItem =
  | { kind: 'photo'; url: string; alt: string }
  | { kind: 'video'; url: string; thumbnail: string };

export default function ActivityGallery({ photos, videos }: Props) {
  const items: MediaItem[] = [
    ...photos.map((p) => ({ kind: 'photo' as const, url: p.url, alt: p.alt })),
    ...videos.map((v) => ({
      kind: 'video' as const,
      url: v.url,
      thumbnail: v.thumbnail,
    })),
  ];

  const [current, setCurrent] = useState(0);

  if (items.length === 0) {
    return (
      <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="h-12 w-12" />
          <p className="text-sm">Aucune photo disponible</p>
        </div>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const next = () => setCurrent((c) => (c + 1) % items.length);
  const active = items[current];

  return (
    <div className="space-y-3">
      {/* Main viewer */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted group">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            {active.kind === 'photo' ? (
              <img
                src={active.url}
                alt={active.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80';
                }}
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={active.thumbnail}
                  alt="Vidéo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="bg-white/90 rounded-full p-4">
                    <Play className="h-8 w-8 text-foreground fill-foreground" />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {items.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={next}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i === current ? 'bg-white w-4' : 'bg-white/50',
                  )}
                  aria-label={`Voir média ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all',
                i === current
                  ? 'border-primary'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
              aria-label={`Miniature ${i + 1}`}
            >
              <img
                src={item.kind === 'photo' ? item.url : item.thumbnail}
                alt=""
                className="w-full h-full object-cover"
              />
              {item.kind === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-4 w-4 text-white fill-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
