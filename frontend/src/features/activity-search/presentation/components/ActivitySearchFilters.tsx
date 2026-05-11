import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select';
import { Slider } from '@/core/components/ui/slider';
import {
  activitySearchSchema,
  type ActivitySearchFormData,
} from '../../domain/schemas/activity-search.schema';

interface Props {
  defaultValues?: ActivitySearchFormData;
  onSearch: (data: ActivitySearchFormData) => void;
}

export default function ActivitySearchFilters({
  defaultValues,
  onSearch,
}: Props) {
  const { register, handleSubmit, setValue, watch, reset } =
    useForm<ActivitySearchFormData>({
      resolver: zodResolver(activitySearchSchema),
      defaultValues: {
        sortBy: 'relevance',
        radiusKm: 50,
        ...defaultValues,
      },
    });

  const priceMin = watch('priceMin') ?? 0;
  const priceMax = watch('priceMax') ?? 500;

  const handleReset = () => {
    reset({ sortBy: 'relevance', radiusKm: 50 });
    onSearch({ sortBy: 'relevance', radiusKm: 50 });
  };

  return (
    <form onSubmit={handleSubmit(onSearch)} className="space-y-5">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        Filtres
      </div>

      {/* Type d'activité */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Type d'activité
        </Label>
        <Select
          onValueChange={(v) =>
            setValue(
              'type',
              v === 'all' ? undefined : (v as ActivitySearchFormData['type']),
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="bungee">Saut à l'élastique</SelectItem>
            <SelectItem value="climbing">Escalade</SelectItem>
            <SelectItem value="diving">Plongée</SelectItem>
            <SelectItem value="paragliding">Parapente</SelectItem>
            <SelectItem value="canyoning">Canyoning</SelectItem>
            <SelectItem value="via_ferrata">Via ferrata</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Difficulté */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Difficulté
        </Label>
        <Select
          onValueChange={(v) =>
            setValue(
              'difficulty',
              v === 'all'
                ? undefined
                : (v as ActivitySearchFormData['difficulty']),
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous niveaux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous niveaux</SelectItem>
            <SelectItem value="beginner">Débutant</SelectItem>
            <SelectItem value="intermediate">Intermédiaire</SelectItem>
            <SelectItem value="advanced">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fourchette de prix */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Prix (€) : {priceMin} — {priceMax}+
        </Label>
        <Slider
          min={0}
          max={500}
          step={10}
          value={[priceMin, priceMax]}
          onValueChange={([min, max]) => {
            setValue('priceMin', min);
            setValue('priceMax', max);
          }}
          className="w-full"
        />
      </div>

      {/* Dates */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Du
        </Label>
        <Input type="date" {...register('dateFrom')} className="w-full" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Au
        </Label>
        <Input type="date" {...register('dateTo')} className="w-full" />
      </div>

      {/* Rayon de recherche */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Rayon (km)
        </Label>
        <Select
          defaultValue="50"
          onValueChange={(v) => setValue('radiusKm', Number(v))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 km</SelectItem>
            <SelectItem value="25">25 km</SelectItem>
            <SelectItem value="50">50 km</SelectItem>
            <SelectItem value="100">100 km</SelectItem>
            <SelectItem value="200">200 km</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tri */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Trier par
        </Label>
        <Select
          defaultValue="relevance"
          onValueChange={(v) =>
            setValue('sortBy', v as ActivitySearchFormData['sortBy'])
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Pertinence</SelectItem>
            <SelectItem value="price_asc">Prix croissant</SelectItem>
            <SelectItem value="price_desc">Prix décroissant</SelectItem>
            <SelectItem value="distance">Distance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button type="submit" className="w-full">
          Appliquer les filtres
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={handleReset}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-2" />
          Réinitialiser
        </Button>
      </div>
    </form>
  );
}
