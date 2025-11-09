// API client for Express.js backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface GenerateRoastRequest {
  balance: number;
  monthlyEarned: number;
  recentPayments: Array<{
    merchant: string;
    amount: number;
  }>;
}

export interface GenerateRoastResponse {
  roast: string;
}

export interface ApiError {
  error: string;
}

export interface Perk {
  id: number;
  name: string;
  cost: number;
  icon: string;
  category: string;
  description: string;
}

export interface Partner {
  id: number;
  name: string;
  slug: string;
  logo: string;
  logoUrl: string;
  route: string;
  deals: PartnerDeal[];
}

export interface PartnerDeal {
  id: number;
  title: string;
  description: string;
  icon: string;
  fullDescription?: string;
}

export interface PartnerPerksResponse {
  partner: Partner;
  perks: PartnerDeal[];
}

export async function generateRoast(data: GenerateRoastRequest): Promise<GenerateRoastResponse> {
  const response = await fetch(`${API_BASE_URL}/api/user/generate-roast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getPerks(): Promise<{ perks: Perk[] }> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('getPerks - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  console.log('getPerks - Sending request with cookie:', cookie.substring(0, 20) + '...');

  const response = await fetch(`${API_BASE_URL}/api/user/perks`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getPartners(): Promise<{ partners: Partner[] }> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('getPartners - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  console.log('getPartners - Sending request with cookie:', cookie.substring(0, 20) + '...');

  const response = await fetch(`${API_BASE_URL}/api/user/partners`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getPartnerPerks(partnerSlug: string): Promise<PartnerPerksResponse> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('getPartnerPerks - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  console.log('getPartnerPerks - Sending request with cookie:', cookie.substring(0, 20) + '...');

  const response = await fetch(`${API_BASE_URL}/api/user/partners/${partnerSlug}/perks`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface LoginRequest {
  userid: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  cookie: string;
  user: {
    userId: string;
    name: string;
  };
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/user/login`, {
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
    localStorage.setItem('auth_cookie', data.cookie);
  }

  return data;
}

export function getAuthCookie(): string | null {
  return localStorage.getItem('auth_cookie');
}

export function clearAuthCookie(): void {
  localStorage.removeItem('auth_cookie');
}

export interface Transaction {
  id?: string;
  amount: number;
  description: string;
  type?: string;
  credits?: number;
  date?: string;
  merchant?: string;
  userId?: string;
  [key: string]: any; // Allow additional fields
}

export interface WalletResponse {
  success: boolean;
  transactions: Transaction[];
}

export interface TransactionResponse {
  success: boolean;
  transaction: Transaction;
}

export interface BalanceResponse {
  success: boolean;
  balance: number;
}

export async function getBalance(): Promise<BalanceResponse> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('getBalance - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  console.log('getBalance - Fetching balance');

  const response = await fetch(`${API_BASE_URL}/api/user/balance`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface StartTestResponse {
  success: boolean;
  message: string;
  duration: string;
  transactionsPerMonth: number;
}

export interface EndTestResponse {
  success: boolean;
  message: string;
  isRunning: boolean;
}

export async function startTest(): Promise<StartTestResponse> {
  const cookie = getAuthCookie();

  if (!cookie) {
    console.error('startTest - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  console.log('startTest - Starting test simulation');

  const response = await fetch(`${API_BASE_URL}/api/user/start-test`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function endTest(): Promise<EndTestResponse> {
  const cookie = getAuthCookie();

  if (!cookie) {
    console.error('endTest - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  console.log('endTest - Stopping test simulation');

  const response = await fetch(`${API_BASE_URL}/api/user/end-test`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getWallet(): Promise<WalletResponse> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('getWallet - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  console.log('getWallet - Fetching transactions');

  const response = await fetch(`${API_BASE_URL}/api/user/wallet`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function createTransaction(transaction: Transaction): Promise<TransactionResponse & { balance: number }> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('createTransaction - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  console.log('createTransaction - Sending transaction:', transaction);

  const response = await fetch(`${API_BASE_URL}/api/user/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const transactionResponse: TransactionResponse = await response.json();

  // Fetch balance after creating transaction
  const balanceResponse = await getBalance();

  return {
    ...transactionResponse,
    balance: balanceResponse.balance
  };
}

export interface RedeemPerkRequest {
  perkId: number;
  perkName: string;
  cost: number;
}

export interface RedeemPerkResponse {
  success: boolean;
  perkName?: string;
  cost?: number;
  previousBalance?: number;
  newBalance?: number;
  error?: string;
  currentBalance?: number;
  required?: number;
}

export async function redeemPerk(perk: RedeemPerkRequest): Promise<RedeemPerkResponse> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('redeemPerk - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  console.log('redeemPerk - Redeeming perk:', perk);

  const response = await fetch(`${API_BASE_URL}/api/user/redeem-perk`, {
    method: 'POST',
    headers,
    body: JSON.stringify(perk),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}

export interface RedeemPartnerPerkRequest {
  perkId: number;
}

export interface RedeemPartnerPerkResponse {
  success: boolean;
  partner: string;
  perkId: number;
  redemptionCount: number;
}

export async function redeemPartnerPerk(partnerSlug: string, perkId: number): Promise<RedeemPartnerPerkResponse> {
  const cookie = getAuthCookie();
  
  if (!cookie) {
    console.error('redeemPartnerPerk - No cookie found in localStorage');
    throw new Error('Authentication required. Please login.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cookie}`,
    'x-auth-cookie': cookie,
  };

  console.log('redeemPartnerPerk - Redeeming partner perk:', { partnerSlug, perkId });

  const response = await fetch(`${API_BASE_URL}/api/user/${partnerSlug}/redeem-perks`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ perkId }),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

