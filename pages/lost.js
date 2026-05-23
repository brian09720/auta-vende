import Head from 'next/head'

export default function Lost() {
  return (
    <>
      <Head>
        <title>Acceso perdido — Auta</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@300;400&display=swap" rel="stylesheet" />
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

        <div style={{
          position: 'absolute',
          top: '30%', left: '50%',
          transform: 'translateX(-50%)',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,60,60,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ textAlign: 'center', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>

          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '28px',
            fontWeight: '800',
            color: '#fff',
            marginBottom: '12px',
            letterSpacing: '-0.5px'
          }}>
            Acceso perdido
          </h1>

          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.45)',
            lineHeight: '1.7',
            fontWeight: '300',
            marginBottom: '32px'
          }}>
            Se detectó actividad no permitida y tu sesión fue cerrada automáticamente.
            Tu código ya no es válido.
          </p>

          <div style={{
            background: 'rgba(255,60,60,0.08)',
            border: '1px solid rgba(255,60,60,0.2)',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '32px',
            fontSize: '13px',
            color: 'rgba(255,150,150,0.8)',
            lineHeight: '1.6'
          }}>
            Para recuperar el acceso, contactá a quien te compartió este link.
          </div>

          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '20px',
            fontWeight: '800',
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '-0.5px'
          }}>
            auta<span style={{ color: 'rgba(124,58,237,0.4)' }}>.</span>
          </div>
        </div>
      </div>

      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </>
  )
}
