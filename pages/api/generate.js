import { createCode } from '../../lib/kv'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const adminPass = req.headers['x-admin-password']
  if (adminPass !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  const { clientName } = req.body
  if (!clientName || clientName.trim().length < 2) {
    return res.status(400).json({ error: 'Ingresá el nombre del cliente' })
  }

  try {
    const result = await createCode(clientName.trim())
    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al generar código' })
  }
}
