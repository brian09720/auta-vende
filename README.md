# Auta Preview — Sistema de acceso privado

Sistema de vista previa con código único por cliente.

---

## Cómo funciona

1. Vos generás un código desde el panel admin (`/admin`)
2. Le mandás el código al cliente
3. El cliente entra a la URL, ingresa el código → ve el sitio con watermark
4. Si no paga, revocás el código desde el admin → pierde el acceso

---

## Setup en Vercel (5 pasos)

### 1. Subir el proyecto
```
Importá este repositorio desde vercel.com/new
```

### 2. Crear la base de datos KV
- En el dashboard de Vercel → Storage → Create Database → KV
- Dale un nombre (ej: `auta-codes`)
- Conectalo al proyecto → Vercel agrega las variables automáticamente

### 3. Configurar variables de entorno
En Vercel → Settings → Environment Variables, agregá:
```
ADMIN_PASSWORD = (una contraseña segura que solo vos sepas)
```
Las variables de KV las agrega Vercel automáticamente al conectar el storage.

### 4. Copiar el sitio protegido
Reemplazá el archivo `protected/site.html` con tu `Modelo_Auta.html` protegido.

### 5. Deploy
Hacé deploy. Listo.

---

## URLs

| URL | Qué es |
|-----|--------|
| `/` | Login del cliente |
| `/preview` | Vista del sitio (requiere código) |
| `/admin` | Panel de administración |

---

## Flujo del cliente

```
Cliente recibe → entra a tu URL → ingresa código → ve el sitio con watermark
```

El código funciona una sola vez por dispositivo. Si el cliente abre otra pestaña o vuelve más tarde desde el mismo browser, sigue teniendo acceso. Si otro dispositivo intenta usar el mismo código, se deniega.

---

## Revocar acceso

Desde `/admin` → botón "Revocar" → el cliente pierde el acceso inmediatamente.
