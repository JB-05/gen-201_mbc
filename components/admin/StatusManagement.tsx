'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
// import { getCachedPaginatedTeams, invalidateAdminCache } from '@/lib/services/admin-cache';

interface TeamForReview {
  id: string;
  team_name: string;
  school_name: string;
  school_district: string;
  lead_email: string;
  lead_phone: string;
  registration_status: 'pending' | 'shortlisted' | 'rejected' | 'verified';
  teacher_verified: boolean;
  created_at: string;
  team_members: Array<{
    name: string;
    email: string;
    phone: string;
    grade: string;
    is_team_lead: boolean;
  }>;
  teacher_details?: {
    name: string;
    phone: string;
    salutation: string;
  };
}

interface StatusManagementProps {
  onStatsChange: () => void;
}

// Memoized team review row
const TeamReviewRow = React.memo(({ 
  team, 
  onStatusChange, 
  onTeacherVerification 
}: {
  team: TeamForReview;
  onStatusChange: (teamId: string, newStatus: string) => void;
  onTeacherVerification: (teamId: string, verified: boolean) => void;
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
    <TableRow className="border-[#7303c0]">
      <TableCell className="font-medium text-white">
        <div>
          <div className="font-semibold">{team.team_name}</div>
          <div className="text-sm text-[#928dab]">{team.school_name}</div>
          <div className="text-xs text-[#928dab]">{team.school_district}</div>
        </div>
      </TableCell>
      <TableCell className="text-[#928dab]">
        <div className="space-y-1">
          {team.team_members.map((member, index) => (
            <div key={index} className="text-sm">
              <div className="font-medium text-white">
                {member.name} {member.is_team_lead && '(Lead)'}
              </div>
              <div className="text-xs text-[#928dab]">
                {member.email} • {member.phone} • Grade {member.grade}
              </div>
            </div>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-[#928dab]">
        {team.teacher_details ? (
          <div className="text-sm">
            <div className="font-medium text-white">
              {team.teacher_details.salutation} {team.teacher_details.name}
            </div>
            <div className="text-xs text-[#928dab]">
              {team.teacher_details.phone}
            </div>
          </div>
        ) : (
          <span className="text-yellow-500 text-sm">No teacher details</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(team.registration_status)} text-white`}>
            {team.registration_status}
          </Badge>
          <div className="flex items-center gap-1">
            {team.teacher_verified ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-[#928dab]">
              {team.teacher_verified ? 'Verified' : 'Not Verified'}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Select
            value={team.registration_status}
            onValueChange={(value) => onStatusChange(team.id, value)}
          >
            <SelectTrigger className="w-32 h-8 text-xs bg-black/50 border-[#7303c0] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-[#7303c0]">
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shortlisted">Shortlist</SelectItem>
              <SelectItem value="rejected">Reject</SelectItem>
              <SelectItem value="verified">Verify</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTeacherVerification(team.id, !team.teacher_verified)}
            className={`h-8 text-xs border-[#7303c0] ${
              team.teacher_verified 
                ? 'text-red-500 hover:bg-red-500 hover:text-white' 
                : 'text-green-500 hover:bg-green-500 hover:text-white'
            }`}
          >
            {team.teacher_verified ? 'Unverify' : 'Verify'}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

TeamReviewRow.displayName = 'TeamReviewRow';

export function StatusManagement({ onStatsChange }: StatusManagementProps) {
  const [teams, setTeams] = useState<TeamForReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const PAGE_SIZE = 15;

  // Memoized filters
  const filters = useMemo(() => ({
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    districtFilter: districtFilter === 'all' ? undefined : districtFilter,
    searchTerm: searchTerm.trim() || undefined
  }), [statusFilter, districtFilter, searchTerm]);

  // Load teams with pagination
  const loadTeams = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      console.log('Loading teams for page:', page, 'with filters:', filters);

      // Direct query without cache
      let query = supabase
        .from('teams')
        .select(`
          id,
          team_name,
          school_name,
          school_district,
          lead_email,
          lead_phone,
          registration_status,
          created_at,
          teacher_verified
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.statusFilter) {
        query = query.eq('registration_status', filters.statusFilter);
      }
      if (filters.districtFilter) {
        query = query.eq('school_district', filters.districtFilter);
      }
      if (filters.searchTerm) {
        query = query.or(`team_name.ilike.%${filters.searchTerm}%,school_name.ilike.%${filters.searchTerm}%`);
      }

      // Get total count
      const { count, error: countError } = await query;
      if (countError) {
        console.error('Error getting count:', countError);
        throw countError;
      }
      
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
      console.log('Total teams:', count, 'Total pages:', Math.ceil((count || 0) / PAGE_SIZE));

      // Get paginated data
      const { data: teams, error } = await query
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }

      console.log('Fetched teams:', teams?.length || 0);

      // Load team members and teacher details for each team
      const teamsWithDetails = await Promise.all(
        (teams || []).map(async (team: any) => {
          try {
            const [{ data: members }, { data: teacherVerification }] = await Promise.all([
              supabase
                .from('team_members')
                .select('name,email,phone,grade,is_team_lead')
                .eq('team_id', team.id)
                .order('is_team_lead', { ascending: false }),
              supabase
                .from('teacher_verifications')
                .select('teacher_name,teacher_phone,salutation')
                .eq('team_id', team.id)
                .single()
            ]);

            return {
              ...team,
              team_members: members || [],
              teacher_details: teacherVerification ? {
                name: (teacherVerification as any).teacher_name || '',
                phone: (teacherVerification as any).teacher_phone || '',
                salutation: (teacherVerification as any).salutation || ''
              } : undefined
            };
          } catch (error) {
            console.error('Error loading team details:', error);
            return {
              ...team,
              team_members: [],
              teacher_details: undefined
            };
          }
        })
      );
      
      console.log('Teams with details:', teamsWithDetails.length);
      setTeams(teamsWithDetails);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load teams when filters change
  useEffect(() => {
    setCurrentPage(0);
    loadTeams(0);
  }, [loadTeams]);

  // Memoized unique districts
  const uniqueDistricts = useMemo(() => {
    const districts = Array.from(new Set(teams.map(team => team.school_district)));
    return districts.sort();
  }, [teams]);

  // Memoized update status handler
  const updateTeamStatus = useCallback(async (teamId: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('teams')
        .update({ registration_status: newStatus })
        .eq('id', teamId);

      if (error) throw error;

      await loadTeams(currentPage);
      onStatsChange();
      toast.success('Team status updated successfully');
    } catch (error) {
      console.error('Error updating team status:', error);
      toast.error('Failed to update team status');
    }
  }, [currentPage, loadTeams, onStatsChange]);

  // Memoized teacher verification handler
  const updateTeacherVerification = useCallback(async (teamId: string, verified: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('teams')
        .update({ teacher_verified: verified })
        .eq('id', teamId);

      if (error) throw error;

      await loadTeams(currentPage);
      onStatsChange();
      toast.success(`Teacher ${verified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Error updating teacher verification:', error);
      toast.error('Failed to update teacher verification');
    }
  }, [currentPage, loadTeams, onStatsChange]);

  // Memoized pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    loadTeams(newPage);
  }, [loadTeams]);

  // Memoized stats
  const stats = useMemo(() => {
    const total = teams.length;
    const pending = teams.filter(t => t.registration_status === 'pending').length;
    const shortlisted = teams.filter(t => t.registration_status === 'shortlisted').length;
    const verified = teams.filter(t => t.registration_status === 'verified').length;
    const teacherVerified = teams.filter(t => t.teacher_verified).length;

    return { total, pending, shortlisted, verified, teacherVerified };
  }, [teams]);

  if (loading) {
    return (
      <Card className="bg-transparent border-none shadow-none">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 bg-[#7303c0]/20" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full bg-[#7303c0]/20" />
              ))}
        </div>
            <Skeleton className="h-64 w-full bg-[#7303c0]/20" />
      </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl text-white">Team Review & Status Management</CardTitle>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <Card className="bg-black/20 backdrop-blur-lg border border-[#7303c0]/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#7303c0]" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-[#928dab]">Total Teams</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 backdrop-blur-lg border border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.pending}</div>
                  <div className="text-xs text-[#928dab]">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 backdrop-blur-lg border border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.shortlisted}</div>
                  <div className="text-xs text-[#928dab]">Shortlisted</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 backdrop-blur-lg border border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.verified}</div>
                  <div className="text-xs text-[#928dab]">Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 backdrop-blur-lg border border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
        <div>
                  <div className="text-2xl font-bold text-white">{stats.teacherVerified}</div>
                  <div className="text-xs text-[#928dab]">Teacher Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#928dab] w-4 h-4" />
              <input
                type="text"
                placeholder="Search teams, schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-[#7303c0] rounded-lg text-white placeholder-[#928dab] focus:outline-none focus:border-[#7303c0]/60"
              />
            </div>
        </div>
        
          <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-black/50 border-[#7303c0] text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
            <SelectContent className="bg-black border-[#7303c0]">
              <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>

          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger className="w-48 bg-black/50 border-[#7303c0] text-white">
              <SelectValue placeholder="Filter by district" />
            </SelectTrigger>
            <SelectContent className="bg-black border-[#7303c0]">
              <SelectItem value="all">All Districts</SelectItem>
              {uniqueDistricts.map(district => (
                <SelectItem key={district} value={district}>{district}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      </CardHeader>

        <CardContent>
        <div className="rounded-md border border-[#7303c0]">
            <Table>
              <TableHeader>
              <TableRow className="border-[#7303c0]">
                <TableHead className="text-[#928dab]">Team & School</TableHead>
                  <TableHead className="text-[#928dab]">Team Members</TableHead>
                  <TableHead className="text-[#928dab]">Teacher Details</TableHead>
                <TableHead className="text-[#928dab]">Status & Verification</TableHead>
                  <TableHead className="text-[#928dab]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {teams.map((team) => (
                <TeamReviewRow
                  key={team.id}
                  team={team}
                  onStatusChange={updateTeamStatus}
                  onTeacherVerification={updateTeacherVerification}
                />
                ))}
              </TableBody>
            </Table>
          </div>
          
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-[#928dab]">
              Showing {currentPage * PAGE_SIZE + 1} to {Math.min((currentPage + 1) * PAGE_SIZE, totalCount)} of {totalCount} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="border-[#7303c0] text-[#7303c0] hover:bg-[#7303c0] hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="border-[#7303c0] text-[#7303c0] hover:bg-[#7303c0] hover:text-white"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {teams.length === 0 && (
            <div className="text-center py-8 text-[#928dab]">
            No teams found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
  );
}
