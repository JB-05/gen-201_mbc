'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
// import { getCachedPaymentInsights } from '@/lib/services/admin-cache';

interface PaymentData {
  id: string;
  team_name: string;
  school_district: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_id: string | null;
  order_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

interface PaymentStats {
  totalRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  averagePaymentTime: number;
  conversionRate: number;
}

// Memoized payment stats card
const PaymentStatsCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  subtitle,
  loading = false 
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  subtitle?: string;
  loading?: boolean;
}) => (
  <Card className="bg-black/20 backdrop-blur-lg border border-[#7303c0]/30 shadow-lg">
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
            : typeof value === 'number' && title.includes('Rate')
            ? `${value.toFixed(1)}%`
            : typeof value === 'number' && title.includes('Time')
            ? `${value.toFixed(1)}m`
            : value
          }
        </div>
      )}
      {subtitle && (
        <p className="text-xs text-[#928dab] mt-1">
          {subtitle}
        </p>
      )}
    </CardContent>
  </Card>
));

PaymentStatsCard.displayName = 'PaymentStatsCard';

// Memoized payment status breakdown card
const PaymentStatusCard = React.memo(({ 
  title, 
  count, 
  amount, 
  color, 
  icon: Icon,
  loading = false 
}: {
  title: string;
  count: number;
  amount: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) => (
  <Card className={`bg-black/30 backdrop-blur-sm border-${color}-500`}>
    <CardHeader>
      <CardTitle className={`text-${color}-400 flex items-center gap-2`}>
        <Icon className="w-5 h-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-16 bg-[#7303c0]/20" />
          <Skeleton className="h-6 w-20 bg-[#7303c0]/20" />
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold text-white mb-2">
            {count}
          </div>
          <div className={`text-lg text-${color}-400`}>
            ₹{amount.toLocaleString()}
          </div>
        </>
      )}
    </CardContent>
  </Card>
));

PaymentStatusCard.displayName = 'PaymentStatusCard';

// Memoized payment table row
const PaymentTableRow = React.memo(({ payment }: { payment: PaymentData }) => {
  const getPaymentStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const getPaymentStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  }, []);

  return (
    <TableRow className="border-[#7303c0]">
      <TableCell className="font-medium text-white">
        {payment.team_name}
      </TableCell>
      <TableCell className="text-[#928dab]">
        {payment.school_district}
      </TableCell>
      <TableCell>
        <Badge className={`${getPaymentStatusColor(payment.payment_status)} text-white flex items-center gap-1 w-fit`}>
          {getPaymentStatusIcon(payment.payment_status)}
          {payment.payment_status}
        </Badge>
      </TableCell>
      <TableCell className="text-[#928dab] font-mono text-sm">
        {payment.payment_id || 'N/A'}
      </TableCell>
      <TableCell className="text-white">
        ₹{payment.amount.toLocaleString()}
      </TableCell>
      <TableCell className="text-[#928dab]">
        {new Date(payment.created_at).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
});

PaymentTableRow.displayName = 'PaymentTableRow';

