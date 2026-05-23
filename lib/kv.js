import { Redis } from '@upstash/redis'

// Vercel conectó Upstash con prefijo UPSTASH → variables: UPSTASH_REDIS_URL y UPSTASH_REDIS_TOKEN
const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_TOKEN,
})

import { randomUUID } from 'crypto'

export function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let p1 = '', p2 = ''
  for (let i = 0; i < 4; i++) p1 += chars[Math.floor(Math.random() * chars.length)]
  for (let i = 0; i < 4; i++) p2 += chars[Math.floor(Math.random() * chars.length)]
  return `${p1}-${p2}`
}

export async function createCode(clientName) {
  const code = generateCode()
  const data = {
    clientName,
    used: false,
    usedAt: null,
    deviceToken: null,
    createdAt: new Date().toISOString(),
    active: true
  }
  await kv.set(`code:${code}`, JSON.stringify(data))
  return { code, ...data }
}

export async function getCode(code) {
  const raw = await kv.get(`code:${code}`)
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}

export async function activateCode(code) {
  const data = await getCode(code)
  if (!data || !data.active || data.used) return null
  const deviceToken = randomUUID()
  const updated = { ...data, used: true, usedAt: new Date().toISOString(), deviceToken }
  await kv.set(`code:${code}`, JSON.stringify(updated))
  await kv.set(`session:${deviceToken}`, JSON.stringify({
    clientName: data.clientName,
    code,
    createdAt: new Date().toISOString()
  }))
  return { deviceToken, clientName: data.clientName }
}

export async function validateSession(deviceToken) {
  if (!deviceToken) return null
  const raw = await kv.get(`session:${deviceToken}`)
  if (!raw) return null
  const session = typeof raw === 'string' ? JSON.parse(raw) : raw
  const codeData = await getCode(session.code)
  if (!codeData || !codeData.active) return null
  return session
}

export async function listCodes() {
  const keys = await kv.keys('code:*')
  if (!keys || keys.length === 0) return []
  const results = []
  for (const key of keys) {
    const raw = await kv.get(key)
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    results.push({ code: key.replace('code:', ''), ...data })
  }
  return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function revokeCode(code) {
  const data = await getCode(code)
  if (!data) return false
  if (data.deviceToken) await kv.del(`session:${data.deviceToken}`)
  await kv.set(`code:${code}`, JSON.stringify({ ...data, active: false }))
  return true
}

export async function deleteCode(code) {
  const data = await getCode(code)
  if (!data) return false
  if (data.deviceToken) await kv.del(`session:${data.deviceToken}`)
  await kv.del(`code:${code}`)
  return true
}

export { kv }
