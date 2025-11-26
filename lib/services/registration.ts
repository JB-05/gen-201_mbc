import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type TeamInsert = Database['public']['Tables']['teams']['Insert'];
type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];
type ProjectDetailsInsert = Database['public']['Tables']['project_details']['Insert'];
type TeacherVerificationInsert = Database['public']['Tables']['teacher_verifications']['Insert'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];

export async function checkTeamNameAvailability(teamName: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('teams')
            .select('id')
            .eq('team_name', teamName)
            .single();

        if (error && error.code === 'PGRST116') {
            // No rows returned, team name is available
            return true;
        }

        if (error) {
            console.error('Error checking team name availability:', error);
            throw error;
        }

        // Team name exists
        return false;
    } catch (error) {
        console.error('Error in checkTeamNameAvailability:', error);
        return false;
    }
}

export async function registerTeam(
    teamData: {
        team_name: string;
        school_name: string;
        school_district: string;
        lead_phone: string;
        lead_email: string;
    },
    teamMembers: Array<{
        name: string;
        gender: 'male' | 'female' | 'other';
        grade: '11' | '12';
        phone: string;
        email: string;
        food_preference?: 'veg' | 'non_veg' | 'none';
        is_team_lead?: boolean;
    }>,
    projectDetails: {
        idea_title?: string | null;
        problem_statement?: string | null;
        solution_idea?: string | null;
        implementation_plan?: string | null;
        beneficiaries?: string | null;
        teamwork_contribution?: string | null;
    },
    teacherVerification: {
        salutation: 'sir' | 'maam';
        teacher_name: string;
        teacher_phone: string;
    },
    paymentDetails?: {
        paymentId: string;
        orderId: string;
        signature: string;
    }
): Promise<{ success: boolean; error?: string; teamId?: string }> {
    try {
        // Start a transaction by inserting team first
        const teamRecord: TeamInsert = {
            team_name: teamData.team_name,
            school_name: teamData.school_name,
            school_district: teamData.school_district,
            lead_phone: teamData.lead_phone,
            lead_email: teamData.lead_email,
            registration_status: 'pending',
            payment_status: paymentDetails ? 'completed' : 'pending'
        };

        const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert([teamRecord] as any)
            .select()
            .single();

        if (teamError) {
            throw new Error(`Failed to create team: ${teamError.message}`);
        }

        const teamId = (team as any).id;

        // Generate human-friendly team code and save
        try {
            const normalizedDistrict = teamData.school_district
                .replace(/[^A-Za-z]/g, '')
                .slice(0, 3)
                .toUpperCase();
            const shortId = String(teamId).replace(/-/g, '').slice(0, 6).toUpperCase();
            const teamCode = `GEN201-${normalizedDistrict}-${shortId}`;

            await (supabase as any)
                .from('teams')
                .update({ team_code: teamCode } as any)
                .eq('id', teamId);
        } catch (e) {
            console.warn('Failed to set team_code; continuing without it', e);
        }

        // Insert team members
        const membersToInsert: TeamMemberInsert[] = teamMembers.map(member => ({
            team_id: teamId,
            name: member.name,
            gender: member.gender,
            grade: member.grade,
            phone: member.phone,
            email: member.email,
            food_preference: member.food_preference || 'none',
            is_team_lead: member.is_team_lead || false
        }));

        const { error: membersError } = await supabase
            .from('team_members')
            .insert(membersToInsert as any);

        if (membersError) {
            // Cleanup: delete the team if members insertion fails
            await supabase.from('teams').delete().eq('id', teamId);
            throw new Error(`Failed to add team members: ${membersError.message}`);
        }

        // Insert project details
        const projectRecord: ProjectDetailsInsert = {
            team_id: teamId,
            idea_title: projectDetails.idea_title ?? null,
            problem_statement: projectDetails.problem_statement ?? null,
            solution_idea: projectDetails.solution_idea ?? null,
            implementation_plan: projectDetails.implementation_plan ?? null,
            beneficiaries: projectDetails.beneficiaries ?? null,
            teamwork_contribution: projectDetails.teamwork_contribution ?? null,
        };

        const { error: projectError } = await supabase
            .from('project_details')
            .insert([projectRecord] as any);

        if (projectError) {
            throw new Error(`Failed to save project details: ${projectError.message}`);
        }

        // Insert teacher verification
        const teacherRecord: TeacherVerificationInsert = {
            team_id: teamId,
            salutation: teacherVerification.salutation,
            teacher_name: teacherVerification.teacher_name,
            teacher_phone: teacherVerification.teacher_phone
        };

        const { error: teacherError } = await supabase
            .from('teacher_verifications')
            .insert([teacherRecord] as any);

        if (teacherError) {
            throw new Error(`Failed to save teacher verification: ${teacherError.message}`);
        }

        // Insert payment record if payment details are provided
        if (paymentDetails) {
            // Get dynamic configuration values
            const { getRegistrationFee, getCurrency } = await import('./config');
            const registrationFee = await getRegistrationFee();
            const currency = await getCurrency();

            const paymentRecord: PaymentInsert = {
                team_id: teamId,
                order_id: paymentDetails.orderId,
                payment_id: paymentDetails.paymentId,
                signature: paymentDetails.signature,
                amount: registrationFee, // amount stored in rupees
                currency: currency,
                payment_status: 'completed',
                razorpay_order_id: paymentDetails.orderId
            };

            const { error: paymentError } = await supabase
                .from('payments')
                .insert([paymentRecord] as any);

            if (paymentError) {
                console.error('Failed to save payment details:', paymentError);
                // Don't fail the registration for payment logging issues
            }
        }

        return { success: true, teamId };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}