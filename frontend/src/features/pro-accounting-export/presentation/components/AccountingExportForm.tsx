import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Download, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import {
  accountingExportSchema,
  type AccountingExportFormData,
} from '../../domain/schemas/accounting-export.schema';
import { Button } from '@/core/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/core/components/ui/popover';
import { Calendar } from '@/core/components/ui/calendar';
import { cn } from '@/core/utils/cn';

interface Props {
  onSubmit: (data: AccountingExportFormData) => void;
  isPending: boolean;
}

export default function AccountingExportForm({ onSubmit, isPending }: Props) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const form = useForm<AccountingExportFormData>({
    resolver: zodResolver(accountingExportSchema),
    defaultValues: {
      format: 'csv_generic',
      from: '',
      to: '',
      includeRefunds: false,
      deliveryMode: 'download',
    },
  });

  const fromValue = form.watch('from');
  const toValue = form.watch('to');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Format */}
          <FormField
            control={form.control}
            name="format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Format d&apos;export</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un format" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sage50">Sage 50</SelectItem>
                    <SelectItem value="sage100">Sage 100</SelectItem>
                    <SelectItem value="csv_generic">CSV Générique</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Période */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="from"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de début</FormLabel>
                  <Popover open={fromOpen} onOpenChange={setFromOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), 'dd MMMM yyyy', { locale: fr })
                            : 'Sélectionner une date'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? date.toISOString() : '');
                          setFromOpen(false);
                        }}
                        disabled={(date) =>
                          toValue ? date > new Date(toValue) : false
                        }
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de fin</FormLabel>
                  <Popover open={toOpen} onOpenChange={setToOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), 'dd MMMM yyyy', { locale: fr })
                            : 'Sélectionner une date'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? date.toISOString() : '');
                          setToOpen(false);
                        }}
                        disabled={(date) =>
                          fromValue ? date < new Date(fromValue) : false
                        }
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Inclure les remboursements */}
          <FormField
            control={form.control}
            name="includeRefunds"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Inclure les remboursements</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* Mode de livraison */}
          <FormField
            control={form.control}
            name="deliveryMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mode de livraison</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="download">
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Téléchargement direct
                      </span>
                    </SelectItem>
                    <SelectItem value="email">
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Envoi par email
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Export en cours...' : 'Générer l\'export'}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
