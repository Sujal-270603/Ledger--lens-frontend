import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Receipt, Eye, EyeOff, Zap, CheckCircle2, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-navy-700 to-brand-600 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Receipt className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">LedgerLens</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-xl">
            AI-powered GST invoice processing for CA firms
          </h1>
          
          <div className="space-y-8 mt-12">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-10 w-10 flex items-center justify-center rounded-lg bg-white/10 shrink-0">
                <Zap className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI extracts invoice data automatically</h3>
                <p className="text-blue-100 mt-1">Stop manual data entry. Our AI models read GST invoices instantly with 99% accuracy.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 h-10 w-10 flex items-center justify-center rounded-lg bg-white/10 shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Full approval workflow with audit trail</h3>
                <p className="text-blue-100 mt-1">Multi-stage approvals, complete history, and team collaboration built-in.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 h-10 w-10 flex items-center justify-center rounded-lg bg-white/10 shrink-0">
                <FileSpreadsheet className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Auto-generated journal entries</h3>
                <p className="text-blue-100 mt-1">We create the double-entry accounting records automatically upon approval.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-blue-200">
          © {new Date().getFullYear()} LedgerLens Inc. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-navy-900">LedgerLens</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
          </div>

          <Card className="border-0 shadow-none sm:border sm:shadow-sm bg-transparent sm:bg-card">
            <CardContent className="p-0 sm:p-6 sm:pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {loginMutation.isError && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                      {(loginMutation.error as any)?.response?.status === 401
                        ? 'Invalid email or password'
                        : (loginMutation.error as any)?.response?.data?.message || loginMutation.error?.message || 'Failed to login'}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" required>Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@yourfirm.com"
                    autoFocus
                    error={errors.email?.message}
                    {...register('email')}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" required>Password</Label>
                    <Link to="#" className="text-sm font-medium text-brand-600 hover:text-brand-500">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    error={errors.password?.message}
                    {...register('password')}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    rightIcon={
                      <div onClick={() => setShowPassword(!showPassword)} className="w-full h-full flex items-center">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </div>
                    }
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  loading={loginMutation.isPending}
                >
                  Sign in
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center">
                <div className="w-full border-t border-gray-200" />
                <span className="bg-white px-2 text-sm text-muted-foreground w-auto flex-shrink-0">
                  or
                </span>
                <div className="w-full border-t border-gray-200" />
              </div>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-500">
                  Create one
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
