import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateClient, useUpdateClient } from '@/hooks/useClients';
import type { ClientDetailItem } from '@/types/client.types';

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  gstin: z.string().optional().refine(
    val => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
    'Invalid GSTIN format (e.g. 29AABCI1681G1ZK)'
  ).or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile').optional().or(z.literal('')),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientDetailItem;
  onSuccess: () => void;
}

export function ClientFormModal({ open, onOpenChange, client, onSuccess }: ClientFormModalProps) {
  const createMut = useCreateClient();
  const updateMut = useUpdateClient();

  const isEditMode = !!client;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      gstin: '',
      email: '',
      phone: '',
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = form;
  const watchGstin = watch('gstin');
  const isValidGstin = watchGstin && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(watchGstin);

  useEffect(() => {
    if (open) {
      if (client) {
        reset({
          name: client.name,
          gstin: client.gstin || '',
          email: client.email || '',
          phone: client.phone || '',
        });
      } else {
        reset({ name: '', gstin: '', email: '', phone: '' });
      }
    }
  }, [open, client, reset]);

  const onSubmit = async (data: ClientFormData) => {
    // Clean up empty strings to undefined to match API requirements
    const payload = {
      name: data.name,
      gstin: data.gstin || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
    };

    try {
      if (isEditMode && client) {
        await updateMut.mutateAsync({ id: client.id, data: payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      if (error.response?.status === 409) {
        form.setError('gstin', { type: 'manual', message: 'GSTIN already used by another client' });
      }
    }
  };

  const isPending = isSubmitting || createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Client' : 'Add Client'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the client's details here." : "Enter the details for your new client."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div>
            <Label className="mb-1 block">Client Name <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Acme Corp"
              autoFocus
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div>
            <Label className="mb-1 block">GSTIN <span className="text-muted-foreground font-normal">(Optional)</span></Label>
            <div className="relative">
              <Input
                placeholder="29AABCI1681G1ZK"
                className="font-mono uppercase"
                error={errors.gstin?.message}
                {...register('gstin')}
              />
              {isValidGstin && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">15-character GST number</p>
          </div>

          <div>
            <Label className="mb-1 block">Email <span className="text-muted-foreground font-normal">(Optional)</span></Label>
            <Input
              type="email"
              placeholder="billing@acme.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div>
            <Label className="mb-1 block">Phone <span className="text-muted-foreground font-normal">(Optional)</span></Label>
            <Input
              placeholder="9876543210"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <p className="text-xs text-muted-foreground mt-1">10-digit Indian mobile number</p>
          </div>

          {(createMut.isError || updateMut.isError) && !errors.gstin && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Failed to save client. Please try again.</span>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
