import { cn } from '@/core/utils/cn';
import { Card, CardContent } from '@/core/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface Props {
  title: string;
  value: string;
  trend?: number;
  icon: LucideIcon;
  className?: string;
}

export default function KpiCard({
  title,
  value,
  trend,
  icon: Icon,
  className,
}: Props) {
  const hasTrend = trend !== undefined;
  const isPositive = hasTrend && trend >= 0;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {hasTrend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-destructive',
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {isPositive ? '+' : ''}
                  {trend.toFixed(1)}% vs période préc.
                </span>
              </div>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
