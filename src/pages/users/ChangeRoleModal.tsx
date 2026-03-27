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
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useUpdateUserRole, useRoles } from '@/hooks/useUsers';
import { UserDetailItem } from '@/types/user.types';

const roleSchema = z.object({
  roleId: z.string().min(1, 'Please select a role'),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface ChangeRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetailItem | null;
  onSuccess: () => void;
}

export function ChangeRoleModal({ open, onOpenChange, user, onSuccess }: ChangeRoleModalProps) {
  const updateMut = useUpdateUserRole();
  const { data: roles } = useRoles();

  const roleOptions = (roles || []).map(r => ({ value: r.id, label: r.name }));

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
  });

  useEffect(() => {
    if (open && user) {
      reset({ roleId: user.role.id });
    }
  }, [open, user, reset]);

  const onSubmit = async (data: RoleFormData) => {
    if (!user) return;
    try {
      await updateMut.mutateAsync({ id: user.id, roleId: data.roleId });
      onSuccess();
    } catch (error) {
      // Error handling is managed in the hook (toast + 400 self-change check)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the access level for {user?.fullName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label required>Role</Label>
            <Select 
              options={roleOptions} 
              placeholder="Select a role..." 
              error={errors.roleId?.message}
              {...register('roleId')}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={updateMut.isPending}>
              Update Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
