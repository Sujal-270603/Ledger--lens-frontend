import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'brand';
  isLoading?: boolean;
}

export default function StatCard({ 
  title, 
  value, 
  subtitle = "vs last month", 
  icon: Icon, 
  color,
  isLoading 
}: StatCardProps) {

  const colorConfig = {
    blue:   { bg: "bg-blue-100",   text: "text-blue-600" },
    green:  { bg: "bg-green-100",  text: "text-green-600" },
    amber:  { bg: "bg-amber-100",  text: "text-amber-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    brand:  { bg: "bg-brand-100",  text: "text-brand-600" },
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-[120px] mt-2" />
          <Skeleton className="h-3 w-[140px] mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium tracking-tight text-muted-foreground">
            {title}
          </p>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", colorConfig[color].bg)}>
            <Icon className={cn("h-5 w-5", colorConfig[color].text)} />
          </div>
        </div>
        <div className="text-2xl font-bold text-navy-900 mt-2">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 text-slate-500">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}
