export interface DashboardOverview {
  invoices: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: string;
  };
  usage: {
    plan: string;
    invoicesProcessed: number;
    invoicesLimit: number;
  };
  counts: {
    documents: number;
    clients: number;
    users: number;
  };
}

export interface InvoiceTrendPoint {
  date: string;
  count: number;
  amount: string;
}

export interface InvoiceTrend {
  points: InvoiceTrendPoint[];
}

export interface TopClient {
  id: string;
  name: string;
  count: number;
  amount: string;
}

export interface RecentActivity {
  id: string;
  action: string;
  resource: string;
  details: any;
  createdAt: string;
  user: { fullName: string } | null;
}

export type TrendPeriod = 'last7days' | 'last30days' | 'last90days';
