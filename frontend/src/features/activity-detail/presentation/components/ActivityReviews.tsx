import { Star, MessageSquare } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import type { ActivityDetailReviewsSummary } from '../../domain/entities/activity-detail.entity';

interface Props {
  reviewsSummary: ActivityDetailReviewsSummary;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Note : ${rating} sur 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <div key={i} className="relative h-5 w-5">
            <Star className="h-5 w-5 text-muted/40" />
            {(filled || partial) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : `${(rating % 1) * 100}%` }}
              >
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ActivityReviews({ reviewsSummary }: Props) {
  const { count, averageRating } = reviewsSummary;

  if (count === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Avis vérifiés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <MessageSquare className="h-8 w-8" />
            <p className="text-sm">Aucun avis pour le moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Avis vérifiés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl font-bold">
              {averageRating.toFixed(1)}
            </span>
            <StarRating rating={averageRating} />
            <span className="text-xs text-muted-foreground mt-1">
              {count} avis vérifié{count > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
