import type { NextApiRequest, NextApiResponse } from 'next'
import { userRegister } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, passwordConfirm, fullName, phone } = req.body

    const result = await userRegister(email, password, passwordConfirm, fullName, phone)

    return res.status(201).json({
      success: true,
      message: result.message,
      user: result.user,
    })
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: error.code,
    })
  }
}
