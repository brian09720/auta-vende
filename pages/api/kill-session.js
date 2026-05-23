import { validateSession, getCode, kv } from '../../lib/kv'
import { serialize } from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.cookies?.auta_session
  if (!token) return res.status(200).json({ ok: true })

  try {
    const session = await validateSession(token)

    if (session) {
      await kv.del(`session:${token}`)
      const codeData = await getCode(session.code)
      if (codeData) {
        await kv.set(`code:${session.code}`, JSON.stringify({
          ...codeData,
          active: false,
          killedAt: new Date().toISOString(),
          killedReason: req.body?.reason || 'suspicious_activity'
        }))
      }
    }

    res.setHeader('Set-Cookie', serialize('auta_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0)
    }))

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error' })
  }
}
