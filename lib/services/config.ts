import { supabase } from '@/lib/supabase';

interface ConfigValue {
    key: string;
    value: string;
    description?: string;
}

interface District {
    id: string;
    name: string;
    is_active: boolean;
    display_order: number;
}

// Cache for configuration values
let configCache: Map<string, string> | null = null;
let districtsCache: District[] | null = null;

export async function getConfigValue(key: string, defaultValue?: string): Promise<string> {
    if (!configCache) {
        await loadConfigCache();
    }

    return configCache?.get(key) || defaultValue || '';
}

export async function getConfigValues(keys: string[]): Promise<Record<string, string>> {
    if (!configCache) {
        await loadConfigCache();
    }

    const result: Record<string, string> = {};
    keys.forEach(key => {
        result[key] = configCache?.get(key) || '';
    });
    return result;
}

export async function getDistricts(): Promise<District[]> {
    if (!districtsCache) {
        await loadDistrictsCache();
    }

    return districtsCache || [];
}

export async function getActiveDistricts(): Promise<District[]> {
    const districts = await getDistricts();
    // console.log('All districts from getDistricts:', districts); // Removed for production security
    const activeDistricts = districts.filter(d => d.is_active).sort((a, b) => a.display_order - b.display_order);
    // console.log('Active districts after filtering:', activeDistricts); // Removed for production security
    return activeDistricts;
}

export async function getRegistrationFee(): Promise<number> {
    const fee = await getConfigValue('registration_fee', '50');
    return parseInt(fee, 10);
}

export async function getEventName(): Promise<string> {
    return await getConfigValue('event_name', 'GEN 201');
}

export async function getEventDescription(): Promise<string> {
    return await getConfigValue('event_description', 'Team Registration Fee');
}

export async function getPaymentThemeColor(): Promise<string> {
    return await getConfigValue('payment_theme_color', '#7303c0');
}

export async function getMaxTeamMembers(): Promise<number> {
    const max = await getConfigValue('max_team_members', '4');
    return parseInt(max, 10);
}

export async function getMinTeamMembers(): Promise<number> {
    const min = await getConfigValue('min_team_members', '2');
    return parseInt(min, 10);
}

export async function getCurrency(): Promise<string> {
    return await getConfigValue('currency', 'INR');
}

// Clear cache (useful for admin updates)
export function clearConfigCache(): void {
    configCache = null;
    districtsCache = null;
}

// Load configuration cache
async function loadConfigCache(): Promise<void> {
    try {
        const { data, error } = await supabase
            .from('configuration')
            .select('key, value');

        if (error) throw error;

        configCache = new Map();
        data?.forEach((item: any) => {
            configCache?.set(item.key, item.value);
        });
    } catch (error) {
        console.error('Error loading configuration:', error);
        configCache = new Map();
    }
}

// Load districts cache
async function loadDistrictsCache(): Promise<void> {
    try {
        console.log('Loading districts from database...');
        const { data, error } = await supabase
            .from('districts')
            .select('*')
            .order('display_order');

        if (error) {
            console.error('Supabase error loading districts:', error);
            throw error;
        }

        // console.log('Raw districts data from database:', data); // Removed for production security
        districtsCache = data || [];
        // console.log('Districts cache set to:', districtsCache); // Removed for production security
    } catch (error) {
        console.error('Error loading districts:', error);
        districtsCache = [];
    }
}
