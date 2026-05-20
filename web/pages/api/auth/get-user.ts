import type { NextApiRequest, NextApiResponse } from 'next'
import { getCurrentUser } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userData = await getCurrentUser()

    if (!userData) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      })
    }

    return res.status(200).json({
      success: true,
      ...userData,
    })
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}
