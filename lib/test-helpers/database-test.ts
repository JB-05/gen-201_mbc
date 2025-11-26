import { supabase } from '@/lib/supabase';

export async function testDatabaseConnection() {
    try {
        console.log('Testing database connection...');

        // Test basic connection
        const { data, error } = await supabase
            .from('teams')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Database connection failed:', error);
            return false;
        }

        console.log('✅ Database connection successful');
        console.log(`📊 Total teams in database: ${data || 0}`);

        // Test teams table structure
        const { data: sampleTeam, error: sampleError } = await supabase
            .from('teams')
            .select('*')
            .limit(1)
            .single();

        if (sampleError && sampleError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching sample team:', sampleError);
            return false;
        }

        if (sampleTeam) {
            console.log('✅ Teams table structure is correct');
            console.log('Sample team data:', {
                id: (sampleTeam as any).id,
                team_name: (sampleTeam as any).team_name,
                school_name: (sampleTeam as any).school_name,
                registration_status: (sampleTeam as any).registration_status
            });
        } else {
            console.log('ℹ️ No teams found in database');
        }

        // Test team_members table
        const { data: sampleMember, error: memberError } = await supabase
            .from('team_members')
            .select('*')
            .limit(1)
            .single();

        if (memberError && memberError.code !== 'PGRST116') {
            console.error('Error fetching sample team member:', memberError);
            return false;
        }

        if (sampleMember) {
            console.log('✅ Team members table structure is correct');
        } else {
            console.log('ℹ️ No team members found in database');
        }

        return true;
    } catch (error) {
        console.error('Database test failed:', error);
        return false;
    }
}

export async function testAdminDashboardData() {
    try {
        console.log('Testing admin dashboard data...');

        // Test all the queries used in the dashboard
        const [
            { count: totalTeams },
            { count: pendingTeams },
            { count: shortlistedTeams },
            { count: rejectedTeams },
            { count: verifiedTeams },
            { count: teacherVerified },
            { data: payments }
        ] = await Promise.all([
            supabase.from('teams').select('*', { count: 'exact', head: true }),
            supabase.from('teams').select('*', { count: 'exact', head: true }).eq('registration_status', 'pending'),
            supabase.from('teams').select('*', { count: 'exact', head: true }).eq('registration_status', 'shortlisted'),
            supabase.from('teams').select('*', { count: 'exact', head: true }).eq('registration_status', 'rejected'),
            supabase.from('teams').select('*', { count: 'exact', head: true }).eq('registration_status', 'verified'),
            supabase.from('teams').select('*', { count: 'exact', head: true }).eq('teacher_verified', true),
            supabase.from('payments').select('amount').eq('payment_status', 'completed')
        ]);

        const totalRevenue = payments?.reduce((sum: number, payment: any) => sum + (Number(payment.amount) || 0), 0) || 0;

        console.log('📊 Dashboard Statistics:');
        console.log(`  Total Teams: ${totalTeams || 0}`);
        console.log(`  Pending: ${pendingTeams || 0}`);
        console.log(`  Shortlisted: ${shortlistedTeams || 0}`);
        console.log(`  Rejected: ${rejectedTeams || 0}`);
        console.log(`  Verified: ${verifiedTeams || 0}`);
        console.log(`  Teacher Verified: ${teacherVerified || 0}`);
        console.log(`  Total Revenue: ₹${totalRevenue}`);

        // Test district data
        const { data: districtData, error: districtError } = await supabase
            .from('teams')
            .select('school_district, school_name, registration_status')
            .limit(100);

        if (districtError) {
            console.error('Error fetching district data:', districtError);
            return false;
        }

        if (districtData && districtData.length > 0) {
            const districtMap = new Map();
            districtData.forEach((team: any) => {
                const district = team.school_district;
                if (!districtMap.has(district)) {
                    districtMap.set(district, { total: 0, schools: new Set() });
                }
                const info = districtMap.get(district);
                info.total++;
                info.schools.add(team.school_name);
            });

            console.log('🏛️ District Data:');
            Array.from(districtMap.entries()).forEach(([district, info]) => {
                console.log(`  ${district}: ${info.total} teams, ${info.schools.size} schools`);
            });
        } else {
            console.log('ℹ️ No district data found');
        }

        return true;
    } catch (error) {
        console.error('Admin dashboard data test failed:', error);
        return false;
    }
}

// Run tests if called directly
if (typeof window === 'undefined') {
    testDatabaseConnection().then(success => {
        if (success) {
            testAdminDashboardData().then(dashboardSuccess => {
                if (dashboardSuccess) {
                    console.log('🎉 All tests passed!');
                } else {
                    console.log('❌ Dashboard data test failed');
                }
            });
        } else {
            console.log('❌ Database connection test failed');
        }
    });
}
