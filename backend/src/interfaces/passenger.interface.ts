export interface Passenger {
  id: string;
  company_id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  email?: string;
  national_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePassengerInput {
  companyId?: string;
  fullName: string;
  phone: string;
  email?: string;
  nationalId?: string;
}

export interface UpdatePassengerInput {
  fullName?: string;
  phone?: string;
  email?: string;
  nationalId?: string;
}
