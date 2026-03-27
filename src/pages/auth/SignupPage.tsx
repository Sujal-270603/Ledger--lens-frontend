import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Receipt, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSignup } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const signupSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  gstin: z.string().optional().refine(val => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val), "Invalid GSTIN format"),
  adminFullName:    z.string().min(2, "Full name must be at least 2 characters"),
  adminEmail:       z.string().email("Enter a valid email address"),
  adminPassword:    z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  terms:            z.boolean().refine(val => val === true, "You must accept the terms"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const signupMutation = useSignup();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { terms: false },
  });

  const passwordValue = watch('adminPassword', '');
  const gstinValue = watch('gstin', '');

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 20;
    if (pwd.length >= 12) score += 10;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[a-z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 20;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 10;
    return score;
  };

  const getPasswordColor = (score: number) => {
    if (score < 40) return 'bg-red-500';
    if (score < 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const strength = calculatePasswordStrength(passwordValue);
  const strengthColorClass = getPasswordColor(strength);

  const isValidGstin = (val: string) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val);

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden xl:flex w-5/12 bg-gradient-to-br from-navy-700 to-brand-600 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Receipt className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">LedgerLens</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6 max-w-xl">
            Join 500+ CA firms using LedgerLens
          </h1>
          
          <div className="space-y-6 mt-12 max-w-sm">
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6">
              <div className="text-3xl font-bold mb-1">10x</div>
              <div className="text-blue-100 text-sm font-medium">faster invoice processing</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6">
              <div className="text-3xl font-bold mb-1">99.9%</div>
              <div className="text-blue-100 text-sm font-medium">uptime SLA</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6">
              <div className="text-3xl font-bold mb-1">SOC 2</div>
              <div className="text-blue-100 text-sm font-medium">compliant & certified</div>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-blue-200">
          © {new Date().getFullYear()} LedgerLens Inc. All rights reserved.
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="w-full xl:w-7/12 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[500px] space-y-8 py-8">
          <div className="text-center sm:text-left">
            <div className="xl:hidden flex items-center justify-center sm:justify-start gap-2 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-navy-900">LedgerLens</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">Start your 30-day free trial (no credit card required)</p>
          </div>

          <Card className="border-0 shadow-none sm:border sm:shadow-sm bg-transparent sm:bg-card">
            <CardContent className="p-0 sm:p-6 sm:pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {signupMutation.isError && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                      {(signupMutation.error as any)?.response?.status === 409
                        ? 'This email is already registered. Sign in instead.'
                        : (signupMutation.error as any)?.response?.data?.message || signupMutation.error?.message || 'Failed to create account'}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="organizationName" required>Organization Name</Label>
                  <Input
                    id="organizationName"
                    placeholder="Sharma & Associates"
                    error={errors.organizationName?.message}
                    {...register('organizationName')}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gstin">GSTIN (optional)</Label>
                    <span className="text-[10px] text-muted-foreground">Optional — can be added later</span>
                  </div>
                  <Input
                    id="gstin"
                    placeholder="22AAAAA0000A1Z5"
                    className="uppercase"
                    error={errors.gstin?.message}
                    {...register('gstin')}
                    rightIcon={
                      gstinValue && isValidGstin(gstinValue) ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : undefined
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminFullName" required>Your Full Name</Label>
                  <Input
                    id="adminFullName"
                    placeholder="Rajesh Sharma"
                    error={errors.adminFullName?.message}
                    {...register('adminFullName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail" required>Work Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="rajesh@sharma-ca.com"
                    error={errors.adminEmail?.message}
                    {...register('adminEmail')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword" required>Password</Label>
                  <Input
                    id="adminPassword"
                    type={showPassword ? "text" : "password"}
                    error={errors.adminPassword?.message}
                    {...register('adminPassword')}
                    rightIcon={
                      <div onClick={() => setShowPassword(!showPassword)} className="w-full h-full flex items-center">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </div>
                    }
                  />
                  {passwordValue && (
                    <div className="pt-2">
                      <Progress value={strength} className="h-1.5" indicatorColor={strengthColorClass} />
                      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                        <span>{strength < 40 ? 'Weak' : strength < 70 ? 'Fair' : 'Strong'} password</span>
                        <span>min 8 chars, A-Z, a-z, 0-9</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                      {...register('terms')}
                    />
                    <div className="text-sm">
                      <span className="text-gray-600">I agree to the </span>
                      <Link to="#" className="font-medium text-brand-600 hover:underline">Terms of Service</Link>
                      <span className="text-gray-600"> and </span>
                      <Link to="#" className="font-medium text-brand-600 hover:underline">Privacy Policy</Link>
                      <span className="text-destructive ml-1">*</span>
                    </div>
                  </label>
                  {errors.terms && <p className="text-sm text-destructive pl-7">{errors.terms.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  loading={signupMutation.isPending}
                >
                  Create Account
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
