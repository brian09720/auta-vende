import { revokeCode, deleteCode, getCode, kv } from '../../lib/kv'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const adminPass = req.headers['x-admin-password']
  if (adminPass !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  const { code, action } = req.body
  if (!code) return res.status(400).json({ error: 'Falta el código' })

  try {
    if (action === 'delete') {
      await deleteCode(code)
      return res.status(200).json({ ok: true, message: 'Código eliminado' })

    } else if (action === 'reactivate') {
      const data = await getCode(code)
      if (!data) return res.status(404).json({ error: 'Código no encontrado' })
      if (data.deviceToken) await kv.del(`session:${data.deviceToken}`)
      await kv.set(`code:${code}`, JSON.stringify({
        ...data,
        used: false,
        usedAt: null,
        deviceToken: null,
        active: true,
        reactivatedAt: new Date().toISOString()
      }))
      return res.status(200).json({ ok: true, message: `Código ${code} reactivado` })

    } else {
      await revokeCode(code)
      return res.status(200).json({ ok: true, message: 'Código revocado' })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al procesar' })
  }
}
