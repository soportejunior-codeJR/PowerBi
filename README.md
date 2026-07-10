# Panel de Datos — Fundación ROFÉ / Jóvenes creaTIvos

Dashboard público de estadísticas agregadas (cursos, emprendimiento, demografía).
**Sin PII:** consume exclusivamente vistas de agregados de Supabase vía anon key + RLS.

## Stack

- **Next.js 14** (App Router) con `output: 'export'` → sitio 100% estático
- **Tailwind CSS** con la paleta oficial ROFÉ (Manual de Identidad 2025)
- **Recharts** para gráficos
- **Supabase** (proyecto `panel-datos-rofe`) — datos sincronizados diariamente
  desde Q10 por n8n (repo de automatizaciones, proceso `panel-datos-etl`)

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # genera out/ (export estático)
```

## Deploy (Netlify)

1. Conectar este repo en Netlify → "Import from Git".
2. La configuración viene de `netlify.toml` (build `npm run build`, publish `out`).
3. Sin variables de entorno obligatorias: el anon key (público por diseño) tiene
   default en `lib/api.ts`; se puede sobreescribir con `NEXT_PUBLIC_SUPABASE_URL`
   y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Seguridad

- El frontend solo conoce el **anon key** — RLS de Supabase limita la lectura a
  vistas de agregados (`v_*`) y `cohorte_stats`. Las filas individuales de
  `participants` están bloqueadas.
- La **service_role/secret key jamás** debe aparecer en este repo.

## Fuente de datos

| Vista | Tab |
|---|---|
| `cohorte_stats` | KPIs Resumen |
| `v_curso_completion` | Resumen + Cursos |
| `v_emprendimiento_situacion` / `v_emprendimiento_vs_cursos` | Emprendimiento |
| `v_demografia_grupo` / `v_edad_distribucion` | Demografía |

Documentación completa del proceso: repo de automatizaciones →
`docs/procesos/panel-datos-etl.md`.
