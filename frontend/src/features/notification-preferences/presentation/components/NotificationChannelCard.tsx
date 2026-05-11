import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Switch } from '@/core/components/ui/switch';
import { Label } from '@/core/components/ui/label';
import { Separator } from '@/core/components/ui/separator';
import { cn } from '@/core/utils/cn';

interface ToggleItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface Props {
  title: string;
  icon: React.ReactNode;
  items: ToggleItem[];
  className?: string;
}

export default function NotificationChannelCard({
  title,
  icon,
  items,
  className,
}: Props) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {items.map((item, index) => (
          <div key={item.id}>
            {index > 0 && <Separator className="my-0" />}
            <div className="flex items-center justify-between py-4">
              <div className="space-y-0.5">
                <Label
                  htmlFor={item.id}
                  className="cursor-pointer text-sm font-medium"
                >
                  {item.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Switch
                id={item.id}
                checked={item.checked}
                onCheckedChange={item.onChange}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
