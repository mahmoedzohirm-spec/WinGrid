import type { NextApiRequest, NextApiResponse } from 'next'
import { logout } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await logout()

    return res.status(200).json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}
