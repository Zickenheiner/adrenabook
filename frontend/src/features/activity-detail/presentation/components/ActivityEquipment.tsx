import { CheckCircle2, Package } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';

interface Props {
  equipment: string[];
}

export default function ActivityEquipment({ equipment }: Props) {
  if (equipment.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Équipement fourni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Package className="h-4 w-4" />
            <span>Aucun équipement spécifié</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Équipement fourni</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {equipment.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
