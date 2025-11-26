'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, TrendingUp, Users, School } from 'lucide-react';
import { toast } from 'sonner';
// import { getCachedDistrictInsights } from '@/lib/services/admin-cache';

interface DistrictData {
  district: string;
  totalTeams: number;
  totalSchools: number;
  pendingTeams: number;
  shortlistedTeams: number;
  rejectedTeams: number;
  verifiedTeams: number;
  registrationTrend: Array<{
    date: string;
    count: number;
  }>;
}

// Memoized district card component
const DistrictCard = React.memo(({ 
  district, 
  index, 
  topDistricts 
}: {
  district: DistrictData;
  index: number;
  topDistricts: DistrictData[];
}) => {
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'shortlisted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'verified': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  }, []);

  return (
    <div className="p-4 bg-black/20 rounded-lg border border-[#7303c0]/30">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-white text-lg">{district.district}</h3>
          <div className="flex items-center gap-4 text-sm text-[#928dab] mt-1">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {district.totalTeams} teams
            </span>
            <span className="flex items-center gap-1">
              <School className="w-4 h-4" />
              {district.totalSchools} schools
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {district.pendingTeams > 0 && (
          <Badge className="bg-yellow-500 text-white">
            {district.pendingTeams} Pending
          </Badge>
        )}
        {district.shortlistedTeams > 0 && (
          <Badge className="bg-green-500 text-white">
            {district.shortlistedTeams} Shortlisted
          </Badge>
        )}
        {district.verifiedTeams > 0 && (
          <Badge className="bg-blue-500 text-white">
            {district.verifiedTeams} Verified
          </Badge>
        )}
        {district.rejectedTeams > 0 && (
          <Badge className="bg-red-500 text-white">
            {district.rejectedTeams} Rejected
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-[#7303c0] h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min((district.totalTeams / (topDistricts[0]?.totalTeams || 1)) * 100, 100)}%` 
            }}
          />
        </div>
        <div className="text-xs text-[#928dab] mt-1">
          {district.totalTeams > 0 ? 
            `${Math.round((district.shortlistedTeams + district.verifiedTeams) / district.totalTeams * 100)}% success rate` :
            'No teams yet'
          }
        </div>
      </div>
    </div>
  );
});

DistrictCard.displayName = 'DistrictCard';

// Memoized top district leaderboard item
const TopDistrictItem = React.memo(({ 
  district, 
  index 
}: {
  district: DistrictData;
  index: number;
}) => (
  <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-[#7303c0]/30">
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7303c0] text-white font-bold">
        {index + 1}
      </div>
      <div>
        <h3 className="font-semibold text-white">{district.district}</h3>
        <p className="text-sm text-[#928dab]">
          {district.totalSchools} schools participating
        </p>
      </div>
    </div>
    <div className="text-right">
      <div className="text-2xl font-bold text-white">
        {district.totalTeams}
      </div>
      <div className="text-sm text-[#928dab]">teams</div>
    </div>
  </div>
));

TopDistrictItem.displayName = 'TopDistrictItem';

export function DistrictInsights() {
  const [districtData, setDistrictData] = useState<DistrictData[]>([]);
  const [loading, setLoading] = useState(true);
  const [keralaDistricts, setKeralaDistricts] = useState<string[]>([]);

  // Memoized top districts
  const topDistricts = useMemo(() => {
    return districtData.slice(0, 5);
  }, [districtData]);

  // Memoized average teams per district
  const averageTeamsPerDistrict = useMemo(() => {
    if (districtData.length === 0) return 0;
    return Math.round(districtData.reduce((sum, d) => sum + d.totalTeams, 0) / districtData.length);
  }, [districtData]);

  // Load districts from config
  const loadDistricts = useCallback(async () => {
    try {
      console.log('Loading districts for admin insights...');
      const { getActiveDistricts } = await import('@/lib/services/config');
      const activeDistricts = await getActiveDistricts();
      console.log('Loaded districts for admin:', activeDistricts);
      
      if (activeDistricts && activeDistricts.length > 0) {
        setKeralaDistricts(activeDistricts.map(d => d.name));
        console.log('Set keralaDistricts to:', activeDistricts.map(d => d.name));
      } else {
        throw new Error('No active districts found');
      }
    } catch (error) {
      console.error('Failed to load districts:', error);
      // Fallback to hardcoded districts if config fails
      const fallbackDistricts = [
        'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
        'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
        'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad',
      ];
      setKeralaDistricts(fallbackDistricts);
      console.log('Using fallback districts:', fallbackDistricts);
    }
  }, []);

  // Load district data
  const loadDistrictData = useCallback(async () => {
    try {
      // Get current districts list
      const currentDistricts = keralaDistricts.length > 0 ? keralaDistricts : [
        'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
        'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
        'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
      ];

      console.log('Loading district data with districts:', currentDistricts);

      // Direct query without cache
      console.log('Loading district insights directly...');
      const { data: teams, error: fallbackError } = await supabase
        .from('teams')
        .select('school_district, school_name, registration_status, created_at') as {
          data: Array<{
            school_district: string;
            school_name: string;
            registration_status: string;
            created_at: string;
          }> | null;
          error: any;
        };

      if (fallbackError) throw fallbackError;

      // Group data by district (original logic)
      const districtMap = new Map<string, any>();

      teams?.forEach(team => {
        const district = team.school_district;
        
        if (!districtMap.has(district)) {
          districtMap.set(district, {
            district,
            totalTeams: 0,
            schools: new Set(),
            pendingTeams: 0,
            shortlistedTeams: 0,
            rejectedTeams: 0,
            verifiedTeams: 0,
            registrationTrend: []
          });
        }

        const districtInfo = districtMap.get(district);
        districtInfo.totalTeams++;
        districtInfo.schools.add(team.school_name);
        
        switch (team.registration_status) {
          case 'pending':
            districtInfo.pendingTeams++;
            break;
          case 'shortlisted':
            districtInfo.shortlistedTeams++;
            break;
          case 'rejected':
            districtInfo.rejectedTeams++;
            break;
          case 'verified':
            districtInfo.verifiedTeams++;
            break;
        }
      });

      const districtArray = Array.from(districtMap.values()).map(district => ({
        ...district,
        totalSchools: district.schools.size,
        schools: undefined
      }));

      districtArray.sort((a, b) => b.totalTeams - a.totalTeams);
      // Ensure all Kerala districts are present
      const fullList: DistrictData[] = currentDistricts.map((name) => {
        const found = districtArray.find((d) => d.district === name);
        return (
          found || {
            district: name,
            totalTeams: 0,
            totalSchools: 0,
            pendingTeams: 0,
            shortlistedTeams: 0,
            rejectedTeams: 0,
            verifiedTeams: 0,
            registrationTrend: [],
          }
        );
      });
      fullList.sort((a, b) => b.totalTeams - a.totalTeams);
      console.log('Final district data (fallback):', fullList);
      setDistrictData(fullList);
    } catch (error) {
      console.error('Error loading district data:', error);
      toast.error('Failed to load district insights');
    } finally {
      setLoading(false);
    }
  }, [keralaDistricts]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      await loadDistricts();
      await loadDistrictData();
    };
    initializeData();
  }, [loadDistricts, loadDistrictData]);

  if (loading) {
    return (
      <Card className="bg-black/20 backdrop-blur-lg border border-[#7303c0]/30 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 bg-[#7303c0]/20" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full bg-[#7303c0]/20" />
              ))}
            </div>
            <Skeleton className="h-64 w-full bg-[#7303c0]/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/20 backdrop-blur-lg border border-[#7303c0]/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#928dab]">Total Districts</CardTitle>
            <MapPin className="h-4 w-4 text-[#7303c0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{keralaDistricts.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border border-[#7303c0]/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#928dab]">
              Top District
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-white">
              {topDistricts[0]?.district || 'N/A'}
            </div>
            <p className="text-xs text-[#928dab]">
              {topDistricts[0]?.totalTeams || 0} teams
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border border-[#7303c0]/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#928dab]">
              Avg Teams per District
            </CardTitle>
            <Users className="h-4 w-4 text-[#7303c0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {averageTeamsPerDistrict}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Districts Leaderboard */}
      <Card className="bg-black/20 backdrop-blur-lg border border-[#7303c0]/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Performing Districts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topDistricts.map((district, index) => (
              <TopDistrictItem
                key={district.district}
                district={district}
                index={index}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed District Breakdown */}
      <Card className="bg-black/20 backdrop-blur-lg border border-[#7303c0]/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            District-wise Registration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {districtData.map((district) => (
              <DistrictCard
                key={district.district}
                district={district}
                index={0}
                topDistricts={topDistricts}
              />
            ))}
          </div>

          {districtData.length === 0 && (
            <div className="text-center py-8 text-[#928dab]">
              No district data available yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
