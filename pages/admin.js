import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')

  const [codes, setCodes] = useState([])
  const [clientName, setClientName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [newCode, setNewCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const headers = {
    'Content-Type': 'application/json',
    'x-admin-password': password
  }

  const login = async () => {
    setAuthError('')
    const res = await fetch('/api/codes', { headers: { 'x-admin-password': password } })
    if (res.ok) {
      setAuthed(true)
      const data = await res.json()
      setCodes(data)
    } else {
      setAuthError('Contraseña incorrecta')
    }
  }

  const loadCodes = async () => {
    setLoading(true)
    const res = await fetch('/api/codes', { headers })
    if (res.ok) setCodes(await res.json())
    setLoading(false)
  }

  const generate = async () => {
    if (!clientName.trim()) return
    setGenerating(true)
    setNewCode(null)
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ clientName: clientName.trim() })
    })
    const data = await res.json()
    if (res.ok) {
      setNewCode(data.code)
      setClientName('')
      loadCodes()
    }
    setGenerating(false)
  }

  const revoke = async (code) => {
    if (!confirm(`¿Revocar el código ${code}? El cliente ya no podrá acceder.`)) return
    const res = await fetch('/api/revoke', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, action: 'revoke' })
    })
    if (res.ok) {
      setMsg(`Código ${code} revocado`)
      loadCodes()
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const reactivate = async (code) => {
    if (!confirm(`¿Reactivar el código ${code}? El cliente podrá usarlo de nuevo una vez.`)) return
    const res = await fetch('/api/revoke', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, action: 'reactivate' })
    })
    if (res.ok) {
      setMsg(`Código ${code} reactivado — ya puede usarse de nuevo`)
      loadCodes()
      setTimeout(() => setMsg(''), 4000)
    }
  }

  const remove = async (code) => {
    if (!confirm(`¿Eliminar el código ${code} permanentemente?`)) return
    const res = await fetch('/api/revoke', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, action: 'delete' })
    })
    if (res.ok) {
      setMsg(`Código ${code} eliminado`)
      loadCodes()
      setTimeout(() => setMsg(''), 3000)
    }
  }

  // ── Estilos compartidos ──
  const s = {
    input: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '10px',
      color: '#fff',
      fontSize: '15px',
      fontFamily: "'Inter', sans-serif",
      padding: '12px 16px',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box'
    },
    btn: (color = '#7C3AED', disabled = false) => ({
      background: disabled ? 'rgba(124,58,237,0.3)' : color,
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      padding: '12px 20px',
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: '700',
      fontSize: '14px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      whiteSpace: 'nowrap'
    }),
    card: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '24px'
    }
  }

  if (!authed) {
    return (
      <>
        <Head><title>Auta Admin</title></Head>
        <div style={{ minHeight: '100vh', background: '#0D0920', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
          <div style={{ width: '100%', maxWidth: '360px', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: '800', color: '#fff' }}>
                auta<span style={{ color: '#7C3AED' }}>.</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '6px' }}>Panel de administración</p>
            </div>
            <div style={s.card}>
              <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                placeholder="••••••••"
                style={{ ...s.input, marginBottom: '16px' }}
              />
              {authError && <p style={{ color: '#ff8080', fontSize: '13px', marginBottom: '12px' }}>{authError}</p>}
              <button onClick={login} style={{ ...s.btn(), width: '100%' }}>Entrar</button>
            </div>
          </div>
        </div>
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input:focus { border-color: rgba(124,58,237,0.6) !important; }`}</style>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Auta Admin — Códigos</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#0D0920', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '40px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                auta<span style={{ color: '#7C3AED' }}>.</span> admin
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '4px' }}>Gestión de accesos de clientes</p>
            </div>
            <button onClick={loadCodes} style={s.btn('rgba(255,255,255,0.08)')}>↻ Actualizar</button>
          </div>

          {/* Mensaje de acción */}
          {msg && (
            <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', marginBottom: '24px', color: '#c4b5fd' }}>
              ✓ {msg}
            </div>
          )}

          {/* Generar nuevo código */}
          <div style={s.card}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '18px' }}>
              Generar nuevo código
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
                placeholder="Nombre del cliente (ej: Juan Pérez)"
                style={s.input}
              />
              <button
                onClick={generate}
                disabled={generating || !clientName.trim()}
                style={s.btn('#7C3AED', generating || !clientName.trim())}
              >
                {generating ? 'Generando...' : '+ Generar'}
              </button>
            </div>

            {newCode && (
              <div style={{
                marginTop: '16px',
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.35)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Código generado</p>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: '800', letterSpacing: '4px', color: '#c4b5fd' }}>{newCode}</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(newCode); setMsg('Código copiado al portapapeles') }}
                  style={s.btn('rgba(124,58,237,0.3)')}
                >
                  Copiar
                </button>
              </div>
            )}
          </div>

          {/* Tabla de códigos */}
          <div style={s.card}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '18px' }}>
              Códigos activos ({codes.length})
            </h2>

            {loading && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Cargando...</p>}

            {!loading && codes.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No hay códigos generados todavía.</p>
            )}

            {codes.map(c => (
              <div key={c.code} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr auto',
                gap: '16px',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: '700', letterSpacing: '2px' }}>{c.code}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{c.clientName}</p>
                </div>

                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: !c.active ? 'rgba(255,80,80,0.15)' : c.used ? 'rgba(124,58,237,0.2)' : 'rgba(80,255,120,0.12)',
                    color: !c.active ? '#ff8080' : c.used ? '#c4b5fd' : '#80ffaa',
                    border: `1px solid ${!c.active ? 'rgba(255,80,80,0.3)' : c.used ? 'rgba(124,58,237,0.4)' : 'rgba(80,255,120,0.25)'}`
                  }}>
                    {!c.active ? 'Revocado' : c.used ? 'En uso' : 'Disponible'}
                  </span>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                    {c.used && c.usedAt ? `Usado ${new Date(c.usedAt).toLocaleDateString('es-AR')}` : `Creado ${new Date(c.createdAt).toLocaleDateString('es-AR')}`}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Reactivar: aparece si el código fue usado o revocado */}
                  {(!c.active || c.used) && (
                    <button onClick={() => reactivate(c.code)} style={{ ...s.btn('rgba(80,200,120,0.15)'), fontSize: '12px', padding: '8px 12px', color: '#80ffaa' }}>
                      ↺ Reactivar
                    </button>
                  )}
                  {c.active && !c.used && (
                    <button onClick={() => revoke(c.code)} style={{ ...s.btn('rgba(255,160,0,0.2)'), fontSize: '12px', padding: '8px 12px', color: '#ffcc44' }}>
                      Revocar
                    </button>
                  )}
                  <button onClick={() => remove(c.code)} style={{ ...s.btn('rgba(255,60,60,0.15)'), fontSize: '12px', padding: '8px 12px', color: '#ff8080' }}>
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input:focus { border-color: rgba(124,58,237,0.6) !important; }`}</style>
    </>
  )
}
