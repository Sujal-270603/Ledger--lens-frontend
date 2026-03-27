import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle2,
  Send,
  XCircle,
  FilePlus,
  UploadCloud,
  Cpu,
  UserPlus,
  CreditCard,
  Activity,
  AlertCircle
} from 'lucide-react';
import type { RecentActivity } from '@/types/dashboard.types';

interface RecentActivityFeedProps {
  activities?: RecentActivity[];
  isLoading?: boolean;
}

export default function RecentActivityFeed({ activities, isLoading }: RecentActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Activity className="h-8 w-8 mb-2 text-gray-400" />
        <p>No recent activity in your organization</p>
      </div>
    );
  }

  const getActivityConfig = (action: string) => {
    switch (action) {
      case 'APPROVE_INVOICE':
        return { icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-600', label: 'Invoice approved' };
      case 'SUBMIT_INVOICE':
        return { icon: Send, bg: 'bg-blue-100', text: 'text-blue-600', label: 'Invoice submitted for approval' };
      case 'REJECT_INVOICE':
        return { icon: XCircle, bg: 'bg-red-100', text: 'text-red-600', label: 'Invoice rejected' };
      case 'CREATE_INVOICE':
        return { icon: FilePlus, bg: 'bg-brand-100', text: 'text-brand-600', label: 'New invoice created' };
      case 'CONFIRM_UPLOAD':
        return { icon: UploadCloud, bg: 'bg-purple-100', text: 'text-purple-600', label: 'Document uploaded' };
      case 'AI_PROCESSING_COMPLETED':
        return { icon: Cpu, bg: 'bg-indigo-100', text: 'text-indigo-600', label: 'AI processing complete' };
      case 'CREATE_CLIENT':
        return { icon: UserPlus, bg: 'bg-teal-100', text: 'text-teal-600', label: 'New client added' };
      case 'INVITE_USER':
        return { icon: UserPlus, bg: 'bg-orange-100', text: 'text-orange-600', label: 'Team member invited' };
      case 'CHANGE_PLAN':
        return { icon: CreditCard, bg: 'bg-pink-100', text: 'text-pink-600', label: 'Subscription plan changed' };
      default:
        // Humanize arbitrary actions by lowercasing and replacing underscores with spaces
        const formatted = action.toLowerCase().replace(/_/g, ' ');
        const label = formatted.charAt(0).toUpperCase() + formatted.slice(1);
        return { icon: AlertCircle, bg: 'bg-gray-100', text: 'text-gray-600', label };
    }
  };

  return (
    <div className="pt-2">
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {activities.slice(0, 10).map((activity) => {
          const config = getActivityConfig(activity.action);
          const Icon = config.icon;
          
          return (
            <div key={activity.id} className="relative flex gap-4">
              <div className={`mt-0.5 relative z-10 flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${config.bg}`}>
                <Icon className={`h-4 w-4 ${config.text}`} />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-navy-900 leading-tight">
                  {config.label}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  {activity.user && (
                    <span className="font-medium text-gray-700">{activity.user.fullName}</span>
                  )}
                  {activity.user && <span>•</span>}
                  <time dateTime={activity.createdAt}>
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </time>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 border-t pt-4 text-center">
        <Link 
          to="/organization" 
          className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          View full audit log
        </Link>
      </div>
    </div>
  );
}
