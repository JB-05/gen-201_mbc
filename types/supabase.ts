export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            admins: {
                Row: {
                    id: string
                    auth_user_id: string
                    name: string
                    email: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    auth_user_id: string
                    name: string
                    email: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    auth_user_id?: string
                    name?: string
                    email?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            payments: {
                Row: {
                    id: string
                    team_id: string
                    order_id: string
                    payment_id: string | null
                    signature: string | null
                    amount: number
                    currency: string
                    payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
                    payment_method: string | null
                    razorpay_order_id: string | null
                    failure_reason: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    team_id: string
                    order_id: string
                    payment_id?: string | null
                    signature?: string | null
                    amount?: number
                    currency?: string
                    payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
                    payment_method?: string | null
                    razorpay_order_id?: string | null
                    failure_reason?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    team_id?: string
                    order_id?: string
                    payment_id?: string | null
                    signature?: string | null
                    amount?: number
                    currency?: string
                    payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
                    payment_method?: string | null
                    razorpay_order_id?: string | null
                    failure_reason?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            project_details: {
                Row: {
                    id: string
                    team_id: string
                    idea_title: string | null
                    problem_statement: string | null
                    solution_idea: string | null
                    implementation_plan: string | null
                    beneficiaries: string | null
                    teamwork_contribution: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    team_id: string
                    idea_title?: string | null
                    problem_statement?: string | null
                    solution_idea?: string | null
                    implementation_plan?: string | null
                    beneficiaries?: string | null
                    teamwork_contribution?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    team_id?: string
                    idea_title?: string | null
                    problem_statement?: string | null
                    solution_idea?: string | null
                    implementation_plan?: string | null
                    beneficiaries?: string | null
                    teamwork_contribution?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            teacher_verifications: {
                Row: {
                    id: string
                    team_id: string
                    salutation: 'sir' | 'maam'
                    teacher_name: string
                    teacher_phone: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    team_id: string
                    salutation: 'sir' | 'maam'
                    teacher_name: string
                    teacher_phone: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    team_id?: string
                    salutation?: 'sir' | 'maam'
                    teacher_name?: string
                    teacher_phone?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            team_members: {
                Row: {
                    id: string
                    team_id: string
                    name: string
                    gender: 'male' | 'female' | 'other'
                    grade: '11' | '12'
                    phone: string
                    email: string
                    food_preference: 'veg' | 'non_veg' | 'none'
                    is_team_lead: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    team_id: string
                    name: string
                    gender: 'male' | 'female' | 'other'
                    grade: '11' | '12'
                    phone: string
                    email: string
                    food_preference?: 'veg' | 'non_veg' | 'none'
                    is_team_lead?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    team_id?: string
                    name?: string
                    gender?: 'male' | 'female' | 'other'
                    grade?: '11' | '12'
                    phone?: string
                    email?: string
                    food_preference?: 'veg' | 'non_veg' | 'none'
                    is_team_lead?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            team_status_logs: {
                Row: {
                    id: string
                    team_id: string
                    admin_id: string
                    old_status: 'pending' | 'shortlisted' | 'rejected' | 'verified' | null
                    new_status: 'pending' | 'shortlisted' | 'rejected' | 'verified'
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    team_id: string
                    admin_id: string
                    old_status?: 'pending' | 'shortlisted' | 'rejected' | 'verified' | null
                    new_status: 'pending' | 'shortlisted' | 'rejected' | 'verified'
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    team_id?: string
                    admin_id?: string
                    old_status?: 'pending' | 'shortlisted' | 'rejected' | 'verified' | null
                    new_status?: 'pending' | 'shortlisted' | 'rejected' | 'verified'
                    comment?: string | null
                    created_at?: string
                }
            }
            teams: {
                Row: {
                    id: string
                    team_name: string
                    school_name: string
                    school_district: string
                    lead_phone: string
                    lead_email: string
                    registration_status: 'pending' | 'shortlisted' | 'rejected' | 'verified'
                    payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
                    teacher_verified: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    team_name: string
                    school_name: string
                    school_district: string
                    lead_phone: string
                    lead_email: string
                    registration_status?: 'pending' | 'shortlisted' | 'rejected' | 'verified'
                    payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
                    teacher_verified?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    team_name?: string
                    school_name?: string
                    school_district?: string
                    lead_phone?: string
                    lead_email?: string
                    registration_status?: 'pending' | 'shortlisted' | 'rejected' | 'verified'
                    payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
                    teacher_verified?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            configuration: {
                Row: {
                    id: string
                    key: string
                    value: string
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    key: string
                    value: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    key?: string
                    value?: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            districts: {
                Row: {
                    id: string
                    name: string
                    is_active: boolean
                    display_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    is_active?: boolean
                    display_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    is_active?: boolean
                    display_order?: number
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_admin_dashboard_stats: {
                Args: {}
                Returns: {
                    total_registrations: number
                    pending_registrations: number
                    shortlisted_registrations: number
                    rejected_registrations: number
                    verified_registrations: number
                    total_revenue: number
                }[]
            }
            get_teams_with_member_count: {
                Args: {}
                Returns: {
                    id: string
                    team_name: string
                    school_name: string
                    school_district: string
                    lead_email: string
                    lead_phone: string
                    registration_status: string
                    payment_status: string
                    created_at: string
                    member_count: number
                }[]
            }
            get_district_insights: {
                Args: {}
                Returns: {
                    district: string
                    total_teams: number
                    total_schools: number
                    pending_teams: number
                    shortlisted_teams: number
                    rejected_teams: number
                    verified_teams: number
                }[]
            }
        }
        Enums: {
            food_preference_type: 'veg' | 'non_veg' | 'none'
            gender_type: 'male' | 'female' | 'other'
            grade_type: '11' | '12'
            payment_status_type: 'pending' | 'completed' | 'failed' | 'refunded'
            registration_status_type: 'pending' | 'shortlisted' | 'rejected' | 'verified'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never