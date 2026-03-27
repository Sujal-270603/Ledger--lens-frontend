import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useChangePassword } from '@/hooks/useOrganization';
import { cn } from '@/lib/utils';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(
  data => data.newPassword === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
).refine(
  data => data.currentPassword !== data.newPassword,
  { message: 'New password must be different from current password', path: ['newPassword'] }
);

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const changePasswordMut = useChangePassword();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = form;
  
  const watchNewPassword = watch('newPassword');
  const watchConfirm = watch('confirmPassword');

  const onSubmit = async (data: ChangePasswordFormData) => {
    await changePasswordMut.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const getScore = (pw: string) => {
    let score = 0;
    if (!pw) return score;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[a-z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    return score;
  };

  const score = getScore(watchNewPassword);
  
  const getScoreColor = (sc: number) => {
    if (sc <= 1) return 'bg-red-500';
    if (sc === 2) return 'bg-amber-500';
    if (sc === 3) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getScoreLabel = (sc: number) => {
    if (sc <= 1) return 'Weak';
    if (sc === 2) return 'Fair';
    if (sc === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="max-w-md mx-auto mt-8 px-4">
      <Button variant="ghost" className="mb-6 -ml-4" onClick={() => navigate('/organization')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Profile
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Choose a strong password with at least 8 characters,
            one uppercase letter, one lowercase letter, and one number.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="mb-2 block">Current Password <span className="text-red-500">*</span></Label>
              <Input
                type="password"
                placeholder="Enter current password"
                autoComplete="current-password"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />
            </div>

            <div>
              <Label className="mb-2 block">New Password <span className="text-red-500">*</span></Label>
              <Input
                type="password"
                placeholder="Enter new password"
                autoComplete="new-password"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              {watchNewPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-full rounded-full transition-colors",
                          score >= i ? getScoreColor(score) : "bg-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn("text-xs text-right font-medium", 
                    score >= 4 ? "text-emerald-600" : "text-muted-foreground"
                  )}>{getScoreLabel(score)}</p>
                </div>
              )}
            </div>

            <div>
              <Label className="mb-2 block">Confirm New Password <span className="text-red-500">*</span></Label>
              <Input
                type="password"
                placeholder="Confirm your new password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              {watchConfirm && watchNewPassword && (
                <p className={cn("text-xs mt-1 flex items-center gap-1",
                  watchConfirm === watchNewPassword
                    ? "text-emerald-600"
                    : "text-red-500"
                )}>
                  {watchConfirm === watchNewPassword
                    ? <><CheckCircle2 className="h-3 w-3" /> Passwords match</>
                    : <><XCircle className="h-3 w-3" /> Passwords do not match</>}
                </p>
              )}
            </div>

            {changePasswordMut.isError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Wait, an error occurred. The specific error message was shown in a toast.
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting || changePasswordMut.isPending}
            >
              {isSubmitting || changePasswordMut.isPending
                ? 'Changing Password...'
                : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
        <p className="text-sm font-medium text-blue-900 mb-2">
          Security Tips
        </p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Use a unique password not used on other sites</li>
          <li>• Include symbols like @, #, ! for extra strength</li>
          <li>• You will be logged out after changing your password</li>
        </ul>
      </div>
    </div>
  );
}
