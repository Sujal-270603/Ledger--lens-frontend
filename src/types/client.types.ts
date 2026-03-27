import type { InvoiceListItem } from './invoice.types';

export interface ClientListItem {
  id:        string;
  name:      string;
  gstin:     string | null;
  email:     string | null;
  phone:     string | null;
  createdAt: string;
  _count: {
    invoices: number;
  };
}

export interface ClientDetailItem extends ClientListItem {
  organizationId: string;
  recentInvoices: InvoiceListItem[];
  assignedUsers?: UserListItem[];
}

export interface CreateClientInput {
  name:   string;
  gstin?: string;
  email?: string;
  phone?: string;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {}

export interface ClientListFilters {
  search?: string;
  page?:   number;
  limit?:  number;
}

export interface UserListItem {
  id:       string;
  fullName: string;
  email:    string;
  role:     string | { name: string };
}
