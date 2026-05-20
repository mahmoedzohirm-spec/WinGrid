import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data } = await supabase.from('settings').select('*').limit(1).single()
      return res.status(200).json({ success: true, data })
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message })
    }
  }

  if (req.method === 'POST') {
    try {
      const { card_price, total_cards } = req.body
      const { data } = await supabase.from('settings').upsert({ card_price, total_cards }, { onConflict: 'draw_id' })
      return res.status(200).json({ success: true, data })
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message })
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}
