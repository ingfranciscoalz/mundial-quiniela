# Quiniela Mundial 2026 - Guía de Setup

## Pasos para poner la app online (gratis)

---

### 1. Configurar Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un nuevo proyecto
2. Cuando el proyecto esté listo, andá a **SQL Editor** (menú izquierdo)
3. Pegá el contenido de `supabase/schema.sql` y hacé click en **Run**
4. Andá a **Project Settings → API** y copiá:
   - `Project URL` → es tu `SUPABASE_URL`
   - `anon/public` key → es tu `SUPABASE_ANON_KEY`

---

### 2. Configurar variables de entorno localmente

Creá un archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

### 3. Instalar dependencias y probar

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

### 4. Deploy en Vercel

1. Subí el proyecto a GitHub (o usá la CLI de Vercel)
2. Entrá a [vercel.com](https://vercel.com) → New Project → importá el repo
3. En la sección **Environment Variables** del deploy, cargá las mismas variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click en **Deploy** → en 1-2 minutos tenés la URL pública

---

## Cómo usar la app

### Tus colegas
- Entran a la URL de Vercel
- Escriben su nombre → entran directo a las predicciones
- Cargan sus pronósticos de los partidos de Argentina y los clasificados de cada grupo
- Ven la tabla de posiciones en tiempo real

### Vos (admin)
- Entrás a `/admin` (ej: `tu-app.vercel.app/admin`)
- Cuando termina un partido, cargás el resultado
- Marcás "Resultado final" → los puntos se calculan automáticamente
- Igual para los grupos cuando terminan

---

## Sistema de puntos

| Predicción | Puntos |
|-----------|--------|
| Resultado exacto de Argentina (ej: 2-0) | **3 pts** |
| Resultado correcto (ganó/empató/perdió) | **1 pt** |
| Equipo clasificado de grupo (1° o 2°) | **1 pt** |

**Máximo por grupo de Argentina (3 partidos):** 9 pts  
**Máximo por otros grupos (11 grupos × 2 pts):** 22 pts  
**Total máximo fase de grupos:** 31 pts

---

## Partidos de Argentina - Grupo J

| Partido | Fecha | Sede |
|---------|-------|------|
| 🇦🇷 Argentina vs 🇩🇿 Argelia | Martes 16 Jun | Arrowhead Stadium, Kansas City |
| 🇦🇷 Argentina vs 🇦🇹 Austria | Lunes 22 Jun | AT&T Stadium, Dallas |
| 🇦🇷 Argentina vs 🇯🇴 Jordania | Sábado 27 Jun | AT&T Stadium, Dallas |
