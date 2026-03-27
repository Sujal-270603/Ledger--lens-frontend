import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import type { DashboardOverview } from '@/types/dashboard.types';

interface QuotaRingProps {
  usage?: DashboardOverview['usage'];
  isLoading?: boolean;
}

export default function QuotaRing({ usage, isLoading }: QuotaRingProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <Skeleton className="h-[120px] w-[120px] rounded-full" />
        <Skeleton className="h-4 w-[140px] mt-6" />
        <Skeleton className="h-3 w-[100px] mt-2" />
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="flex flex-col items-center justify-center py-10 h-[220px] text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
        <p>No quota data available</p>
      </div>
    );
  }

  const { invoicesProcessed, invoicesLimit } = usage;
  const percentUsed = invoicesLimit > 0 ? Math.min(100, (invoicesProcessed / invoicesLimit) * 100) : 0;

  let colorClass = 'text-green-500';
  if (percentUsed >= 80) colorClass = 'text-red-500';
  else if (percentUsed >= 60) colorClass = 'text-amber-500';

  const isNearingLimit = percentUsed >= 80;

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative">
        <CircularProgress 
          value={percentUsed} 
          size={140} 
          strokeWidth={14} 
          colorClass={colorClass} 
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold text-navy-900 tracking-tight">
            {invoicesProcessed}/{invoicesLimit}
          </span>
          <span className="text-xs text-muted-foreground font-medium">Invoices</span>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        
        {isNearingLimit && (
          <Button 
            variant="default" 
            size="sm" 
            className="mt-4 w-full"
            onClick={() => navigate('/subscription')}
          >
            Upgrade Plan
          </Button>
        )}
      </div>
    </div>
  );
}
