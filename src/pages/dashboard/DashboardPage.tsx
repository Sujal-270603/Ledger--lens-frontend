import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, IndianRupee, Clock, FileCheck } from 'lucide-react';

import { useAuthStore } from '@/stores/auth.store';
import { 
  useDashboardOverview, 
  useInvoiceTrend, 
  useTopClients, 
  useRecentActivity 
} from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/utils';
import type { TrendPeriod } from '@/types/dashboard.types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import StatCard from './StatCard';
import QuotaRing from './QuotaRing';
import InvoiceTrendChart from './InvoiceTrendChart';
import TopClientsTable from './TopClientsTable';
import RecentActivityFeed from './RecentActivityFeed';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<TrendPeriod>('last30days');

  // Fetch data
  const { 
    data: overview, 
    isLoading: isOverviewLoading, 
    isError: isOverviewError,
    refetch: refetchOverview
  } = useDashboardOverview();

  const { 
    data: trendData, 
    isLoading: isTrendLoading 
  } = useInvoiceTrend(period);

  const { 
    data: clientsData, 
    isLoading: isClientsLoading 
  } = useTopClients(period);

  const { 
    data: activityData, 
    isLoading: isActivityLoading 
  } = useRecentActivity();

  // Determine time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good night";
  };

  const firstName = user?.fullName?.split(' ')[0] || 'User';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your invoices today.
        </p>
      </div>

      {isOverviewError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <p className="text-red-800 font-medium mb-4">Failed to load dashboard data</p>
            <Button variant="outline" onClick={() => refetchOverview()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Row 1: Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Invoices" 
              value={overview?.invoices.total || 0} 
              icon={Receipt} 
              color="blue" 
              isLoading={isOverviewLoading} 
            />
            <StatCard 
              title="Approved Value" 
              value={overview ? formatCurrency(overview.invoices.totalAmount) : '₹0'} 
              icon={IndianRupee} 
              color="green" 
              isLoading={isOverviewLoading} 
            />
            <StatCard 
              title="Pending Approval" 
              value={overview?.invoices.pending || 0} 
              icon={Clock} 
              color="amber" 
              isLoading={isOverviewLoading} 
            />
            <StatCard 
              title="Docs Processed" 
              value={overview?.counts.documents || 0} 
              icon={FileCheck} 
              color="purple" 
              isLoading={isOverviewLoading} 
            />
          </div>

          {/* Row 2: Trend chart + Quota ring */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold text-navy-900">Invoice Trend</CardTitle>
                  <div className="flex gap-2 bg-slate-100 rounded-md p-1">
                    {(['last7days', 'last30days', 'last90days'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                          period === p 
                            ? 'bg-white text-brand-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {p === 'last7days' ? '7D' : p === 'last30days' ? '30D' : '90D'}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <InvoiceTrendChart data={trendData?.points} isLoading={isTrendLoading} />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-navy-900">Monthly Quota</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuotaRing usage={overview?.usage} isLoading={isOverviewLoading} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Row 3: Subscription info strip (if on FREE plan) */}
          {!isOverviewLoading && overview?.usage?.plan === 'FREE' && (
            <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-brand-900">You're on the Free plan</p>
                <p className="text-sm text-brand-700 mt-0.5">
                  Limited to 10 invoices/month. Upgrade to Pro for unlimited processing, team members, and client portals.
                </p>
              </div>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate('/subscription')}
                className="shrink-0"
              >
                Upgrade to Pro
              </Button>
            </div>
          )}

          {/* Row 4: Top clients + Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-navy-900">Top Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <TopClientsTable clients={clientsData} isLoading={isClientsLoading} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-navy-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivityFeed activities={activityData} isLoading={isActivityLoading} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
