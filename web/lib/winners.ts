import { supabase } from './supabase'
import { Winner } from '@/types'

// ===== جلب الفائزين =====
export const getWinners = async (): Promise<Winner[]> => {
  try {
    const { data, error } = await supabase
      .from('winners')
      .select(`
        *,
        users (id, full_name),
        cards (card_number)
      `)
      .order('announced_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  } catch (error: any) {
    console.error('Error fetching winners:', error)
    throw new Error('فشل في جلب الفائزين')
  }
}

// ===== سحب الفائز بشكل عشوائي =====
export const drawWinner = async (drawId: string): Promise<Winner | null> => {
  try {
    // 1. جلب جميع البطاقات المباعة
    const { data: soldCards, error: cardsError } = await supabase
      .from('cards')
      .select('id, user_id')
      .eq('status', 'sold')
      .not('user_id', 'is', null)

    if (cardsError) throw new Error(cardsError.message)
    if (!soldCards || soldCards.length === 0) {
      throw new Error('لا توجد بطاقات مباعة للسحب')
    }

    // 2. اختيار بطاقة عشوائية
    const randomCard = soldCards[Math.floor(Math.random() * soldCards.length)]

    // 3. إنشاء سجل الفائز
    const { data: winner, error: winnerError } = await supabase
      .from('winners')
      .insert({
        draw_id: drawId,
        card_id: randomCard.id,
        user_id: randomCard.user_id,
        prize: 'الجائزة الكبرى', // يمكن تغييرها حسب الحاجة
      })
      .select()
      .single()

    if (winnerError) throw new Error(winnerError.message)

    return winner as Winner
  } catch (error: any) {
    console.error('Error drawing winner:', error)
    throw new Error('فشل في السحب: ' + error.message)
  }
}

// ===== الحصول على إحصائيات السحب =====
export const getDrawStats = async () => {
  try {
    const { count: totalWinners, error: winnersError } = await supabase
      .from('winners')
      .select('*', { count: 'exact', head: true })

    const { count: totalDraws, error: drawsError } = await supabase
      .from('draws')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    if (winnersError || drawsError) {
      throw new Error('فشل في جلب الإحصائيات')
    }

    return {
      totalWinners: totalWinners || 0,
      totalDraws: totalDraws || 0,
    }
  } catch (error: any) {
    console.error('Error fetching draw stats:', error)
    throw new Error('فشل في جلب إحصائيات السحب')
  }
}
