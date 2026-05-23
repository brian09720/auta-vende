import { validateSession } from '../../lib/kv'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  const token = req.cookies?.auta_session

  if (!token) {
    return res.status(401).send('<h1>Sin acceso</h1>')
  }

  try {
    const session = await validateSession(token)
    if (!session) {
      return res.status(401).send('<h1>Sesión inválida</h1>')
    }

    const filePath = path.join(process.cwd(), 'protected', 'site.html')

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('<h1>Sitio no encontrado</h1>')
    }

    const html = fs.readFileSync(filePath, 'utf-8')

    // No cachear nunca
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('X-Robots-Tag', 'noindex, nofollow')
    return res.status(200).send(html)

  } catch (err) {
    console.error(err)
    return res.status(500).send('<h1>Error</h1>')
  }
}
