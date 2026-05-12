import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/core/components/ui/form';
import type {
  AuditLogsQueryDto,
  AuditLogActionType,
  AuditLogSeverity,
} from '../../data/dtos/audit-log.dto';

const auditLogFilterSchema = z.object({
  actorId: z.string().optional(),
  actionType: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  severity: z.string().optional(),
});

type AuditLogFilterFormData = z.infer<typeof auditLogFilterSchema>;

const ACTION_TYPE_OPTIONS: { value: AuditLogActionType; label: string }[] = [
  { value: 'auth.login', label: 'Connexion réussie' },
  { value: 'auth.login_failed', label: 'Connexion échouée' },
  { value: 'user.status_changed', label: 'Statut utilisateur modifié' },
  { value: 'center.reviewed', label: 'Centre examiné' },
  { value: 'data.deleted', label: 'Données supprimées' },
  { value: 'payment.refunded', label: 'Paiement remboursé' },
];

const SEVERITY_OPTIONS: { value: AuditLogSeverity; label: string }[] = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Avertissement' },
  { value: 'critical', label: 'Critique' },
];

interface Props {
  onFilter: (query: AuditLogsQueryDto) => void;
}

export default function AuditLogFilters({ onFilter }: Props) {
  const form = useForm<AuditLogFilterFormData>({
    resolver: zodResolver(auditLogFilterSchema),
    defaultValues: {
      actorId: '',
      actionType: '',
      from: '',
      to: '',
      severity: '',
    },
  });

  const handleSubmit = (data: AuditLogFilterFormData) => {
    const query: AuditLogsQueryDto = {};
    if (data.actorId) query.actorId = data.actorId;
    if (data.actionType)
      query.actionType = data.actionType as AuditLogActionType;
    if (data.from) query.from = data.from;
    if (data.to) query.to = data.to;
    if (data.severity) query.severity = data.severity as AuditLogSeverity;
    onFilter(query);
  };

  const handleReset = () => {
    form.reset();
    onFilter({});
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="rounded-xl border bg-card p-4 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <FormField
            control={form.control}
            name="actorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  ID acteur
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="UUID utilisateur"
                    className="h-9 text-sm"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="actionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Type d'action
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ACTION_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Sévérité
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="from"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Du
                </FormLabel>
                <FormControl>
                  <Input {...field} type="date" className="h-9 text-sm" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Au
                </FormLabel>
                <FormControl>
                  <Input {...field} type="date" className="h-9 text-sm" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <Button type="submit" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            Filtrer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </form>
    </Form>
  );
}
