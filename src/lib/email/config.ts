import { createServiceRoleClient } from '@/lib/supabase/service-role';

export interface BusinessSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeWebsite: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  currency: string;
}

const CACHE_TTL = 5 * 60 * 1000;
let cachedSettings: BusinessSettings | null = null;
let cacheTimestamp = 0;

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const now = Date.now();
  if (cachedSettings && now - cacheTimestamp < CACHE_TTL) {
    return cachedSettings;
  }

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error || !data) {
    return getDefaultSettings();
  }

  const list = data as Array<{ key: string; value: string }>
  const map = list.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);

  cachedSettings = {
    storeName: map.store_name || process.env.NEXT_PUBLIC_STORE_NAME || 'Anums Store',
    storeEmail: map.store_email || process.env.NEXT_PUBLIC_STORE_EMAIL || '',
    storePhone: map.store_phone || process.env.NEXT_PUBLIC_STORE_PHONE || '',
    storeAddress: map.store_address || '',
    storeWebsite: process.env.NEXT_PUBLIC_BASE_URL || 'https://anumsstore.pk',
    bankName: map.bank_name || '',
    bankAccountNumber: map.bank_account || '',
    bankAccountName: map.bank_account_title || '',
    currency: 'PKR',
  };
  cacheTimestamp = now;

  return cachedSettings;
}

function getDefaultSettings(): BusinessSettings {
  return {
    storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'Anums Store',
    storeEmail: process.env.NEXT_PUBLIC_STORE_EMAIL || '',
    storePhone: process.env.NEXT_PUBLIC_STORE_PHONE || '',
    storeAddress: '',
    storeWebsite: process.env.NEXT_PUBLIC_BASE_URL || 'https://anumsstore.pk',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    currency: 'PKR',
  };
}

export async function businessSettings(): Promise<BusinessSettings> {
  return getBusinessSettings();
}
