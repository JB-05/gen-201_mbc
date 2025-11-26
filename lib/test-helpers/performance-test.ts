import { supabase } from '@/lib/supabase';
import { getCachedDashboardStats, getCachedDistrictInsights, getCachedPaymentInsights, getCachedPaginatedTeams } from '@/lib/services/admin-cache';

interface PerformanceMetrics {
    operation: string;
    duration: number;
    success: boolean;
    error?: string;
    dataSize?: number;
}

class PerformanceTester {
    private metrics: PerformanceMetrics[] = [];

    private async measureOperation<T>(
        operation: string,
        fn: () => Promise<T>
    ): Promise<T> {
        const startTime = performance.now();
        try {
            const result = await fn();
            const endTime = performance.now();
            const duration = endTime - startTime;

            this.metrics.push({
                operation,
                duration,
                success: true,
                dataSize: Array.isArray(result) ? result.length : 1
            });

            console.log(`✅ ${operation}: ${duration.toFixed(2)}ms`);
            return result;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;

            this.metrics.push({
                operation,
                duration,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            console.error(`❌ ${operation}: ${duration.toFixed(2)}ms - ${error}`);
            throw error;
        }
    }

    async testDatabasePerformance() {
        console.log('🚀 Testing Database Performance...');

        try {
            // Test 1: Dashboard Stats (RPC)
            await this.measureOperation('Dashboard Stats (RPC)', async () => {
                const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
                if (error) throw error;
                return data;
            });

            // Test 2: Dashboard Stats (Cached)
            await this.measureOperation('Dashboard Stats (Cached)', async () => {
                return await getCachedDashboardStats();
            });

            // Test 3: District Insights (RPC)
            await this.measureOperation('District Insights (RPC)', async () => {
                const { data, error } = await supabase.rpc('get_district_insights');
                if (error) throw error;
                return data;
            });

            // Test 4: District Insights (Cached)
            await this.measureOperation('District Insights (Cached)', async () => {
                return await getCachedDistrictInsights();
            });

            // Test 5: Payment Insights (RPC)
            await this.measureOperation('Payment Insights (RPC)', async () => {
                const { data, error } = await supabase.rpc('get_payment_insights');
                if (error) throw error;
                return data;
            });

            // Test 6: Payment Insights (Cached)
            await this.measureOperation('Payment Insights (Cached)', async () => {
                return await getCachedPaymentInsights();
            });

            // Test 7: Paginated Teams (RPC)
            await this.measureOperation('Paginated Teams (RPC)', async () => {
                const { data, error } = await (supabase as any).rpc('get_paginated_teams', {
                    page_offset: 0,
                    page_limit: 20,
                    status_filter: null,
                    district_filter: null,
                    search_term: null
                });
                if (error) throw error;
                return data;
            });

            // Test 8: Paginated Teams (Cached)
            await this.measureOperation('Paginated Teams (Cached)', async () => {
                return await getCachedPaginatedTeams(0, 20);
            });

            // Test 9: Direct Query (Fallback)
            await this.measureOperation('Direct Teams Query', async () => {
                const { data, error } = await supabase
                    .from('teams')
                    .select('id, team_name, school_name, school_district, registration_status, created_at')
                    .order('created_at', { ascending: false })
                    .limit(20);
                if (error) throw error;
                return data;
            });

            // Test 10: Complex Join Query
            await this.measureOperation('Complex Join Query', async () => {
                const { data, error } = await supabase
                    .from('teams')
                    .select(`
            id,
            team_name,
            school_name,
            school_district,
            registration_status,
            created_at,
            team_members (name, email, grade),
            payments (amount, payment_status)
          `)
                    .order('created_at', { ascending: false })
                    .limit(10);
                if (error) throw error;
                return data;
            });

        } catch (error) {
            console.error('Performance test failed:', error);
        }
    }

    async testCachePerformance() {
        console.log('🚀 Testing Cache Performance...');

        try {
            // Test cache hit performance
            const operations = [
                'getCachedDashboardStats',
                'getCachedDistrictInsights',
                'getCachedPaymentInsights',
                'getCachedPaginatedTeams'
            ];

            for (const operation of operations) {
                // First call (cache miss)
                await this.measureOperation(`${operation} (Cache Miss)`, async () => {
                    switch (operation) {
                        case 'getCachedDashboardStats':
                            return await getCachedDashboardStats();
                        case 'getCachedDistrictInsights':
                            return await getCachedDistrictInsights();
                        case 'getCachedPaymentInsights':
                            return await getCachedPaymentInsights();
                        case 'getCachedPaginatedTeams':
                            return await getCachedPaginatedTeams(0, 20);
                        default:
                            throw new Error('Unknown operation');
                    }
                });

                // Second call (cache hit)
                await this.measureOperation(`${operation} (Cache Hit)`, async () => {
                    switch (operation) {
                        case 'getCachedDashboardStats':
                            return await getCachedDashboardStats();
                        case 'getCachedDistrictInsights':
                            return await getCachedDistrictInsights();
                        case 'getCachedPaymentInsights':
                            return await getCachedPaymentInsights();
                        case 'getCachedPaginatedTeams':
                            return await getCachedPaginatedTeams(0, 20);
                        default:
                            throw new Error('Unknown operation');
                    }
                });
            }

        } catch (error) {
            console.error('Cache performance test failed:', error);
        }
    }

    generateReport(): string {
        const successfulOps = this.metrics.filter(m => m.success);
        const failedOps = this.metrics.filter(m => !m.success);

        const avgDuration = successfulOps.reduce((sum, m) => sum + m.duration, 0) / successfulOps.length;
        const minDuration = Math.min(...successfulOps.map(m => m.duration));
        const maxDuration = Math.max(...successfulOps.map(m => m.duration));

        const report = `
📊 Performance Test Report
========================

✅ Successful Operations: ${successfulOps.length}
❌ Failed Operations: ${failedOps.length}
⏱️  Average Duration: ${avgDuration.toFixed(2)}ms
⚡ Fastest Operation: ${minDuration.toFixed(2)}ms
🐌 Slowest Operation: ${maxDuration.toFixed(2)}ms

📈 Performance by Operation:
${successfulOps
                .sort((a, b) => a.duration - b.duration)
                .map(m => `  ${m.operation}: ${m.duration.toFixed(2)}ms`)
                .join('\n')}

${failedOps.length > 0 ? `
❌ Failed Operations:
${failedOps.map(m => `  ${m.operation}: ${m.error}`).join('\n')}
` : ''}

🎯 Recommendations:
${this.generateRecommendations()}
`;

        return report;
    }

    private generateRecommendations(): string {
        const slowOps = this.metrics.filter(m => m.success && m.duration > 1000);
        const recommendations: string[] = [];

        if (slowOps.length > 0) {
            recommendations.push(`- Consider optimizing these slow operations: ${slowOps.map(o => o.operation).join(', ')}`);
        }

        const cacheOps = this.metrics.filter(m => m.operation.includes('Cached'));
        const directOps = this.metrics.filter(m => !m.operation.includes('Cached') && !m.operation.includes('RPC'));

        if (cacheOps.length > 0 && directOps.length > 0) {
            const avgCacheTime = cacheOps.reduce((sum, m) => sum + m.duration, 0) / cacheOps.length;
            const avgDirectTime = directOps.reduce((sum, m) => sum + m.duration, 0) / directOps.length;

            if (avgCacheTime < avgDirectTime * 0.5) {
                recommendations.push(`- Cache is providing ${((avgDirectTime - avgCacheTime) / avgDirectTime * 100).toFixed(1)}% performance improvement`);
            }
        }

        if (recommendations.length === 0) {
            recommendations.push('- Performance looks good! No major optimizations needed.');
        }

        return recommendations.join('\n');
    }

    getMetrics(): PerformanceMetrics[] {
        return [...this.metrics];
    }

    clearMetrics(): void {
        this.metrics = [];
    }
}

export async function runPerformanceTests(): Promise<string> {
    const tester = new PerformanceTester();

    console.log('🚀 Starting Admin Dashboard Performance Tests...');

    await tester.testDatabasePerformance();
    await tester.testCachePerformance();

    const report = tester.generateReport();
    console.log(report);

    return report;
}

// Run tests if called directly
if (typeof window === 'undefined') {
    runPerformanceTests().then(report => {
        console.log('Performance test completed');
    });
}
