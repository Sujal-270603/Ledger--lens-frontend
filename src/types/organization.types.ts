export interface OrganizationResponse {
  id:      string;
  name:    string;
  gstin:   string | null;
  address: string | null;
  quota: {
    invoicesProcessed: number;
    invoicesLimit:     number;
    resetDate:         string;
  };
}

export interface UpdateOrganizationInput {
  name?:    string;
  gstin?:   string;
  address?: string;
}
