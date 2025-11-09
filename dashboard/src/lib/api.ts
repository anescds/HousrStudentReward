// API client for Express.js backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiError {
  error: string;
}

export interface LoginRequest {
  dashid: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  cookie: string;
  user: {
    dashId: string;
    name: string;
  };
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/dash/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Store cookie in localStorage
  if (data.cookie) {
    localStorage.setItem('dashboard_auth_cookie', data.cookie);
  }

  return data;
}

export function getAuthCookie(): string | null {
  return localStorage.getItem('dashboard_auth_cookie');
}

export function clearAuthCookie(): void {
  localStorage.removeItem('dashboard_auth_cookie');
}

export interface RedeemsResponse {
  success: boolean;
  partner: string;
  redemptions: { [perkId: number]: number };
}

export async function getRedeems(): Promise<RedeemsResponse> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('getRedeems - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  console.log('getRedeems - Fetching redemption stats');

  const response = await fetch(`${API_BASE_URL}/api/dash/redeems`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface PartnerResponse {
  success: boolean;
  partner: {
    id: number;
    name: string;
    slug: string;
    logo: string;
  };
}

export async function getPartner(): Promise<PartnerResponse> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('getPartner - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  const response = await fetch(`${API_BASE_URL}/api/dash/partner`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  icon?: string;
  discount_percentage: number;
  discount_amount: number | null;
  status: string;
  valid_from: string;
  valid_to: string | null;
  category: string | null;
  views: number;
  redemptions: number;
}

export interface DealsResponse {
  success: boolean;
  deals: Deal[];
}

export async function getDeals(): Promise<DealsResponse> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('getDeals - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  const response = await fetch(`${API_BASE_URL}/api/dash/deals`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface StatsResponse {
  success: boolean;
  stats: {
    totalDeals: number;
    activeDeals: number;
    totalViews: number;
    totalRedemptions: number;
  };
}

export async function getStats(): Promise<StatsResponse> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('getStats - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  const response = await fetch(`${API_BASE_URL}/api/dash/stats`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface AddPerkRequest {
  title: string;
  description: string;
  fullDescription?: string;
  icon?: string;
}

export interface AddPerkResponse {
  success: boolean;
  deal: {
    id: number;
    title: string;
    description: string;
    fullDescription?: string;
    icon?: string;
  };
}

export async function addPerk(perk: AddPerkRequest): Promise<AddPerkResponse> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('addPerk - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  console.log('addPerk - Adding new perk:', perk);

  const response = await fetch(`${API_BASE_URL}/api/dash/add-perk`, {
    method: 'POST',
    headers,
    body: JSON.stringify(perk),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

