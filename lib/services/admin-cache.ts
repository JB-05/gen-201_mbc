// import { supabase } from '@/lib/supabase';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_SIZE = 100; // Maximum number of cached items

interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class AdminCache {
    private cache = new Map<string, CacheItem<any>>();
    private pendingRequests = new Map<string, Promise<any>>();

    // Generate cache key
    public getCacheKey(prefix: string, params?: Record<string, any>): string {
        if (!params) return prefix;
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}:${params[key]}`)
            .join('|');
        return `${prefix}:${sortedParams}`;
    }

    // Check if cache item is valid
    private isValid(item: CacheItem<any>): boolean {
        return Date.now() < item.expiresAt;
    }

    // Clean expired items
    private cleanExpired(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];
        this.cache.forEach((item, key) => {
            if (now >= item.expiresAt) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    // Manage cache size
    private manageCacheSize(): void {
        if (this.cache.size > MAX_CACHE_SIZE) {
            // Remove oldest items
            const entries: Array<[string, CacheItem<any>]> = [];
            this.cache.forEach((item, key) => {
                entries.push([key, item]);
            });
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

            const toRemove = entries.slice(0, this.cache.size - MAX_CACHE_SIZE);
            toRemove.forEach(([key]) => this.cache.delete(key));
        }
    }

    // Get from cache or execute function
    async get<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttl: number = CACHE_DURATION
    ): Promise<T> {
        // Clean expired items periodically
        if (Math.random() < 0.1) { // 10% chance
            this.cleanExpired();
        }

        // Check if request is already pending
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key)!;
        }

        // Check cache
        const cached = this.cache.get(key);
        if (cached && this.isValid(cached)) {
            return cached.data;
        }

        // Create new request
        const request = fetcher().then(data => {
            // Cache the result
            this.cache.set(key, {
                data,
                timestamp: Date.now(),
                expiresAt: Date.now() + ttl
            });

            // Manage cache size
            this.manageCacheSize();

            // Remove from pending requests
            this.pendingRequests.delete(key);

            return data;
        }).catch(error => {
            // Remove from pending requests on error
            this.pendingRequests.delete(key);
            throw error;
        });

        // Store pending request
        this.pendingRequests.set(key, request);

        return request;
    }

    // Invalidate cache by key pattern
    invalidate(pattern: string): void {
        const keysToDelete: string[] = [];
        this.cache.forEach((_, key) => {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    // Clear all cache
    clear(): void {
        this.cache.clear();
        this.pendingRequests.clear();
    }

    // Get cache stats
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create singleton instance
export const adminCache = new AdminCache();

// Cached admin dashboard stats
export async function getCachedDashboardStats() {
    throw new Error('Cache functions not available - use direct queries');
}

// Cached district insights
export async function getCachedDistrictInsights() {
    throw new Error('Cache functions not available - use direct queries');
}

// Cached payment insights
export async function getCachedPaymentInsights() {
    throw new Error('Cache functions not available - use direct queries');
}

// Cached paginated teams
export async function getCachedPaginatedTeams(
    page: number = 0,
    limit: number = 50,
    statusFilter?: string,
    districtFilter?: string,
    searchTerm?: string
) {
    throw new Error('Cache functions not available - use direct queries');
}

// Invalidate cache when data changes
export function invalidateAdminCache(type: 'stats' | 'teams' | 'payments' | 'districts' | 'all' = 'all') {
    switch (type) {
        case 'stats':
            adminCache.invalidate('dashboard_stats');
            break;
        case 'teams':
            adminCache.invalidate('paginated_teams');
            adminCache.invalidate('dashboard_stats');
            break;
        case 'payments':
            adminCache.invalidate('payment_insights');
            adminCache.invalidate('dashboard_stats');
            break;
        case 'districts':
            adminCache.invalidate('district_insights');
            break;
        case 'all':
            adminCache.clear();
            break;
    }
}
