'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RegistrationsTable } from './RegistrationsTable';
import { DistrictInsights } from './DistrictInsights';
import { StatusManagement } from './StatusManagement';
import { PaymentInsights } from './PaymentInsights';
import { LogOut, Users, MapPin, CreditCard, Settings } from 'lucide-react';
import { toast } from 'sonner';
// import { getCachedDashboardStats, invalidateAdminCache } from '@/lib/services/admin-cache';

interface DashboardStats {
  totalRegistrations: number;
  pendingRegistrations: number;
  shortlistedRegistrations: number;
  rejectedRegistrations: number;
  verifiedRegistrations: number;
  teacherVerifiedCount: number;
  totalRevenue: number;
}

// Memoized stats card component
const StatsCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  loading = false 
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  loading?: boolean;
}) => (
  <Card className="bg-black/20 backdrop-blur-lg border border-[#7303c0]/40 shadow-lg shadow-[#7303c0]/10 hover:shadow-xl hover:shadow-[#7303c0]/20 transition-all duration-300 rounded-xl">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-[#928dab]">
        {title}
      </CardTitle>
      <Icon className={`h-4 w-4 ${iconColor}`} />
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-8 w-16 bg-[#7303c0]/20" />
      ) : (
        <div className="text-2xl font-bold text-white">
          {typeof value === 'number' && title.includes('Revenue') 
            ? `₹${value.toLocaleString()}` 
            : value
          }
        </div>
      )}
    </CardContent>
  </Card>
));

StatsCard.displayName = 'StatsCard';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    pendingRegistrations: 0,
    shortlistedRegistrations: 0,
    rejectedRegistrations: 0,
    verifiedRegistrations: 0,
    teacherVerifiedCount: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registrations');

  // Memoized stats refresh function
  const loadDashboardStats = useCallback(async () => {
    try {
      
      // Direct queries without cache
      const [
        { count: totalRegistrations, error: totalError },
        { count: pendingRegistrations, error: pendingError },
        { count: shortlistedRegistrations, error: shortlistedError },
        { count: rejectedRegistrations, error: rejectedError },
        { count: verifiedRegistrations, error: verifiedError },
        { count: teacherVerifiedCount, error: teacherError },
        { data: payments, error: paymentsError }
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


        setStats({
        totalRegistrations: totalRegistrations || 0,
        pendingRegistrations: pendingRegistrations || 0,
        shortlistedRegistrations: shortlistedRegistrations || 0,
        rejectedRegistrations: rejectedRegistrations || 0,
        verifiedRegistrations: verifiedRegistrations || 0,
        teacherVerifiedCount: teacherVerifiedCount || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized stats change handler
  const handleStatsChange = useCallback(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  // Memoized sign out handler
  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Failed to sign out');
      } else {
        toast.success('Signed out successfully');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  }, []);

  // Memoized tab change handler
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Memoized stats cards data
  const statsCards = useMemo(() => [
    {
      title: 'Total Registrations',
      value: stats.totalRegistrations,
      icon: Users,
      iconColor: 'text-[#7303c0]'
    },
    {
      title: 'Pending Review',
      value: stats.pendingRegistrations,
      icon: Settings,
      iconColor: 'text-yellow-500'
    },
    {
      title: 'Shortlisted',
      value: stats.shortlistedRegistrations,
      icon: Users,
      iconColor: 'text-green-500'
    },
    {
      title: 'Teacher Verified',
      value: stats.teacherVerifiedCount,
      icon: Settings,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      icon: CreditCard,
      iconColor: 'text-green-500'
    }
  ], [stats]);

  // Memoized tab configuration
  const tabConfig = useMemo(() => [
    {
      value: 'registrations',
      icon: Users,
      title: 'Registrations',
      subtitle: 'Manage Teams'
    },
    {
      value: 'districts',
      icon: MapPin,
      title: 'District Insights',
      subtitle: 'Regional Data'
    },
    {
      value: 'status',
      icon: Settings,
      title: 'Status Management',
      subtitle: 'Review & Update'
    },
    {
      value: 'payments',
      icon: CreditCard,
      title: 'Payment Insights',
      subtitle: 'Financial Overview'
    }
  ], []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#928dab]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-[#7303c0]/50 shadow-lg shadow-[#7303c0]/10">
        <div className="bg-gradient-to-r from-transparent via-[#7303c0]/5 to-transparent">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-8 bg-gradient-to-b from-[#7303c0] to-[#928dab] rounded-full"></div>
                <h1 className="text-2xl font-orbitron gradient-text font-bold tracking-wider">
                  GEN 201 Admin Dashboard
                </h1>
              </div>
              <Button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm border border-red-400/30 shadow-lg hover:shadow-red-500/20 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <StatsCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              iconColor={card.iconColor}
              loading={loading}
            />
          ))}
        </div>

        {/* Main Dashboard Tabs */}
        <div className="bg-gradient-to-br from-black/5 via-[#7303c0]/5 to-black/10 backdrop-blur-2xl border border-[#7303c0]/20 rounded-3xl p-8 shadow-2xl shadow-[#7303c0]/15">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <TabsList className="grid grid-cols-4 col-span-full bg-transparent p-0 gap-4 h-auto">
                {tabConfig.map((tab) => (
                <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                  className="group relative overflow-hidden bg-black/20 backdrop-blur-lg border border-[#7303c0]/30 rounded-2xl p-6 h-auto flex flex-col items-center gap-3 hover:border-[#7303c0]/60 hover:shadow-lg hover:shadow-[#7303c0]/20 transition-all duration-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#7303c0]/20 data-[state=active]:via-[#928dab]/15 data-[state=active]:to-[#7303c0]/10 data-[state=active]:border-[#7303c0] data-[state=active]:shadow-2xl data-[state=active]:shadow-[#7303c0]/30 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#7303c0]/10 via-transparent to-[#928dab]/10 opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-500"></div>
                    <tab.icon className="w-8 h-8 text-[#7303c0] group-data-[state=active]:text-white transition-colors duration-300" />
                  <div className="text-center relative z-10">
                      <div className="font-semibold text-white group-data-[state=active]:text-white">{tab.title}</div>
                      <div className="text-xs text-[#928dab] group-data-[state=active]:text-white/80 mt-1">{tab.subtitle}</div>
                  </div>
                </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="registrations" className="bg-gradient-to-br from-black/10 via-black/5 to-black/15 backdrop-blur-2xl border border-[#7303c0]/25 rounded-2xl p-8 shadow-2xl shadow-[#7303c0]/10 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              {activeTab === 'registrations' && <RegistrationsTable onStatsChange={handleStatsChange} />}
            </TabsContent>

            <TabsContent value="districts" className="bg-gradient-to-br from-black/10 via-black/5 to-black/15 backdrop-blur-2xl border border-[#7303c0]/25 rounded-2xl p-8 shadow-2xl shadow-[#7303c0]/10 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              {activeTab === 'districts' && <DistrictInsights />}
            </TabsContent>

            <TabsContent value="status" className="bg-gradient-to-br from-black/10 via-black/5 to-black/15 backdrop-blur-2xl border border-[#7303c0]/25 rounded-2xl p-8 shadow-2xl shadow-[#7303c0]/10 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              {activeTab === 'status' && <StatusManagement onStatsChange={handleStatsChange} />}
            </TabsContent>

            <TabsContent value="payments" className="bg-gradient-to-br from-black/10 via-black/5 to-black/15 backdrop-blur-2xl border border-[#7303c0]/25 rounded-2xl p-8 shadow-2xl shadow-[#7303c0]/10 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              {activeTab === 'payments' && <PaymentInsights />}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
