import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/core/components/ui/button';
import type { CreateBookingFormData } from '../../domain/schemas/booking.schema';
import BookingParticipantForm from './BookingParticipantForm';

const MAX_PARTICIPANTS = 8;

export default function BookingParticipantsSection() {
  const form = useFormContext<CreateBookingFormData>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'participants',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">
            Participants{' '}
            <span className="text-muted-foreground font-normal">
              ({fields.length})
            </span>
          </h3>
        </div>
        {fields.length < MAX_PARTICIPANTS && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                firstName: '',
                lastName: '',
                birthDate: '',
                weightKg: undefined,
              })
            }
            className="h-7 text-xs gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter un participant
          </Button>
        )}
      </div>

      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        <AnimatePresence>
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
            >
              <BookingParticipantForm
                index={index}
                canRemove={fields.length > 1}
                onRemove={() => remove(index)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
