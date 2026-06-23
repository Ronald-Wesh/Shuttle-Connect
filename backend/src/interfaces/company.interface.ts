export interface Company {
  id: string;
  name: string;
  registration_number?: string;
  phone?: string;
  email?: string;
  owner_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyInput {
  name: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
}

export interface UpdateCompanyInput {
  name?: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}
