import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import type { InvoiceTrendPoint } from '@/types/dashboard.types';

interface InvoiceTrendChartProps {
  data?: InvoiceTrendPoint[];
  isLoading?: boolean;
}

export default function InvoiceTrendChart({ data, isLoading }: InvoiceTrendChartProps) {
  if (isLoading) {
    return (
      <div className="h-[280px] w-full pt-4">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
        <p>No trend data available for this period</p>
      </div>
    );
  }

  // Format dates for display (e.g., "2023-10-15" to "Oct 15")
  const formattedData = data.map(point => {
    const d = new Date(point.date);
    return {
      ...point,
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  return (
    <div className="h-[280px] w-full pt-4 -ml-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="displayDate" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            dy={10}
            minTickGap={20}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            dx={-10}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' 
            }}
            labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            name="Total Invoices"
            stroke="#3B82F6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