export function PaymentInsights() {
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    averagePaymentTime: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load payment data
  const loadPaymentData = useCallback(async () => {
    try {
      // Load payment records
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          teams (team_name, school_district)
        `)
        .order('created_at', { ascending: false }) as {
          data: Array<{
            id: string;
            team_id: string;
            order_id: string;
            payment_id: string | null;
            signature: string | null;
            amount: number;
            currency: string;
            payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
            payment_method: string | null;
            razorpay_order_id: string | null;
            failure_reason: string | null;
            created_at: string;
            updated_at: string;
            teams: {
              team_name: string;
              school_district: string;
            } | null;
          }> | null;
          error: any;
        };

      if (paymentsError) throw paymentsError;

      const formattedPayments = payments?.map(payment => ({
        id: payment.id,
        team_name: payment.teams?.team_name || 'Unknown Team',
        school_district: payment.teams?.school_district || 'Unknown District',
        payment_status: payment.payment_status,
        payment_id: payment.payment_id,
        order_id: payment.order_id,
        amount: payment.amount, // stored in rupees
        created_at: payment.created_at,
        updated_at: payment.updated_at,
      })) || [];

      setPaymentData(formattedPayments);

      // Calculate payment stats directly
      const paymentsList = payments || [];
      const completedPayments = paymentsList.filter(p => p.payment_status === 'completed');
      const pendingPayments = paymentsList.filter(p => p.payment_status === 'pending');
      const failedPayments = paymentsList.filter(p => p.payment_status === 'failed');
      
      const totalRevenue = completedPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
      const conversionRate = paymentsList.length > 0 ? (completedPayments.length / paymentsList.length) * 100 : 0;
      
      setPaymentStats({
        totalRevenue,
        completedPayments: completedPayments.length,
        pendingPayments: pendingPayments.length,
        failedPayments: failedPayments.length,
        averagePaymentTime: 0, // This would need more complex calculation
        conversionRate,
      });

    } catch (error) {
      console.error('Error loading payment data:', error);
      toast.error('Failed to load payment insights');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentData();
  }, [loadPaymentData]);

  // Memoized export handler
  const exportPaymentData = useCallback(() => {
    const headers = [
      'Team Name', 'District', 'Payment Status', 'Payment ID', 'Order ID', 
      'Amount', 'Created Date', 'Completed Date'
    ];

    const csvData = paymentData.map(payment => [
      payment.team_name,
      payment.school_district,
      payment.payment_status,
      payment.payment_id || '',
      payment.order_id,
      payment.amount.toFixed(2),
      new Date(payment.created_at).toLocaleString(),
      payment.payment_status === 'completed' ? new Date(payment.updated_at).toLocaleString() : ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gen201_payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [paymentData]);

  // Memoized stats cards data
  const statsCards = useMemo(() => [
    {
      title: 'Total Revenue',
      value: paymentStats.totalRevenue,
      icon: CreditCard,
      iconColor: 'text-green-500',
      subtitle: `From ${paymentStats.completedPayments} payments`
    },
    {
      title: 'Conversion Rate',
      value: paymentStats.conversionRate,
      icon: TrendingUp,
      iconColor: 'text-[#7303c0]',
      subtitle: 'Payment success rate'
    },
    {
      title: 'Pending Payments',
      value: paymentStats.pendingPayments,
      icon: AlertCircle,
      iconColor: 'text-yellow-500',
      subtitle: 'Awaiting completion'
    },
    {
      title: 'Avg. Payment Time',
      value: paymentStats.averagePaymentTime,
      icon: CheckCircle,
      iconColor: 'text-green-500',
      subtitle: 'Time to complete'
    }
  ], [paymentStats]);

  // Memoized status breakdown cards
  const statusCards = useMemo(() => [
    {
      title: 'Completed Payments',
      count: paymentStats.completedPayments,
      amount: paymentStats.totalRevenue,
      color: 'green',
      icon: CheckCircle
    },
    {
      title: 'Pending Payments',
      count: paymentStats.pendingPayments,
      amount: paymentStats.pendingPayments * 50, // Assuming 50 rupees per payment
      color: 'yellow',
      icon: AlertCircle
    },
    {
      title: 'Failed Payments',
      count: paymentStats.failedPayments,
      amount: paymentStats.failedPayments * 50, // Assuming 50 rupees per payment
      color: 'red',
      icon: AlertCircle
    }
  ], [paymentStats]);

  if (loading) {
    return (
      <Card className="bg-black/20 backdrop-blur-lg border border-[#7303c0]/30 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64 bg-[#7303c0]/20" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full bg-[#7303c0]/20" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-32 w-full bg-[#7303c0]/20" />
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
      {/* Payment Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <PaymentStatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconColor={card.iconColor}
            subtitle={card.subtitle}
            loading={loading}
          />
        ))}
      </div>

      {/* Payment Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {statusCards.map((card, index) => (
          <PaymentStatusCard
            key={index}
            title={card.title}
            count={card.count}
            amount={card.amount}
            color={card.color}
            icon={card.icon}
            loading={loading}
          />
        ))}
      </div>

      {/* Payment Records Table */}
      <Card className="bg-black/20 backdrop-blur-lg border border-[#7303c0]/30 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl text-white">Payment Records</CardTitle>
            <Button
              onClick={exportPaymentData}
              className="bg-[#7303c0] hover:bg-[#928dab] text-white flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[#7303c0]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#7303c0]">
                  <TableHead className="text-[#928dab]">Team Name</TableHead>
                  <TableHead className="text-[#928dab]">District</TableHead>
                  <TableHead className="text-[#928dab]">Status</TableHead>
                  <TableHead className="text-[#928dab]">Payment ID</TableHead>
                  <TableHead className="text-[#928dab]">Amount</TableHead>
                  <TableHead className="text-[#928dab]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentData.map((payment) => (
                  <PaymentTableRow
                    key={payment.id}
                    payment={payment}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {paymentData.length === 0 && (
            <div className="text-center py-8 text-[#928dab]">
              No payment records found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
