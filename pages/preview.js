import Head from 'next/head'
import { validateSession } from '../lib/kv'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

export async function getServerSideProps({ req, res }) {
  const token = req.cookies?.auta_session
  if (!token) return { redirect: { destination: '/', permanent: false } }

  const session = await validateSession(token)
  if (!session) {
    res.setHeader('Set-Cookie', 'auta_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly')
    return { redirect: { destination: '/', permanent: false } }
  }

  return { props: { clientName: session.clientName } }
}

export default function Preview({ clientName }) {
  const router = useRouter()
  const killed = useRef(false)

  const killSession = async (reason) => {
    if (killed.current) return
    killed.current = true
    try {
      await fetch('/api/kill-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
        keepalive: true
      })
    } catch {}
    router.replace('/lost')
  }

  useEffect(() => {
    // ── 1. BLOQUEO DE TECLADO ──
    const onKey = (e) => {
      const key = e.key
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      // F12
      if (key === 'F12') { e.preventDefault(); killSession('f12'); return }
      // Ctrl+U (view source)
      if (ctrl && key === 'u') { e.preventDefault(); killSession('view_source'); return }
      // Ctrl+Shift+I/J/C (devtools)
      if (ctrl && shift && ['i','I','j','J','c','C'].includes(key)) { e.preventDefault(); killSession('devtools_shortcut'); return }
      // Ctrl+S (guardar)
      if (ctrl && key === 's') { e.preventDefault(); killSession('save_attempt'); return }
      // Ctrl+A (seleccionar todo)
      if (ctrl && key === 'a') { e.preventDefault(); return }
    }
    document.addEventListener('keydown', onKey, true)

    // ── 2. BLOQUEO DE CLIC DERECHO ──
    const onContext = (e) => { e.preventDefault(); return false }
    document.addEventListener('contextmenu', onContext, true)

    // ── 3. BLOQUEO DE COPY / SELECT ──
    const block = (e) => e.preventDefault()
    document.addEventListener('copy', block, true)
    document.addEventListener('cut', block, true)
    document.addEventListener('selectstart', block, true)
    document.addEventListener('dragstart', block, true)

    // ── 4. DETECCIÓN DE DEVTOOLS (tamaño de ventana) ──
    const checkDevTools = () => {
      const threshold = 160
      const w = window.outerWidth - window.innerWidth
      const h = window.outerHeight - window.innerHeight
      if (w > threshold || h > threshold) {
        killSession('devtools_open')
      }
    }
    const devToolsInterval = setInterval(checkDevTools, 800)

    // ── 5. DETECCIÓN POR DEBUGGER ──
    const debuggerCheck = setInterval(() => {
      const start = performance.now()
      // eslint-disable-next-line no-debugger
      debugger
      const end = performance.now()
      if (end - start > 150) killSession('debugger_detected')
    }, 2000)

    // ── 6. VISIBILIDAD (cambio de pestaña largo = sospechoso) ──
    let hiddenSince = null
    const onVisibility = () => {
      if (document.hidden) {
        hiddenSince = Date.now()
      } else {
        hiddenSince = null
      }
    }
    // No matamos por cambio de pestaña (puede ser normal), solo registramos
    document.addEventListener('visibilitychange', onVisibility)

    // ── 7. BEFOREUNLOAD - avisar que la sesión se cierra ──
    const onUnload = () => {
      // La cookie session se borra sola (no tiene maxAge)
      // No necesitamos hacer nada extra
    }
    window.addEventListener('beforeunload', onUnload)

    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('contextmenu', onContext, true)
      document.removeEventListener('copy', block, true)
      document.removeEventListener('cut', block, true)
      document.removeEventListener('selectstart', block, true)
      document.removeEventListener('dragstart', block, true)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', onUnload)
      clearInterval(devToolsInterval)
      clearInterval(debuggerCheck)
    }
  }, [])

  return (
    <>
      <Head>
        <title>Auta — Vista Previa</title>
      </Head>

      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

        {/* Iframe con el sitio protegido */}
        <iframe
          src="/api/content"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          sandbox="allow-scripts allow-same-origin allow-forms"
          title="Vista previa"
        />

        {/* ── WATERMARK ── */}
        <div aria-hidden="true" style={{
          position: 'fixed', inset: 0,
          pointerEvents: 'none', zIndex: 9999,
          overflow: 'hidden', userSelect: 'none'
        }}>
          {Array.from({ length: 60 }).map((_, i) => {
            const row = Math.floor(i / 6)
            const col = i % 6
            return (
              <div key={i} style={{
                position: 'absolute',
                left: `${col * 18 - 5}%`,
                top: `${row * 14 - 5}%`,
                transform: 'rotate(-30deg)',
                whiteSpace: 'nowrap',
                fontFamily: 'Arial, sans-serif',
                fontSize: '13px',
                fontWeight: '700',
                letterSpacing: '2px',
                color: 'rgba(124, 58, 237, 0.12)',
                textTransform: 'uppercase'
              }}>
                PREVIEW — {clientName.toUpperCase()}
              </div>
            )
          })}
        </div>

        {/* ── BADGE ── */}
        <div style={{
          position: 'fixed', top: '12px', right: '12px', zIndex: 10000,
          background: 'rgba(13,9,32,0.85)',
          border: '1px solid rgba(124,58,237,0.4)',
          borderRadius: '999px', padding: '6px 14px',
          display: 'flex', alignItems: 'center', gap: '8px',
          backdropFilter: 'blur(8px)', pointerEvents: 'none'
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#7C3AED', animation: 'pulse 2s infinite'
          }} />
          <span style={{
            fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '700',
            color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em'
          }}>
            Vista previa · {clientName}
          </span>
        </div>

      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow: hidden; background: #0D0920; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </>
  )
}
