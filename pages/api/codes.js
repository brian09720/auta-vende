import { listCodes } from '../../lib/kv'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const adminPass = req.headers['x-admin-password']
  if (adminPass !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  try {
    const codes = await listCodes()
    return res.status(200).json(codes)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al listar códigos' })
  }
}
