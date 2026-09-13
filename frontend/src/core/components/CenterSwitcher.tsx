import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select';
import routes from '@/core/constants/routes';
import { useCenterStore } from '@/core/stores/center.store';
import { useMyCenters } from '@/features/pro-centers/domain/hooks/pro-center.hook';

/**
 * Selecteur du centre courant, affiche aux professionnels. Seuls les centres
 * approuves sont proposes : les autres n'ont pas encore d'activites a gerer.
 */
export default function CenterSwitcher() {
  const navigate = useNavigate();
  const { centers } = useMyCenters();
  const { currentCenterId, setCurrentCenterId } = useCenterStore();

  const selectable = (centers ?? []).filter((c) => c.status === 'approved');

  // Le centre memorise peut avoir ete supprime, ou ne plus etre approuve :
  // on retombe alors sur le premier disponible plutot que sur un vide.
  useEffect(() => {
    if (selectable.length === 0) return;
    if (!selectable.some((c) => c.id === currentCenterId)) {
      setCurrentCenterId(selectable[0].id);
    }
  }, [selectable, currentCenterId, setCurrentCenterId]);

  if (selectable.length === 0) return null;

  return (
    <Select
      value={currentCenterId ?? undefined}
      onValueChange={(id) => {
        setCurrentCenterId(id);
        navigate(routes.proActivityList.replace(':centerId', id));
      }}
    >
      <SelectTrigger
        className="h-9 w-[150px] sm:w-[200px]"
        aria-label="Centre courant"
      >
        <Building2 className="mr-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Centre" />
      </SelectTrigger>
      <SelectContent align="end">
        {selectable.map((center) => (
          <SelectItem key={center.id} value={center.id}>
            {center.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
