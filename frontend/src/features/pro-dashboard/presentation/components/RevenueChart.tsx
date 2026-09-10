import type { RevenueSeriesItemEntity } from '../../domain/entities/dashboard.entity';

interface Props {
  series: RevenueSeriesItemEntity[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RevenueChart({ series }: Props) {
  if (!series.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  }

  const max = Math.max(...series.map((s) => s.valueEur), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-40">
        {series.map((item) => {
          const heightPct = (item.valueEur / max) * 100;
          return (
            <div
              key={item.date}
              className="group relative flex flex-1 flex-col items-center justify-end"
            >
              <div
                className="w-full rounded-t-md bg-primary/70 transition-all duration-300 group-hover:bg-primary"
                style={{ height: `${heightPct}%` }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden rounded bg-popover px-2 py-1 text-xs shadow group-hover:block whitespace-nowrap border">
                {formatEur(item.valueEur)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-1">
        {series.map((item) => (
          <div
            key={item.date}
            className="flex-1 text-center text-[10px] text-muted-foreground truncate"
          >
            {formatDate(item.date)}
          </div>
        ))}
      </div>
    </div>
  );
}
