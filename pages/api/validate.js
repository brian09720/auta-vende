import { getCode, activateCode } from '../../lib/kv'
import { serialize } from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'Ingresá un código' })

  const clean = code.trim().toUpperCase()

  try {
    const codeData = await getCode(clean)

    if (!codeData)          return res.status(401).json({ error: 'Código inválido' })
    if (!codeData.active)   return res.status(401).json({ error: 'Este código fue revocado' })
    if (codeData.used)      return res.status(401).json({ error: 'Este código ya fue utilizado' })

    const result = await activateCode(clean)
    if (!result) return res.status(401).json({ error: 'No se pudo activar el código' })

    // ── Cookie SIN maxAge = session cookie (muere al cerrar el browser) ──
    const cookie = serialize('auta_session', result.deviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
      // SIN maxAge → se borra al cerrar el browser
    })

    res.setHeader('Set-Cookie', cookie)
    return res.status(200).json({ ok: true, clientName: result.clientName })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error del servidor' })
  }
}
