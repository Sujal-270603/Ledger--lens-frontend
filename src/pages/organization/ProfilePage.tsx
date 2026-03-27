import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth.store';
import { useOrganization, useUpdateOrganization } from '@/hooks/useOrganization';
import { getInitials, formatDate, cn } from '@/lib/utils';
import type { UpdateOrganizationInput } from '@/types/organization.types';

const orgSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  gstin: z.string().optional().refine(
    val => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
    'Invalid GSTIN format'
  ).or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
});

type OrgFormData = z.infer<typeof orgSchema>;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: org, isLoading } = useOrganization();
  const updateMut = useUpdateOrganization();

  const form = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: '',
      gstin: '',
      address: '',
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting, isDirty } } = form;

  useEffect(() => {
    if (org) {
      reset({
        name: org.name,
        gstin: org.gstin || '',
        address: org.address || '',
      });
    }
  }, [org, reset]);

  const watchGstin = watch('gstin');
  const isValidGstin = watchGstin && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(watchGstin);

  const onSubmit = async (data: OrgFormData) => {
    const payload: UpdateOrganizationInput = {
      name: data.name,
      gstin: data.gstin || undefined,
      address: data.address || undefined,
    };
    await updateMut.mutateAsync(payload);
    reset(data, { keepDirty: false });
  };

  const getRoleBadgeVariant = (roleName: string) => {
    const lower = roleName.toLowerCase();
    if (lower.includes('admin')) return 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-none';
    if (lower.includes('user')) return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-none';
    return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-none';
  };

  const getQuotaColor = (percent: number) => {
    if (percent >= 80) return 'bg-red-500';
    if (percent >= 60) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  if (isLoading || !user) {
    return <div className="max-w-3xl mx-auto space-y-8 p-6"><div className="h-40 bg-gray-100 animate-pulse rounded-xl" /></div>;
  }

  const hasManageOrgPermission = user.permissions?.includes('MANAGE_ORG') || user.role.name === 'ADMIN';

  const quotaPercent = org ? (org.quota.invoicesProcessed / org.quota.invoicesLimit) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal info and organization details
        </p>
      </div>

      {/* Section A: Personal Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Your personal account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl">
              {getInitials(user.fullName)}
            </div>
            <div>
              <p className="text-lg font-semibold text-navy-900">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className={cn("mt-1", getRoleBadgeVariant(user.role.name))}>
                {user.role.name}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-gray-700">Full Name</Label>
              <Input value={user.fullName} disabled className="bg-gray-50/50 text-gray-500 cursor-not-allowed border-gray-200" />
              <p className="text-xs text-muted-foreground mt-1">Contact your admin to change your name</p>
            </div>
            <div>
              <Label className="mb-2 block text-gray-700">Email Address</Label>
              <Input value={user.email} disabled className="bg-gray-50/50 text-gray-500 cursor-not-allowed border-gray-200" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-gray-50 border gap-4">
            <div>
              <p className="text-sm font-medium text-navy-900">Password</p>
              <p className="text-xs text-muted-foreground">Keep your account secure by using a strong password</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/change-password')} className="bg-white">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section B: Organization Details */}
      {hasManageOrgPermission && org && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Update your firm's information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label className="mb-2 block">Organization Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Sharma & Associates"
                  error={errors.name?.message}
                  {...register('name')}
                />
              </div>

              <div>
                <Label className="mb-2 block">GSTIN</Label>
                <div className="relative">
                  <Input
                    placeholder="27AAPFU0939F1ZV"
                    className="font-mono uppercase"
                    error={errors.gstin?.message}
                    {...register('gstin')}
                  />
                  {isValidGstin && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">15-character GST Identification Number</p>
              </div>

              <div>
                <Label className="mb-2 block">Office Address</Label>
                <Textarea
                  placeholder="123 MG Road, Mumbai, Maharashtra 400001"
                  rows={3}
                  {...register('address')}
                />
              </div>

              <div className="mt-6 p-4 rounded-lg border bg-gray-50/50">
                <p className="text-sm font-medium mb-3 text-navy-900">Monthly Usage</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Invoices processed</span>
                  <span className="text-sm font-medium text-navy-900">
                    {org.quota.invoicesProcessed} / {org.quota.invoicesLimit}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all", getQuotaColor(quotaPercent))}
                    style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Resets on {formatDate(org.quota.resetDate)}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting || !isDirty || updateMut.isPending}>
                  {updateMut.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
