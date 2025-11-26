'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomInput } from '@/components/ui/custom-input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
// import { getCachedPaginatedTeams, invalidateAdminCache } from '@/lib/services/admin-cache';

interface TeamRegistration {
  id: string;
  team_code?: string;
  team_name: string;
  school_name: string;
  school_district: string;
  lead_email: string;
  lead_phone: string;
  registration_status: 'pending' | 'shortlisted' | 'rejected' | 'verified';
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  member_count?: number;
  teacher_verified?: boolean;
  team_members?: Array<{
    name: string;
    email: string;
    phone: string;
    grade: string;
    is_team_lead: boolean;
  }>;
  project_details?: {
    idea_title?: string | null;
    problem_statement?: string | null;
    solution_idea?: string | null;
    implementation_plan?: string | null;
    beneficiaries?: string | null;
    teamwork_contribution?: string | null;
  } | null;
}

interface RegistrationsTableProps {
  onStatsChange: () => void;
}

// Memoized table row component
const TableRowMemo = React.memo(({ 
  registration, 
  onViewDetails, 
  onStatusChange 
}: {
  registration: TeamRegistration;
  onViewDetails: (team: TeamRegistration) => void;
  onStatusChange: (teamId: string, newStatus: string) => void;
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
        <div className="flex flex-col">
          <span>{registration.team_name}</span>
          {registration.team_code && (
            <span className="text-xs text-[#928dab]">{registration.team_code}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-[#928dab]">
        {registration.school_name}
      </TableCell>
      <TableCell className="text-[#928dab]">
        {registration.school_district}
      </TableCell>
      <TableCell className="text-[#928dab]">
        <div className="text-sm">
          <div>{registration.lead_email}</div>
          <div>{registration.lead_phone}</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`${getStatusColor(registration.registration_status)} text-white`}>
          {registration.registration_status}
        </Badge>
      </TableCell>
      <TableCell className="text-[#928dab]">
        {registration.member_count || 0}
      </TableCell>
      <TableCell className="text-[#928dab]">
        {new Date(registration.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(registration)}
            className="border-[#7303c0] text-[#7303c0] hover:bg-[#7303c0] hover:text-white"
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          <Select
            value={registration.registration_status}
            onValueChange={(value) => onStatusChange(registration.id, value)}
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
        </div>
      </TableCell>
    </TableRow>
  );
});

TableRowMemo.displayName = 'TableRowMemo';

// Memoized team details modal
const TeamDetailsModal = React.memo(({ 
  team, 
  onClose, 
  loading 
}: {
  team: TeamRegistration | null;
  onClose: () => void;
  loading: boolean;
}) => {
  if (!team) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-black/90 backdrop-blur-sm border border-[#7303c0] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-orbitron gradient-text">
            {team.team_name}
          </h3>
          <Button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Close
          </Button>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="text-center text-[#928dab]">Loading details...</div>
          )}
          <div>
            <h4 className="font-semibold text-white mb-2">School Details</h4>
            <p className="text-[#928dab]">{team.school_name}</p>
            <p className="text-[#928dab]">{team.school_district}</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Project Details</h4>
            <div className="space-y-2 text-[#928dab]">
              <p><span className="text-white">Idea Title:</span> {team.project_details?.idea_title || 'Not provided'}</p>
              <p><span className="text-white">Problem:</span> {team.project_details?.problem_statement || 'Not provided'}</p>
              <p><span className="text-white">Solution:</span> {team.project_details?.solution_idea || 'Not provided'}</p>
              <p><span className="text-white">How it works:</span> {team.project_details?.implementation_plan || 'Not provided'}</p>
              <p><span className="text-white">Beneficiaries:</span> {team.project_details?.beneficiaries || 'Not provided'}</p>
              <p><span className="text-white">Teamwork:</span> {team.project_details?.teamwork_contribution || 'Not provided'}</p>
            </div>
            {!team.project_details && (
              <p className="text-yellow-500 text-sm mt-2">⚠️ No project details found for this team</p>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Team Members</h4>
            <div className="space-y-2">
              {team.team_members?.map((member, index) => (
                <div key={index} className="bg-black/30 p-3 rounded border border-[#7303c0]/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">
                        {member.name} {member.is_team_lead && '(Lead)'}
                      </p>
                      <p className="text-sm text-[#928dab]">{member.email}</p>
                      <p className="text-sm text-[#928dab]">{member.phone}</p>
                    </div>
                    <Badge className="bg-[#7303c0] text-white">
                      Grade {member.grade}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TeamDetailsModal.displayName = 'TeamDetailsModal';

export function RegistrationsTable({ onStatsChange }: RegistrationsTableProps) {
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<TeamRegistration | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const PAGE_SIZE = 20;

  // Memoized filters
  const filters = useMemo(() => ({
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    districtFilter: districtFilter === 'all' ? undefined : districtFilter,
    searchTerm: searchTerm.trim() || undefined
  }), [statusFilter, districtFilter, searchTerm]);

  // Load registrations with pagination
  const loadRegistrations = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      
      // Direct query without cache
      console.log('Loading registrations directly...');
      let query = supabase
        .from('teams')
        .select(`
          id,
          team_code,
          team_name,
          school_name,
          school_district,
          lead_email,
          lead_phone,
          registration_status,
          created_at,
          teacher_verified,
          team_members (id)
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
        query = query.or(`team_name.ilike.%${filters.searchTerm}%,school_name.ilike.%${filters.searchTerm}%,lead_email.ilike.%${filters.searchTerm}%`);
      }

      // Get total count
      const { count } = await query;
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));

      // Get paginated data
      const { data: teams, error } = await query
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      const teamsWithCount = teams?.map((team: any) => {
        if (!team) return null;
        return {
          id: team.id,
          team_code: team.team_code || undefined,
          team_name: team.team_name,
          school_name: team.school_name,
          school_district: team.school_district,
          lead_email: team.lead_email,
          lead_phone: team.lead_phone,
          registration_status: team.registration_status,
          created_at: team.created_at,
          teacher_verified: team.teacher_verified,
          member_count: team.team_members?.length || 0,
          team_members: undefined
        };
      }).filter((team): team is NonNullable<typeof team> => team !== null) || [];

      setRegistrations(teamsWithCount);
    } catch (error) {
      console.error('Error loading registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load registrations when filters change
  useEffect(() => {
    setCurrentPage(0);
    loadRegistrations(0);
  }, [loadRegistrations]);

  // Memoized unique districts
  const uniqueDistricts = useMemo(() => {
    const districts = Array.from(new Set(registrations.map(reg => reg.school_district)));
    return districts.sort();
  }, [registrations]);

  // Memoized open team details handler
  const openTeamDetails = useCallback(async (team: TeamRegistration) => {
    try {
      setLoadingDetails(true);
      console.log('Loading details for team:', team.id);
      
      // fetch members and project details
      const [{ data: members, error: membersError }, { data: project, error: projectError }] = await Promise.all([
        supabase
          .from('team_members')
          .select('name,email,phone,grade,is_team_lead')
          .eq('team_id', team.id)
          .order('is_team_lead', { ascending: false }),
        supabase
          .from('project_details')
          .select('idea_title,problem_statement,solution_idea,implementation_plan,beneficiaries,teamwork_contribution')
          .eq('team_id', team.id)
          .single(),
      ]) as any;

      console.log('Members data:', members, 'Error:', membersError);
      console.log('Project data:', project, 'Error:', projectError);

      setSelectedTeam({
        ...team,
        team_members: members || [],
        project_details: project || null,
      });
    } catch (error) {
      console.error('Failed to load team details', error);
      toast.error('Failed to load team details');
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // Memoized update status handler
  const updateRegistrationStatus = useCallback(async (teamId: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('teams')
        .update({ registration_status: newStatus })
        .eq('id', teamId);

      if (error) throw error;

      await loadRegistrations(currentPage);
      onStatsChange();
      toast.success('Registration status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update registration status');
    }
  }, [currentPage, loadRegistrations, onStatsChange]);

  // Memoized export handler
  const exportToCSV = useCallback(() => {
    const headers = [
      'Team Code', 'Team Name', 'School', 'District', 'Lead Email', 'Lead Phone', 
      'Status', 'Payment Status', 'Registration Date', 'Team Size'
    ];

    const csvData = registrations.map(reg => [
      reg.team_code || '',
      reg.team_name,
      reg.school_name,
      reg.school_district,
      reg.lead_email,
      reg.lead_phone,
      reg.registration_status,
      reg.payment_status || 'pending',
      new Date(reg.created_at).toLocaleDateString(),
      reg.member_count || 0
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gen201_registrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [registrations]);

  // Memoized pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    loadRegistrations(newPage);
  }, [loadRegistrations]);

  // Memoized close modal handler
  const closeModal = useCallback(() => {
    setSelectedTeam(null);
  }, []);

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-white">Team Registrations</CardTitle>
          <Button
            onClick={exportToCSV}
            className="bg-[#7303c0] hover:bg-[#928dab] text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#928dab] w-4 h-4" />
              <CustomInput
                placeholder="Search teams, schools, emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/50 border-[#7303c0] text-white"
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
                <TableHead className="text-[#928dab]">Team Name</TableHead>
                <TableHead className="text-[#928dab]">School</TableHead>
                <TableHead className="text-[#928dab]">District</TableHead>
                <TableHead className="text-[#928dab]">Lead Contact</TableHead>
                <TableHead className="text-[#928dab]">Status</TableHead>
                <TableHead className="text-[#928dab]">Members</TableHead>
                <TableHead className="text-[#928dab]">Date</TableHead>
                <TableHead className="text-[#928dab]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton rows
                Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <TableRow key={index} className="border-[#7303c0]">
                    {Array.from({ length: 8 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-4 w-full bg-[#7303c0]/20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                registrations.map((registration) => (
                  <TableRowMemo
                    key={registration.id}
                    registration={registration}
                    onViewDetails={openTeamDetails}
                    onStatusChange={updateRegistrationStatus}
                  />
                ))
              )}
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

        {!loading && registrations.length === 0 && (
          <div className="text-center py-8 text-[#928dab]">
            No registrations found matching your filters.
          </div>
        )}
      </CardContent>

      {/* Team Details Modal */}
      <TeamDetailsModal
        team={selectedTeam}
        onClose={closeModal}
        loading={loadingDetails}
      />
    </Card>
  );
}
