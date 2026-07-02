import { createClient } from '@/lib/supabase/server';

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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single();

  if (error || !data) {
    return getDefaultSettings();
  }

  cachedSettings = {
    storeName: data.store_name || 'Anums Store',
    storeEmail: data.store_email || 'hello@anumsstore.com',
    storePhone: data.store_phone || '',
    storeAddress: data.store_address || '',
    storeWebsite: data.store_website || 'https://anumsstore.com',
    bankName: data.bank_name || '',
    bankAccountNumber: data.bank_account_number || '',
    bankAccountName: data.bank_account_name || '',
    currency: data.currency || 'NGN',
  };
  cacheTimestamp = now;

  return cachedSettings;
}

function getDefaultSettings(): BusinessSettings {
  return {
    storeName: 'Anums Store',
    storeEmail: 'hello@anumsstore.com',
    storePhone: '',
    storeAddress: '',
    storeWebsite: 'https://anumsstore.com',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    currency: 'NGN',
  };
}

export async function businessSettings(): Promise<BusinessSettings> {
  return getBusinessSettings();
}
