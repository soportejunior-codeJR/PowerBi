# 🔍 DEBUG: Filtro de Ciudad en Gráficas

## Problema
Las gráficas de cursos no son dinámicas cuando se selecciona una ciudad (los datos no cambian).

## Checklist de Diagnóstico

### PASO 1: Verificar datos en Supabase
```sql
-- Ejecutar en Supabase SQL Editor
SELECT 
  grupo_ciudad,
  COUNT(*) as total_cursos,
  SUM(matriculados) as total_matriculados
FROM v_curso_completion_por_ciudad
WHERE cohorte = '2026' AND programa = 'jc'
GROUP BY grupo_ciudad;
```

**Resultado esperado:** 9 filas (BAQ, BOG, CAL, CTG, GYL, MED, PAN, QTO, UY) con datos no vacíos.

---

### PASO 2: Abrir Navegador y ver Console
1. Abre https://classy-pasca-eecdd6.netlify.app (o http://localhost:3001 local)
2. Abre **Consola** (F12 → Console)
3. Selecciona una ciudad (ej: "Bogotá")
4. Busca mensaje que empieza con: `🔍 DEBUG cursosPorCiudadFiltrados`

**Copia la salida y revisa:**

```
ciudadElegida: "BOG"  ✓ (debe ser código de ciudad)
programa: "jc"       ✓
cohorte: "2026"      ✓
datosDisponibles: X  → ¿Cuántos datos hay en `v_curso_completion_por_ciudad`?
filtrados: Y         → ¿Cuántos coinciden después de filtrar?
ciudadesenDatos: []  → ¿Qué códigos de ciudad hay en los datos?
```

---

### PASO 3: Interpretar Resultados

**Caso A: `filtrados: 0` pero `datosDisponibles > 0`**
- ❌ El filtro no encontró coincidencias
- **Causa probable:** Los códigos de `grupo_ciudad` no coinciden
- **Solución:** Ver PASO 4

**Caso B: `filtrados > 0` pero gráfica vacía**
- ✓ Los datos se están filtrando bien
- ❌ El problema está en cómo se pasan al gráfico
- **Causa probable:** Transformación de datos incorrecta
- **Solución:** Ver PASO 5

**Caso C: `datosDisponibles: 0`**
- ❌ La vista Supabase no está trayendo datos
- **Causa probable:** Vista vacía o RLS bloqueando
- **Solución:** Ejecutar PASO 1 en Supabase

---

### PASO 4: Depuración de Códigos de Ciudad

Si `filtrados: 0` pero hay datos disponibles:

**En Console, ejecuta:**
```javascript
// Simula lo que hace el filtro
const ciudadElegida = "BOG";  // La que seleccionaste
const cohorte = "2026";
const programa = "jc";

// Busca un JSON en localStorage (si está disponible) o en Network tab
// Ver si las propiedades coinciden exactamente
console.log('Buscando:', { grupo_ciudad: ciudadElegida, programa, cohorte });
```

**Problemas comunes:**
- `"BOG"` vs `"Bogotá"` (código vs nombre)
- `"jc"` vs `"Jóvenes creaTIvos"` 
- Espacios en blanco al inicio/final
- Mayúsculas inconsistentes

---

### PASO 5: Verificar Transformación de Datos

Si `filtrados > 0` pero gráfica vacía:

**En la línea 425-430 de app/page.tsx:**
```typescript
cursosPorCiudadFiltrados.map((c) => ({
  curso: c.curso,
  completados: c.completados,
  en_progreso: Math.max(0, (c.matriculados ?? 0) - (c.completados ?? 0)),
  sin_iniciar: 0,
}))
```

**Problemas potenciales:**
- `c.curso` es `undefined`
- `c.matriculados` o `c.completados` son `null`
- El `map()` genera errores silenciosos

**Solución:** Modificar el map para ser más defensivo:
```typescript
cursosPorCiudadFiltrados.map((c) => ({
  curso: c.curso ?? 'Sin nombre',
  completados: Number(c.completados ?? 0),
  en_progreso: Math.max(0, Number(c.matriculados ?? 0) - Number(c.completados ?? 0)),
  sin_iniciar: 0,
}))
```

---

## Quick Fixes Propuestos

### FIX 1: Si el problema es que `pct_completados` es string
Ya está arreglado en `lib/api.ts` - interfaz actualizada a `string | number | null`.

### FIX 2: Si el problema es que el componente no actualiza
Verificar que `ciudadElegida` esté en las dependencias del useMemo (línea 146):
```typescript
[datos, programa, cohorte, ciudadElegida, cursosProg]
```
Debe tener `ciudadElegida` ✓

### FIX 3: Si hay inconsistencia de códigos de ciudad
Normalizar en el frontend en línea 141-144:
```typescript
const ciudadCodigo = ciudadElegida?.toUpperCase() ?? null;
return datos.cursosPorCiudad?.filter(
  (c) => c.programa === programa && 
         c.cohorte === cohorte && 
         c.grupo_ciudad?.toUpperCase() === ciudadCodigo
) ?? [];
```

---

## Instrucciones para Usuario

1. **Abre la consola** (F12)
2. **Selecciona una ciudad** en el filtro
3. **Copia el DEBUG log** que aparece en Console
4. **Comparte el output** conmigo
5. Yo diré exactamente qué está fallando

**Consola esperada:**
```
🔍 DEBUG cursosPorCiudadFiltrados: {
  ciudadElegida: "BOG",
  programa: "jc",
  cohorte: "2026",
  datosDisponibles: 63,      ← Hay 63 cursos en total
  filtrados: 7,               ← 7 coinciden con "BOG"
  primerosRegistros: [...]   ← Muestra los primeros
  ciudadesenDatos: [ 'BAQ', 'BOG', 'CAL', 'CTG', 'GYL', 'MED', 'PAN', 'QTO', 'UY' ]
}
```

Si ves `filtrados: 7` pero la gráfica está vacía → problema es en la transformación.
Si ves `filtrados: 0` → problema es en los códigos de ciudad.

---

## Contacto
Si el debug no muestra el mensaje, la vista Supabase podría estar vacía. Ejecuta PASO 1 en Supabase.
