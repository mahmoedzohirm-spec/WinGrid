import { supabase } from '../db/supabaseClient';

export interface OrdersReportParams {
  fromDate?: string;
  toDate?: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

export interface PaymentsReportParams {
  fromDate?: string;
  toDate?: string;
  status?: 'success' | 'failed' | 'pending';
  method?: string;
}

export class ReportingService {
  /**
   * الحصول على تقرير الطلبات مع إحصائيات تفصيلية
   */
  static async getOrdersReport(params: OrdersReportParams) {
    try {
      let query = supabase.from('orders').select('*');

      if (params.fromDate) {
        query = query.gte('created_at', params.fromDate);
      }
      if (params.toDate) {
        query = query.lte('created_at', params.toDate);
      }
      if (params.status) {
        query = query.eq('status', params.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      const orders = data || [];
      const total = orders.length;
      const completed = orders.filter(o => o.status === 'completed').length;
      const pending = orders.filter(o => o.status === 'pending').length;
      const cancelled = orders.filter(o => o.status === 'cancelled').length;

      const totalAmount = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      return {
        success: true,
        summary: {
          total,
          completed,
          pending,
          cancelled,
          totalAmount,
          completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
        },
        orders,
        generatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * الحصول على تقرير المدفوعات
   */
  static async getPaymentsReport(params: PaymentsReportParams) {
    try {
      let query = supabase.from('payments').select('*');

      if (params.fromDate) {
        query = query.gte('created_at', params.fromDate);
      }
      if (params.toDate) {
        query = query.lte('created_at', params.toDate);
      }
      if (params.status) {
        query = query.eq('status', params.status);
      }
      if (params.method) {
        query = query.eq('payment_method', params.method);
      }

      const { data, error } = await query;

      if (error) throw error;

      const payments = data || [];
      const total = payments.length;
      const successful = payments.filter(p => p.status === 'success').length;
      const failed = payments.filter(p => p.status === 'failed').length;
      const pending = payments.filter(p => p.status === 'pending').length;

      const totalAmount = payments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      return {
        success: true,
        summary: {
          total,
          successful,
          failed,
          pending,
          totalAmount,
          successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : 0,
          averageAmount: total > 0 ? (totalAmount / successful).toFixed(2) : 0,
        },
        payments,
        generatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * الحصول على تقرير الفائزين بالسحب
   */
  static async getWinnersReport() {
    try {
      const { data, error } = await supabase
        .from('lottery_winners')
        .select('*, lottery:lottery_id(*), user:user_id(*)');

      if (error) throw error;

      const winners = data || [];
      const totalWinners = winners.length;

      // حساب إجمالي الجوائز المعطاة
      const totalPrizeAmount = winners.reduce((sum, w) => sum + (w.prize_amount || 0), 0);

      // عدد السحبات المختلفة
      const lotteries = new Set(winners.map(w => w.lottery_id)).size;

      return {
        success: true,
        summary: {
          totalWinners,
          lotteries,
          totalPrizeAmount,
          averagePrizePerWinner: totalWinners > 0 ? (totalPrizeAmount / totalWinners).toFixed(2) : 0,
        },
        winners,
        generatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * الحصول على تقرير نشاط المستخدمين
   */
  static async getUsersActivityReport() {
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, full_name, role, created_at, updated_at');

      if (usersError) throw usersError;

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, created_at');

      if (ordersError) throw ordersError;

      const usersList = users || [];
      const ordersList = orders || [];

      // حساب عدد الطلبات لكل مستخدم
      const userActivity = usersList.map(user => {
        const userOrders = ordersList.filter(o => o.user_id === user.id);
        return {
          ...user,
          ordersCount: userOrders.length,
          lastOrderDate: userOrders.length > 0 
            ? new Date(Math.max(...userOrders.map(o => new Date(o.created_at).getTime()))).toISOString()
            : null,
        };
      });

      const admins = userActivity.filter(u => u.role === 'admin').length;
      const players = userActivity.filter(u => u.role === 'player').length;
      const activeUsers = userActivity.filter(u => u.ordersCount > 0).length;

      return {
        success: true,
        summary: {
          totalUsers: usersList.length,
          admins,
          players,
          activeUsers,
          inactiveUsers: usersList.length - activeUsers,
          totalOrders: ordersList.length,
          averageOrdersPerUser: usersList.length > 0 ? (ordersList.length / usersList.length).toFixed(2) : 0,
        },
        users: userActivity,
        generatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * الحصول على تقرير شامل (ملخص جميع التقارير)
   */
  static async getComprehensiveReport() {
    try {
      const [
        ordersReport,
        paymentsReport,
        winnersReport,
        usersReport,
      ] = await Promise.all([
        this.getOrdersReport({}),
        this.getPaymentsReport({}),
        this.getWinnersReport(),
        this.getUsersActivityReport(),
      ]);

      return {
        success: true,
        data: {
          orders: ordersReport,
          payments: paymentsReport,
          winners: winnersReport,
          users: usersReport,
        },
        generatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * تصدير التقرير إلى CSV
   */
  static generateCSVFromOrders(orders: any[]): string {
    if (orders.length === 0) return 'No data available';

    const headers = Object.keys(orders[0]);
    const csvContent = [
      headers.join(','),
      ...orders.map(order =>
        headers.map(header => {
          const value = order[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      ),
    ].join('\n');

    return csvContent;
  }
}
