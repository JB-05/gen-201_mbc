export interface TeamMember {
    name: string;
    gender: 'male' | 'female' | 'other';
    grade: '11' | '12';
    phone: string;
    email: string;
    foodPreference?: 'veg' | 'non-veg' | 'none';
}

export interface TeacherVerification {
    salutation: 'sir' | 'maam';
    name: string;
    phone: string;
}

export interface ProjectDetails {
    ideaTitle: string;
    problemStatement: string;
    solutionIdea: string;
    implementationPlan: string;
    beneficiaries: string;
    teamworkContribution: string;
    termsAccepted: boolean;
}

export interface RegistrationFormData {
    teamName: string;
    school: string;
    district: string;
    teamLead: TeamMember;
    teamMembers: TeamMember[];
    teacherVerification: TeacherVerification;
    projectDetails: ProjectDetails;
}