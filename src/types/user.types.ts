export interface UserDetailItem {
  id:             string;
  email:          string;
  fullName:       string;
  organizationId: string;
  isActive:       boolean;
  createdAt:      string;
  role: {
    id:          string;
    name:        string;
    permissions?: { name: string }[];
  };
  assignedClients?: { id: string; name: string }[];
}

export interface RoleItem {
  id:          string;
  name:        string;
  permissions: { id: string; name: string; description: string }[];
}

export interface InviteUserInput {
  email:    string;
  fullName: string;
  roleId:   string;
  password: string;
}

export interface UserListFilters {
  search?: string;
  page?:   number;
  limit?:  number;
}
