import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

// تقرير مبيعات بسيط
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // تحقق أن المستخدم مصرح (بسيط هنا - لاحقاً استخدم مصادقة Admin)
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // إجمالي المبيعات والإيرادات
    const { count: totalOrdersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
    const { data: revenueData } = await supabase.rpc('total_revenue')

    // المشتريون الأكثر (top buyers)
    const { data: topBuyers } = await supabase
      .from('orders')
      .select('user_id, sum:total_price')
      .group('user_id')
      .order('sum', { ascending: false })
      .limit(10)

    return res.status(200).json({
      success: true,
      totalOrders: totalOrdersCount || 0,
      revenue: revenueData || null,
      topBuyers: topBuyers || [],
    })
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}
