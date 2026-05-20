import type { NextApiRequest, NextApiResponse } from 'next'
import { userLogin } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    const result = await userLogin(email, password)

    return res.status(200).json({
      success: true,
      user: result.user,
      session: result.session,
      profile: result.profile,
    })
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: error.message,
      code: error.code,
    })
  }
}
