import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Login() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      })
      const data = await res.json()

      if (res.ok) {
        router.push('/preview')
      } else {
        setError(data.error || 'Código inválido')
        setLoading(false)
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const formatCode = (val) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (clean.length > 4) return clean.slice(0, 4) + '-' + clean.slice(4, 8)
    return clean
  }

  return (
    <>
      <Head>
        <title>Auta — Acceso Privado</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#0D0920',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 1
        }}>

          {/* Logo / Brand */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '36px',
              fontWeight: '800',
              color: '#fff',
              letterSpacing: '-1px',
              marginBottom: '8px'
            }}>
              auta<span style={{ color: '#7C3AED' }}>.</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: '300' }}>
              Vista previa privada
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '36px',
            position: 'relative',
            overflow: 'hidden'
          }}>

            {/* Top accent line */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #7C3AED, transparent)'
            }} />

            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '20px',
              fontWeight: '700',
              color: '#fff',
              marginBottom: '8px'
            }}>
              Ingresá tu código
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '28px',
              fontWeight: '300',
              lineHeight: '1.5'
            }}>
              Recibiste un código único para acceder a tu sitio de preview.
            </p>

            {/* Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>Código de acceso</label>
              <input
                type="text"
                placeholder="XXXX-XXXX"
                value={code}
                maxLength={9}
                onChange={(e) => setCode(formatCode(e.target.value))}
                onKeyDown={handleKey}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${error ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '22px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: '700',
                  letterSpacing: '4px',
                  padding: '14px 18px',
                  outline: 'none',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(255,60,60,0.1)',
                border: '1px solid rgba(255,60,60,0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#ff8080',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            {/* Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || code.length < 8}
              style={{
                width: '100%',
                background: loading || code.length < 8 ? 'rgba(124,58,237,0.4)' : '#7C3AED',
                color: '#fff',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: '700',
                fontSize: '15px',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                cursor: loading || code.length < 8 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block'
                  }} />
                  Verificando...
                </>
              ) : 'Ver sitio →'}
            </button>
          </div>

          <p style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.2)'
          }}>
            Este acceso es personal e intransferible
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:focus {
          border-color: rgba(124,58,237,0.6) !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </>
  )
}
