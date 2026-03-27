import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useInviteUser, useRoles } from '@/hooks/useUsers';
import { Info } from 'lucide-react';

const inviteSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email:    z.string().email('Invalid email address'),
  roleId:   z.string().min(1, 'Please select a role'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteUserModal({ open, onOpenChange, onSuccess }: InviteUserModalProps) {
  const inviteMut = useInviteUser();
  const { data: roles } = useRoles();

  const roleOptions = (roles || []).map(r => ({ value: r.id, label: r.name }));

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { fullName: '', email: '', roleId: '', password: '' }
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const onSubmit = async (data: InviteFormData) => {
    try {
      await inviteMut.mutateAsync(data);
      onSuccess();
    } catch (error) {
      // Error handling is managed in the hook (toast + 409/422 check)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label required>Full Name</Label>
            <Input 
              placeholder="John Doe" 
              error={errors.fullName?.message}
              {...register('fullName')} 
            />
          </div>

          <div className="space-y-2">
            <Label required>Email Address</Label>
            <Input 
              type="email" 
              placeholder="john@example.com" 
              error={errors.email?.message}
              {...register('email')} 
            />
          </div>

          <div className="space-y-2">
            <Label required>Role</Label>
            <Select 
              options={roleOptions} 
              placeholder="Select a role..." 
              error={errors.roleId?.message}
              {...register('roleId')}
            />
          </div>

          <div className="space-y-2">
            <Label required>Initial Password</Label>
            <Input 
              type="password" 
              placeholder="Min 8 characters" 
              error={errors.password?.message}
              {...register('password')} 
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
              <Info className="h-3 w-3" />
              Users are encouraged to change this after their first login.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={inviteMut.isPending}>
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
