export interface User {
  id:             string;
  email:          string;
  fullName:       string;
  organizationId: string;
  role: {
    id:   string;
    name: string;
  };
  permissions: string[];
  createdAt:   string;
}

export interface Organization {
  id:        string;
  name:      string;
  gstin:     string | null;
  address:   string | null;
}

export interface LoginInput {
  email:    string;
  password: string;
}

export interface SignupInput {
  organizationName: string;
  gstin?:           string;
  adminFullName:    string;
  adminEmail:       string;
  adminPassword:    string;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken:  string;
  refreshToken: string;
  user: User;
}

export interface SignupResponse {
  user:   User;
  tokens: AuthTokens;
}

export interface MeResponse {
  data: User;
}
